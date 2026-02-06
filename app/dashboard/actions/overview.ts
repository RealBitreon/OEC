'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function getOverviewStats() {
  try {
    const supabase = createServiceClient()
    
    // Execute all queries in parallel for maximum performance
    const [
      competitionsCount,
      questionsCount,
      submissionsCount,
      activeCompetitionData,
      recentSubmissionsData
    ] = await Promise.all([
      // Count competitions
      supabase
        .from('competitions')
        .select('*', { count: 'exact', head: true }),
      
      // Count questions
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true }),
      
      // Count submissions
      supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true }),
      
      // Get active competition (simple query)
      supabase
        .from('competitions')
        .select('id, title, slug, start_at, end_at')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle(),
      
      // Get recent submissions
      supabase
        .from('submissions')
        .select('id, participant_name, competition_id, submitted_at, status')
        .order('submitted_at', { ascending: false })
        .limit(5)
    ])

    // Process active competition stats
    let activeCompetitionStats = null
    if (activeCompetitionData.data) {
      const comp = activeCompetitionData.data
      
      // Get competition-specific stats in separate queries
      const [questionsCountResult, submissionsResult] = await Promise.all([
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', comp.id),
        supabase
          .from('submissions')
          .select('status')
          .eq('competition_id', comp.id)
      ])
      
      const submissions = submissionsResult.data || []
      
      activeCompetitionStats = {
        id: comp.id,
        title: comp.title,
        slug: comp.slug,
        totalQuestions: questionsCountResult.count || 0,
        totalSubmissions: submissions.length,
        pendingSubmissions: submissions.filter((s: any) => s.status === 'pending').length,
        approvedSubmissions: submissions.filter((s: any) => s.status === 'approved').length,
        startAt: comp.start_at,
        endAt: comp.end_at,
      }
    }

    // Process recent submissions
    const recentSubmissions = (recentSubmissionsData.data || []).map(s => ({
      id: s.id,
      participantName: s.participant_name,
      competitionId: s.competition_id,
      submittedAt: s.submitted_at,
      status: s.status || 'pending',
    }))

    return {
      totalCompetitions: competitionsCount.count || 0,
      totalQuestions: questionsCount.count || 0,
      totalSubmissions: submissionsCount.count || 0,
      activeCompetition: activeCompetitionStats,
      recentSubmissions,
    }
  } catch (error) {
    console.error('Error getting overview stats:', error)
    throw error
  }
}
