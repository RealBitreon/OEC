// Submissions data layer - handles all submission database operations
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Submission } from '../core/types'
import { ValidationError } from '../core/validation'
import { getUserProfile } from '../lib/auth'

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
    .select(
      `
      *,
      user:student_participants!submissions_user_id_fkey(id, username, display_name),
      question:questions(id, question_text, correct_answer, type, source_ref),
      competition:competitions(id, title)
    `,
      { count: 'exact' }
    )
    .order('submitted_at', { ascending: false })

  if (filters.competition_id) query = query.eq('competition_id', filters.competition_id)
  if (filters.user_id) query = query.eq('user_id', filters.user_id)
  if (filters.status === 'needs_review') query = query.is('final_result', null)
  if (filters.status === 'reviewed') query = query.not('final_result', 'is', null)

  const from = (page - 1) * limit
  const { data, error, count } = await query.range(from, from + limit - 1)

  if (error) throw new Error(error.message)

  let filteredData = data || []
  if (filters.status === 'no_correct_answer') {
    filteredData = filteredData.filter(s => !s.question?.correct_answer)
  }

  return {
    submissions: filteredData,
    total: filters.status === 'no_correct_answer' ? filteredData.length : count || 0,
    pages: Math.ceil(
      (filters.status === 'no_correct_answer' ? filteredData.length : count || 0) / limit
    ),
  }
}

export async function reviewSubmission(
  submissionId: string,
  finalResult: 'correct' | 'incorrect'
): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('user_id, competition_id')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) throw new Error('الإجابة غير موجودة')

  const { error } = await supabase
    .from('submissions')
    .update({
      final_result: finalResult,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'submission_reviewed',
    details: { submission_id: submissionId, final_result: finalResult },
  })

  revalidatePath('/dashboard')
}

export async function bulkReview(
  submissionIds: string[],
  finalResult: 'correct' | 'incorrect'
): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { error } = await supabase
    .from('submissions')
    .update({
      final_result: finalResult,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .in('id', submissionIds)

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'bulk_review',
    details: { count: submissionIds.length, final_result: finalResult },
  })

  revalidatePath('/dashboard')
}

export async function getSubmissionStats(competitionId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('submissions')
    .select('final_result, question:questions(correct_answer)', { count: 'exact' })

  if (competitionId) query = query.eq('competition_id', competitionId)

  const { data, count } = await query

  const needsReview = data?.filter(s => !s.final_result).length || 0
  const reviewed = data?.filter(s => s.final_result).length || 0
  const noCorrectAnswer =
    data?.filter(s => {
      const question = Array.isArray(s.question) ? s.question[0] : s.question
      return !question?.correct_answer
    }).length || 0

  return {
    total: count || 0,
    needsReview,
    reviewed,
    noCorrectAnswer,
  }
}
