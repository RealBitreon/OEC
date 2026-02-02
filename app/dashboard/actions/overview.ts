'use server'

import { competitionsRepo, questionsRepo } from '@/lib/repos'
import { createClient } from '@/lib/supabase/server'

export async function getOverviewStats() {
  try {
    const supabase = await createClient()
    const competitions = await competitionsRepo.listAll()
    const questions = await questionsRepo.listAll()
    
    // Get submissions count from Supabase directly
    const { count: submissionsCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })

    // Get active competition
    const activeCompetition = competitions.find(c => c.status === 'active')

    // Calculate stats
    const totalCompetitions = competitions.length
    const totalQuestions = questions.length
    const totalSubmissions = submissionsCount || 0

    // Active competition stats
    let activeCompetitionStats = null
    if (activeCompetition) {
      const competitionQuestions = questions.filter(q => q.competitionId === activeCompetition.id)
      
      const { data: competitionSubmissions } = await supabase
        .from('submissions')
        .select('final_result')
        .eq('competition_id', activeCompetition.id)
      
      const pendingSubmissions = competitionSubmissions?.filter(s => s.final_result === undefined || s.final_result === null).length || 0
      const approvedSubmissions = competitionSubmissions?.filter(s => s.final_result === 'correct').length || 0

      activeCompetitionStats = {
        id: activeCompetition.id,
        title: activeCompetition.title,
        slug: activeCompetition.slug,
        totalQuestions: competitionQuestions.length,
        totalSubmissions: competitionSubmissions?.length || 0,
        pendingSubmissions,
        approvedSubmissions,
        startAt: activeCompetition.startAt,
        endAt: activeCompetition.endAt,
      }
    }

    // Recent submissions
    const { data: recentSubmissionsData } = await supabase
      .from('submissions')
      .select('id, user_id, competition_id, submitted_at, final_result')
      .order('submitted_at', { ascending: false })
      .limit(5)
    
    const recentSubmissions = (recentSubmissionsData || []).map(s => ({
      id: s.id,
      participantName: s.user_id,
      competitionId: s.competition_id,
      submittedAt: s.submitted_at,
      status: s.final_result || 'pending',
    }))

    return {
      totalCompetitions,
      totalQuestions,
      totalSubmissions,
      activeCompetition: activeCompetitionStats,
      recentSubmissions,
    }
  } catch (error) {
    console.error('Error getting overview stats:', error)
    throw error
  }
}
