import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or supervisor
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'supervisor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch statistics
    const [
      competitionsResult,
      activeCompetitionsResult,
      submissionsResult,
      usersResult,
      pendingReviewsResult,
      winnersResult
    ] = await Promise.all([
      supabase.from('competitions').select('id', { count: 'exact', head: true }),
      supabase.from('competitions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('is_winner', true)
    ])

    const stats = {
      totalCompetitions: competitionsResult.count || 0,
      activeCompetitions: activeCompetitionsResult.count || 0,
      totalSubmissions: submissionsResult.count || 0,
      totalUsers: usersResult.count || 0,
      pendingReviews: pendingReviewsResult.count || 0,
      totalWinners: winnersResult.count || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in admin stats route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
