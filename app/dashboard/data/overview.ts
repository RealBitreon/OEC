// Overview data layer - aggregated dashboard statistics
'use server'

import { createClient } from '@/lib/supabase/server'
import { UserRole } from '../core/types'

export async function getOverviewData(userId: string, role: UserRole) {
  const supabase = await createClient()

  const { data: activeCompetition } = await supabase
    .from('competitions')
    .select('id, title, status, end_at, wheel_spin_at')
    .eq('status', 'active')
    .single()

  let adminStats = undefined

  if (role === 'LRC_MANAGER' || role === 'CEO') {
    const [studentsResult, submissionsResult, pendingResult] = await Promise.all([
      supabase.from('student_participants').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
      supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .is('final_result', null),
    ])

    adminStats = {
      totalStudents: studentsResult.count || 0,
      totalSubmissions: submissionsResult.count || 0,
      pendingReviews: pendingResult.count || 0,
    }
  }

  return {
    activeCompetition,
    adminStats,
  }
}
