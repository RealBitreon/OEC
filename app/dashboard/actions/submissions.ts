'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface SubmissionFilters {
  competition_id?: string
  user_id?: string
  status?: 'needs_review' | 'reviewed' | 'no_correct_answer'
  search?: string
}

export async function getSubmissions(filters: SubmissionFilters = {}, page = 1, limit = 20) {
  const supabase = await createClient()
  
  let query = supabase
    .from('submissions')
    .select(`
      *,
      user:student_participants!submissions_user_id_fkey(id, username, display_name),
      question:questions(id, question_text, correct_answer, type, source_ref),
      competition:competitions(id, title)
    `, { count: 'exact' })
    .order('submitted_at', { ascending: false })
  
  if (filters.competition_id) {
    query = query.eq('competition_id', filters.competition_id)
  }
  
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }
  
  if (filters.status === 'needs_review') {
    query = query.is('final_result', null)
  } else if (filters.status === 'reviewed') {
    query = query.not('final_result', 'is', null)
  }
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await query.range(from, to)
  
  if (error) {
    console.error('Error fetching submissions:', error)
    return { submissions: [], total: 0, pages: 0 }
  }
  
  // Filter submissions with no correct answer if requested
  let filteredData = data || []
  if (filters.status === 'no_correct_answer') {
    filteredData = filteredData.filter(s => !s.question?.correct_answer)
  }
  
  return {
    submissions: filteredData,
    total: filters.status === 'no_correct_answer' ? filteredData.length : (count || 0),
    pages: Math.ceil((filters.status === 'no_correct_answer' ? filteredData.length : (count || 0)) / limit)
  }
}

export async function reviewSubmission(
  submissionId: string,
  finalResult: 'correct' | 'incorrect',
  reason?: string
) {
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
  
  // Get submission details
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*, question:questions(correct_answer)')
    .eq('id', submissionId)
    .single()
  
  if (fetchError || !submission) {
    throw new Error('الإجابة غير موجودة')
  }
  
  // Update submission
  const { error } = await supabase
    .from('submissions')
    .update({
      final_result: finalResult,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId
    })
    .eq('id', submissionId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Recalculate tickets for this user in this competition
  await recalculateUserTickets(submission.user_id, submission.competition_id)
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'submission_reviewed',
    details: { 
      submission_id: submissionId, 
      final_result: finalResult,
      reason: reason || null
    }
  })
  
  revalidatePath('/dashboard')
}

export async function bulkReview(
  submissionIds: string[],
  finalResult: 'correct' | 'incorrect'
) {
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
  
  // Get all submissions to recalculate tickets
  const { data: submissions } = await supabase
    .from('submissions')
    .select('user_id, competition_id')
    .in('id', submissionIds)
  
  // Update all submissions
  const { error } = await supabase
    .from('submissions')
    .update({
      final_result: finalResult,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId
    })
    .in('id', submissionIds)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Recalculate tickets for affected users
  if (submissions) {
    const userCompetitions = new Set(
      submissions.map(s => `${s.user_id}:${s.competition_id}`)
    )
    
    for (const uc of userCompetitions) {
      const [user_id, competition_id] = uc.split(':')
      await recalculateUserTickets(user_id, competition_id)
    }
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'bulk_review',
    details: { 
      count: submissionIds.length,
      final_result: finalResult
    }
  })
  
  revalidatePath('/dashboard')
}

async function recalculateUserTickets(userId: string, competitionId: string) {
  const supabase = await createClient()
  
  // Get competition rules
  const { data: competition } = await supabase
    .from('competitions')
    .select('rules')
    .eq('id', competitionId)
    .single()
  
  if (!competition) return
  
  // Get all reviewed submissions for this user
  const { data: submissions } = await supabase
    .from('submissions')
    .select('final_result')
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
  
  // Delete old tickets
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
}

export async function getSubmissionStats(competitionId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('submissions')
    .select('final_result, auto_result, question:questions(correct_answer)', { count: 'exact' })
  
  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }
  
  const { data, count } = await query
  
  const needsReview = data?.filter(s => !s.final_result).length || 0
  const reviewed = data?.filter(s => s.final_result).length || 0
  const noCorrectAnswer = data?.filter(s => {
    const question = Array.isArray(s.question) ? s.question[0] : s.question
    return !question?.correct_answer
  }).length || 0
  
  // Calculate disputed submissions (auto vs manual mismatch)
  const disputed = data?.filter(s => 
    s.auto_result && s.final_result && s.auto_result !== s.final_result
  ).length || 0
  
  // Calculate accuracy stats
  const correct = data?.filter(s => s.final_result === 'correct').length || 0
  const incorrect = data?.filter(s => s.final_result === 'incorrect').length || 0
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0
  
  return {
    total: count || 0,
    needsReview,
    reviewed,
    noCorrectAnswer,
    disputed,
    correct,
    incorrect,
    accuracy
  }
}

export async function allowRetry(submissionId: string) {
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
  
  // Get submission details
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()
  
  if (fetchError || !submission) {
    throw new Error('الإجابة غير موجودة')
  }
  
  // Update submission to allow retry
  const { error } = await supabase
    .from('submissions')
    .update({
      retry_allowed: true
    })
    .eq('id', submissionId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'allow_retry',
    details: { 
      submission_id: submissionId,
      participant_name: submission.participant_name
    }
  })
  
  revalidatePath('/dashboard')
}
