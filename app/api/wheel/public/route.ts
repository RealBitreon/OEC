import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')

    if (!competitionId) {
      return NextResponse.json(
        { error: 'Competition ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    
    // Fetch wheel run
    const { data: wheelRun, error } = await supabase
      .from('wheel_runs')
      .select('*')
      .eq('competition_id', competitionId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching wheel run:', error)
      return NextResponse.json(
        { error: 'Failed to fetch wheel data' },
        { status: 500 }
      )
    }
    
    // Only return if published
    if (!wheelRun || !wheelRun.is_published) {
      return NextResponse.json({ wheelRun: null })
    }
    
    // If there's a winner, fetch submission details
    if (wheelRun.winner_id) {
      const { data: winner } = await supabase
        .from('submissions')
        .select('id, participant_name, participant_email, grade')
        .eq('id', wheelRun.winner_id)
        .single()
      
      if (winner) {
        wheelRun.winner = {
          id: winner.id,
          username: winner.participant_email,
          display_name: winner.participant_name,
          class: winner.grade
        }
      }
    }
    
    // Return sanitized data for public view
    const publicData = {
      ...wheelRun,
      // Hide sensitive internal data
      locked_by: undefined,
      run_by: undefined,
      published_by: undefined,
      // Keep only necessary snapshot data
      locked_snapshot: wheelRun.locked_snapshot?.map((e: any) => ({
        user: {
          username: e.user.username,
          display_name: e.user.display_name
        },
        totalTickets: e.totalTickets
      }))
    }

    return NextResponse.json({ 
      wheelRun: publicData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in wheel public API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
