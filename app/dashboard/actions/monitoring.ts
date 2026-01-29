'use server'

import { createClient } from '@/lib/supabase/server'

export async function getActiveCompetition() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('status', 'active')
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

export async function getParticipationStats(competitionId: string) {
  const supabase = await createClient()
  
  // Get unique participants
  const { data: submissions } = await supabase
    .from('submissions')
    .select('user_id')
    .eq('competition_id', competitionId)
  
  const uniqueParticipants = new Set(submissions?.map(s => s.user_id) || [])
  
  // Get total submissions
  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', competitionId)
  
  // Get total questions
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', competitionId)
    .eq('is_active', true)
  
  return {
    participants: uniqueParticipants.size,
    submissions: totalSubmissions || 0,
    questions: totalQuestions || 0,
    completionRate: totalQuestions && uniqueParticipants.size 
      ? ((totalSubmissions || 0) / (totalQuestions * uniqueParticipants.size) * 100).toFixed(1)
      : 0
  }
}

export async function getGradingDistribution(competitionId: string) {
  const supabase = await createClient()
  
  const { data: submissions } = await supabase
    .from('submissions')
    .select('auto_result, final_result')
    .eq('competition_id', competitionId)
  
  if (!submissions) {
    return {
      autoCorrect: 0,
      autoIncorrect: 0,
      needsReview: 0,
      manuallyReviewed: 0
    }
  }
  
  const autoCorrect = submissions.filter(s => s.auto_result === 'correct').length
  const autoIncorrect = submissions.filter(s => s.auto_result === 'incorrect').length
  const needsReview = submissions.filter(s => !s.final_result).length
  const manuallyReviewed = submissions.filter(s => s.final_result && s.auto_result !== s.final_result).length
  
  return {
    autoCorrect,
    autoIncorrect,
    needsReview,
    manuallyReviewed
  }
}

export async function getRecentActivity(competitionId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      user:student_participants!submissions_user_id_fkey(username, display_name),
      question:questions(question_text)
    `)
    .eq('competition_id', competitionId)
    .order('submitted_at', { ascending: false })
    .limit(limit)
  
  return submissions || []
}
