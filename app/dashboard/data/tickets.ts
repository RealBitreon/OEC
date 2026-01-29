// Tickets data layer - handles all ticket database operations
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Ticket } from '../core/types'
import { ValidationError } from '../core/validation'
import { getUserProfile } from '../lib/auth'

export async function getTicketsSummary(competitionId: string) {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select(
      `
      *,
      user:student_participants!tickets_user_id_fkey(id, username, display_name)
    `
    )
    .eq('competition_id', competitionId)

  if (!tickets) {
    return { total: 0, byUser: [], byReason: {} }
  }

  const userMap = new Map<string, { user: any; total: number; sources: any[] }>()

  tickets.forEach(ticket => {
    if (!userMap.has(ticket.user_id)) {
      userMap.set(ticket.user_id, { user: ticket.user, total: 0, sources: [] })
    }

    const entry = userMap.get(ticket.user_id)!
    entry.total += ticket.count
    entry.sources.push({
      reason: ticket.reason,
      count: ticket.count,
      created_at: ticket.created_at,
    })
  })

  const reasonMap = new Map<string, number>()
  tickets.forEach(ticket => {
    reasonMap.set(ticket.reason, (reasonMap.get(ticket.reason) || 0) + ticket.count)
  })

  return {
    total: tickets.reduce((sum, t) => sum + t.count, 0),
    byUser: Array.from(userMap.values()),
    byReason: Object.fromEntries(reasonMap),
  }
}

export async function addManualTickets(
  userId: string,
  competitionId: string,
  count: number,
  reason: string
): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  if (count <= 0) throw new ValidationError('عدد التذاكر يجب أن يكون أكبر من صفر')

  const supabase = await createClient()
  const { data: competition } = await supabase
    .from('competitions')
    .select('rules')
    .eq('id', competitionId)
    .single()

  if (!competition) throw new Error('المسابقة غير موجودة')

  const rules = competition.rules as any
  if (!rules.allowManualAdjustments) {
    throw new ValidationError('التعديلات اليدوية غير مسموحة في هذه المسابقة')
  }

  const { error } = await supabase.from('tickets').insert({
    user_id: userId,
    competition_id: competitionId,
    count,
    reason: `manual: ${reason}`,
  })

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'manual_tickets_added',
    details: { target_user_id: userId, competition_id: competitionId, count, reason },
  })

  revalidatePath('/dashboard')
}

export async function recalculateAllTickets(competitionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { data: submissions } = await supabase
    .from('submissions')
    .select('user_id')
    .eq('competition_id', competitionId)
    .not('final_result', 'is', null)

  if (!submissions) return

  const uniqueUsers = [...new Set(submissions.map(s => s.user_id))]

  for (const user_id of uniqueUsers) {
    await recalculateUserTickets(user_id, competitionId)
  }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'tickets_recalculated',
    details: { competition_id: competitionId, user_count: uniqueUsers.length },
  })

  revalidatePath('/dashboard')
}

export async function recalculateUserTickets(userId: string, competitionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { data: competition } = await supabase
    .from('competitions')
    .select('rules')
    .eq('id', competitionId)
    .single()

  if (!competition) throw new Error('المسابقة غير موجودة')

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

  // Delete old automatic tickets
  await supabase
    .from('tickets')
    .delete()
    .eq('user_id', userId)
    .eq('competition_id', competitionId)
    .eq('reason', 'submissions')

  // Insert new tickets if eligible
  if (ticketCount > 0) {
    await supabase.from('tickets').insert({
      user_id: userId,
      competition_id: competitionId,
      count: ticketCount,
      reason: 'submissions',
    })
  }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'user_tickets_recalculated',
    details: { target_user_id: userId, competition_id: competitionId, ticket_count: ticketCount },
  })

  revalidatePath('/dashboard')
}
