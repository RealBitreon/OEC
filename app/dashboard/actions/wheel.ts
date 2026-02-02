'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function getEligibleStudents(competitionId: string) {
  const supabase = await createClient()
  
  // Get all tickets for this competition
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      user:student_participants!tickets_user_id_fkey(id, username, display_name, class)
    `)
    .eq('competition_id', competitionId)
  
  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }
  
  if (!tickets || tickets.length === 0) {
    return []
  }
  
  // Group by user with enhanced data
  const userMap = new Map<string, { 
    user: any
    totalTickets: number
    sources: Array<{ reason: string; count: number; timestamp?: string }>
    probability: number
  }>()
  
  tickets.forEach(ticket => {
    const userId = ticket.user_id
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        user: ticket.user,
        totalTickets: 0,
        sources: [],
        probability: 0
      })
    }
    
    const entry = userMap.get(userId)!
    entry.totalTickets += ticket.count
    entry.sources.push({
      reason: ticket.reason,
      count: ticket.count,
      timestamp: ticket.created_at
    })
  })
  
  // Calculate probabilities
  const totalTickets = Array.from(userMap.values()).reduce((sum, u) => sum + u.totalTickets, 0)
  userMap.forEach(entry => {
    entry.probability = totalTickets > 0 ? (entry.totalTickets / totalTickets) * 100 : 0
  })
  
  return Array.from(userMap.values())
    .filter(u => u.totalTickets > 0)
    .sort((a, b) => b.totalTickets - a.totalTickets) // Sort by tickets descending
}

export async function lockSnapshot(competitionId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح - يجب تسجيل الدخول')
  }

  // Verify user role
  const { data: user, error: userError } = await supabase
    .from('student_participants')
    .select('role, username')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    throw new Error('فشل التحقق من المستخدم')
  }
  
  if (!['LRC_MANAGER', 'CEO'].includes(user.role)) {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير LRC أو CEO')
  }
  
  // Get eligible students
  const eligible = await getEligibleStudents(competitionId)
  
  if (eligible.length === 0) {
    throw new Error('لا يوجد طلاب مؤهلون للسحب. يجب أن يكون هناك طلاب حصلوا على تذاكر.')
  }
  
  // Check if already locked
  const { data: existing } = await supabase
    .from('wheel_runs')
    .select('id, locked_at')
    .eq('competition_id', competitionId)
    .maybeSingle()
  
  if (existing) {
    throw new Error('تم قفل القائمة مسبقاً في ' + new Date(existing.locked_at).toLocaleString('ar-SA'))
  }
  
  // Create snapshot with metadata
  const totalTickets = eligible.reduce((sum, e) => sum + e.totalTickets, 0)
  const snapshotData = {
    competition_id: competitionId,
    locked_snapshot: eligible,
    locked_at: new Date().toISOString(),
    locked_by: userId,
    snapshot_metadata: {
      total_students: eligible.length,
      total_tickets: totalTickets,
      locked_by_username: user.username,
      timestamp: new Date().toISOString()
    }
  }
  
  const { data, error } = await supabase
    .from('wheel_runs')
    .insert(snapshotData)
    .select()
    .single()
  
  if (error) {
    console.error('Lock snapshot error:', error)
    throw new Error('فشل قفل القائمة: ' + error.message)
  }
  
  // Log audit with detailed info
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'wheel_snapshot_locked',
    details: { 
      competition_id: competitionId,
      eligible_count: eligible.length,
      total_tickets: totalTickets,
      top_candidates: eligible.slice(0, 5).map(e => ({
        username: e.user.username,
        tickets: e.totalTickets
      }))
    }
  })
  
  revalidatePath('/dashboard')
  return data
}

export async function runDraw(competitionId: string, seed?: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح - يجب تسجيل الدخول')
  }

  // Verify user role
  const { data: user, error: userError } = await supabase
    .from('student_participants')
    .select('role, username')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    throw new Error('فشل التحقق من المستخدم')
  }
  
  if (!['LRC_MANAGER', 'CEO'].includes(user.role)) {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير LRC أو CEO')
  }
  
  // Get wheel run
  const { data: wheelRun, error: fetchError } = await supabase
    .from('wheel_runs')
    .select('*')
    .eq('competition_id', competitionId)
    .maybeSingle()
  
  if (fetchError) {
    throw new Error('فشل جلب بيانات العجلة: ' + fetchError.message)
  }
  
  if (!wheelRun) {
    throw new Error('يجب قفل قائمة المرشحين أولاً قبل تنفيذ السحب')
  }
  
  if (wheelRun.winner_id) {
    const runDate = new Date(wheelRun.run_at).toLocaleString('ar-SA')
    throw new Error('تم تنفيذ السحب مسبقاً في ' + runDate)
  }
  
  const eligible = wheelRun.locked_snapshot as any[]
  
  if (!eligible || eligible.length === 0) {
    throw new Error('لا يوجد مرشحون في القائمة المقفلة')
  }
  
  // Enhanced weighted random selection with cryptographic randomness
  const totalTickets = eligible.reduce((sum, e) => sum + e.totalTickets, 0)
  
  // Use crypto for better randomness
  const randomBytes = crypto.randomBytes(4)
  const randomValue = (randomBytes.readUInt32BE(0) / 0xFFFFFFFF) * totalTickets
  
  let cumulative = 0
  let winner = eligible[0]
  let winnerTicketIndex = 0
  
  for (const candidate of eligible) {
    cumulative += candidate.totalTickets
    if (randomValue <= cumulative) {
      winner = candidate
      winnerTicketIndex = Math.floor(randomValue)
      break
    }
  }
  
  // Generate draw hash for verification
  const drawHash = crypto
    .createHash('sha256')
    .update(`${competitionId}-${winner.user.id}-${new Date().toISOString()}-${seed || ''}`)
    .digest('hex')
  
  // Update wheel run with winner and metadata
  const runTimestamp = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('wheel_runs')
    .update({
      winner_id: winner.user.id,
      run_at: runTimestamp,
      run_by: userId,
      draw_metadata: {
        total_tickets: totalTickets,
        random_value: randomValue,
        winner_ticket_index: winnerTicketIndex,
        draw_hash: drawHash,
        run_by_username: user.username,
        timestamp: runTimestamp
      }
    })
    .eq('id', wheelRun.id)
  
  if (updateError) {
    console.error('Update wheel run error:', updateError)
    throw new Error('فشل حفظ نتيجة السحب: ' + updateError.message)
  }
  
  // Log detailed audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'wheel_draw_executed',
    details: { 
      competition_id: competitionId,
      winner_id: winner.user.id,
      winner_username: winner.user.username,
      winner_tickets: winner.totalTickets,
      total_tickets: totalTickets,
      probability: winner.probability,
      draw_hash: drawHash,
      eligible_count: eligible.length
    }
  })
  
  revalidatePath('/dashboard')
  return {
    winner,
    metadata: {
      totalTickets,
      drawHash,
      timestamp: runTimestamp
    }
  }
}

export async function getWheelStatus(competitionId: string) {
  const supabase = await createClient()
  
  const { data: wheelRun } = await supabase
    .from('wheel_runs')
    .select(`
      *,
      winner:student_participants!wheel_runs_winner_id_fkey(id, username, display_name, class)
    `)
    .eq('competition_id', competitionId)
    .single()
  
  return wheelRun
}

export async function publishResults(competitionId: string, settings: {
  isPublished: boolean
  showWinnerName: boolean
  winnerDisplayName?: string
  announcementMessage?: string
}) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح - يجب تسجيل الدخول')
  }

  // Verify user role
  const { data: user, error: userError } = await supabase
    .from('student_participants')
    .select('role, username')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    throw new Error('فشل التحقق من المستخدم')
  }
  
  if (!['LRC_MANAGER', 'CEO'].includes(user.role)) {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير LRC أو CEO')
  }
  
  // Verify wheel run exists and has winner
  const { data: wheelRun } = await supabase
    .from('wheel_runs')
    .select('winner_id')
    .eq('competition_id', competitionId)
    .maybeSingle()
  
  if (!wheelRun || !wheelRun.winner_id) {
    throw new Error('يجب تنفيذ السحب أولاً قبل نشر النتائج')
  }
  
  const { error } = await supabase
    .from('wheel_runs')
    .update({
      is_published: settings.isPublished,
      show_winner_name: settings.showWinnerName,
      winner_display_name: settings.winnerDisplayName || null,
      announcement_message: settings.announcementMessage || null,
      published_at: settings.isPublished ? new Date().toISOString() : null,
      published_by: settings.isPublished ? userId : null
    })
    .eq('competition_id', competitionId)
  
  if (error) {
    console.error('Publish results error:', error)
    throw new Error('فشل نشر النتائج: ' + error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: settings.isPublished ? 'wheel_results_published' : 'wheel_results_unpublished',
    details: { 
      competition_id: competitionId,
      settings,
      published_by_username: user.username
    }
  })
  
  revalidatePath('/dashboard')
  revalidatePath('/wheel')
  revalidatePath(`/competition/${competitionId}/wheel`)
}

export async function resetWheel(competitionId: string, reason: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح - يجب تسجيل الدخول')
  }

  // Verify user role - only CEO can reset
  const { data: user, error: userError } = await supabase
    .from('student_participants')
    .select('role, username')
    .eq('id', userId)
    .single()
  
  if (userError || !user) {
    throw new Error('فشل التحقق من المستخدم')
  }
  
  if (user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات CEO فقط')
  }
  
  if (!reason || reason.trim().length < 10) {
    throw new Error('يجب تقديم سبب واضح لإعادة التعيين (10 أحرف على الأقل)')
  }
  
  // Get current wheel run for audit
  const { data: wheelRun } = await supabase
    .from('wheel_runs')
    .select('*')
    .eq('competition_id', competitionId)
    .maybeSingle()
  
  if (!wheelRun) {
    throw new Error('لا توجد بيانات عجلة لإعادة تعيينها')
  }
  
  // Delete wheel run
  const { error } = await supabase
    .from('wheel_runs')
    .delete()
    .eq('competition_id', competitionId)
  
  if (error) {
    console.error('Reset wheel error:', error)
    throw new Error('فشل إعادة تعيين العجلة: ' + error.message)
  }
  
  // Log critical audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'wheel_reset',
    details: { 
      competition_id: competitionId,
      reason,
      previous_state: wheelRun,
      reset_by_username: user.username,
      timestamp: new Date().toISOString()
    }
  })
  
  revalidatePath('/dashboard')
  revalidatePath('/wheel')
}
