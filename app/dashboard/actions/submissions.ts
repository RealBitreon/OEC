'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface SubmissionFilters {
  competition_id?: string
  participant_name?: string
  status?: 'pending' | 'under_review' | 'approved' | 'rejected'
  search?: string
}

export async function getSubmissions(filters: SubmissionFilters = {}, page = 1, limit = 20) {
  const supabase = await createClient()
  
  let query = supabase
    .from('submissions')
    .select(`
      *,
      competition:competitions(id, title)
    `, { count: 'exact' })
    .order('submitted_at', { ascending: false })
  
  if (filters.competition_id) {
    query = query.eq('competition_id', filters.competition_id)
  }
  
  if (filters.participant_name) {
    query = query.eq('participant_name', filters.participant_name)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.search) {
    query = query.or(`participant_name.ilike.%${filters.search}%,participant_email.ilike.%${filters.search}%`)
  }
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await query.range(from, to)
  
  if (error) {
    console.error('Error fetching submissions:', error)
    return { submissions: [], total: 0, pages: 0 }
  }
  
  return {
    submissions: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit)
  }
}

export async function reviewSubmission(
  submissionId: string,
  status: 'approved' | 'rejected',
  notes?: string
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
    .select('*')
    .eq('id', submissionId)
    .single()
  
  if (fetchError || !submission) {
    throw new Error('الإجابة غير موجودة')
  }
  
  // Update submission
  const { error } = await supabase
    .from('submissions')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
      review_notes: notes || null
    })
    .eq('id', submissionId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'submission_reviewed',
    details: { 
      submission_id: submissionId, 
      status,
      notes: notes || null
    }
  })
  
  revalidatePath('/dashboard')
}

export async function bulkReview(
  submissionIds: string[],
  status: 'approved' | 'rejected'
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
  
  // Update all submissions
  const { error } = await supabase
    .from('submissions')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId
    })
    .in('id', submissionIds)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'bulk_review',
    details: { 
      count: submissionIds.length,
      status
    }
  })
  
  revalidatePath('/dashboard')
}

export async function getSubmissionStats(competitionId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('submissions')
    .select('status, score, total_questions', { count: 'exact' })
  
  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }
  
  const { data, count } = await query
  
  const pending = data?.filter(s => s.status === 'pending').length || 0
  const underReview = data?.filter(s => s.status === 'under_review').length || 0
  const approved = data?.filter(s => s.status === 'approved').length || 0
  const rejected = data?.filter(s => s.status === 'rejected').length || 0
  
  // Calculate average score
  const totalScore = data?.reduce((sum, s) => sum + (s.score || 0), 0) || 0
  const totalPossible = data?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0
  const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
  
  return {
    total: count || 0,
    pending,
    underReview,
    approved,
    rejected,
    averageScore
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
