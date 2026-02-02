'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function getTicketsSummary(competitionId: string) {
  const supabase = await createClient()
  
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      user:student_participants!tickets_user_id_fkey(id, username, display_name)
    `)
    .eq('competition_id', competitionId)
  
  if (!tickets) {
    return {
      total: 0,
      byUser: [],
      byReason: {}
    }
  }
  
  // Group by user
  const userMap = new Map<string, { user: any, total: number, sources: any[] }>()
  
  tickets.forEach(ticket => {
    const userId = ticket.user_id
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        user: ticket.user,
        total: 0,
        sources: []
      })
    }
    
    const entry = userMap.get(userId)!
    entry.total += ticket.count
    entry.sources.push({
      reason: ticket.reason,
      count: ticket.count,
      created_at: ticket.created_at
    })
  })
  
  // Group by reason
  const reasonMap = new Map<string, number>()
  tickets.forEach(ticket => {
    const current = reasonMap.get(ticket.reason) || 0
    reasonMap.set(ticket.reason, current + ticket.count)
  })
  
  return {
    total: tickets.reduce((sum, t) => sum + t.count, 0),
    byUser: Array.from(userMap.values()),
    byReason: Object.fromEntries(reasonMap)
  }
}

export async function recalculateAllTickets(competitionId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify user role from database (security check)
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || !['LRC_MANAGER', 'CEO'].includes(user.role)) {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير')
  }
  
  // Get all users with submissions in this competition
  const { data: submissions } = await supabase
    .from('submissions')
    .select('user_id')
    .eq('competition_id', competitionId)
    .not('final_result', 'is', null)
  
  if (!submissions) return
  
  const uniqueUsers = [...new Set(submissions.map(s => s.user_id))]
  
  // Recalculate for each user
  for (const user_id of uniqueUsers) {
    await recalculateUserTickets(user_id, competitionId)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'tickets_recalculated',
    details: { 
      competition_id: competitionId,
      user_count: uniqueUsers.length
    }
  })
  
  revalidatePath('/dashboard')
}

export async function recalculateUserTickets(userId: string, competitionId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const adminId = cookieStore.get('student_id')?.value
  
  if (!adminId) {
    throw new Error('غير مصرح')
  }
  
  // Get competition rules
  const { data: competition } = await supabase
    .from('competitions')
    .select('rules')
    .eq('id', competitionId)
    .single()
  
  if (!competition) {
    throw new Error('المسابقة غير موجودة')
  }
  
  // Get all reviewed submissions for this user
  const { data: submissions } = await supabase
    .from('submissions')
    .select('final_result, submitted_at')
    .eq('user_id', userId)
    .eq('competition_id', competitionId)
    .not('final_result', 'is', null)
  
  if (!submissions) return
  
  const correctCount = submissions.filter(s => s.final_result === 'correct').length
  const rules = competition.rules as any
  
  let ticketCount = 0
  
  // Calculate tickets based on rules
  if (rules.eligibilityMode === 'all_correct') {
    const totalQuestions = submissions.length
    if (correctCount === totalQuestions && totalQuestions > 0) {
      ticketCount = rules.ticketsConfig?.baseTickets || 1
    }
  } else if (rules.eligibilityMode === 'min_correct') {
    if (correctCount >= (rules.minCorrectAnswers || 0)) {
      ticketCount = rules.ticketsConfig?.baseTickets || 1
    }
  } else if (rules.eligibilityMode === 'per_correct') {
    ticketCount = correctCount * (rules.ticketsConfig?.baseTickets || 1)
  }
  
  // Add early submission bonus if applicable
  if (rules.ticketsConfig?.earlyBonusTiers && Array.isArray(rules.ticketsConfig.earlyBonusTiers)) {
    const earliestSubmission = submissions.reduce((earliest, s) => {
      return !earliest || new Date(s.submitted_at) < new Date(earliest.submitted_at) ? s : earliest
    }, null as any)
    
    if (earliestSubmission) {
      const submittedAt = new Date(earliestSubmission.submitted_at)
      
      for (const tier of rules.ticketsConfig.earlyBonusTiers) {
        if (tier.cutoffDate && submittedAt <= new Date(tier.cutoffDate)) {
          ticketCount += tier.bonusTickets || 0
          break
        }
      }
    }
  }
  
  // Delete old automatic tickets
  await supabase
    .from('tickets')
    .delete()
    .eq('user_id', userId)
    .eq('competition_id', competitionId)
    .eq('reason', 'submissions')
  
  // Insert new tickets if eligible
  if (ticketCount > 0) {
    await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        competition_id: competitionId,
        count: ticketCount,
        reason: 'submissions'
      })
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: adminId,
    action: 'user_tickets_recalculated',
    details: { 
      target_user_id: userId,
      competition_id: competitionId,
      ticket_count: ticketCount
    }
  })
  
  revalidatePath('/dashboard')
}

export async function addManualTickets(
  userId: string,
  competitionId: string,
  count: number,
  reason: string
) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const adminId = cookieStore.get('student_id')?.value
  
  if (!adminId) {
    throw new Error('غير مصرح')
  }

  // Verify user role from database (security check)
  const { data: admin } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', adminId)
    .single()
  
  if (!admin || !['LRC_MANAGER', 'CEO'].includes(admin.role)) {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير')
  }
  
  if (count <= 0) {
    throw new Error('عدد التذاكر يجب أن يكون أكبر من صفر')
  }
  
  // Check if manual adjustments are allowed
  const { data: competition } = await supabase
    .from('competitions')
    .select('rules')
    .eq('id', competitionId)
    .single()
  
  if (!competition) {
    throw new Error('المسابقة غير موجودة')
  }
  
  const rules = competition.rules as any
  if (!rules.allowManualAdjustments) {
    throw new Error('التعديلات اليدوية غير مسموحة في هذه المسابقة')
  }
  
  const { error } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      competition_id: competitionId,
      count,
      reason: `manual: ${reason}`
    })
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: adminId,
    action: 'manual_tickets_added',
    details: { 
      target_user_id: userId,
      competition_id: competitionId,
      count,
      reason
    }
  })
  
  revalidatePath('/dashboard')
}
