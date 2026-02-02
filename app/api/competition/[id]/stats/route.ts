import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get all submissions for this competition
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', id)

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { 
          submissions: [],
          totalTickets: 0,
          totalParticipants: 0
        },
        { status: 200 }
      )
    }

    // Calculate total tickets (sum of all tickets from submissions)
    const totalTickets = submissions?.reduce((sum, sub) => sum + (sub.tickets_earned || 0), 0) || 0

    // Calculate unique participants
    const uniqueParticipants = new Set(
      submissions?.map(sub => sub.device_fingerprint || sub.student_name)
    ).size

    return NextResponse.json({
      submissions: submissions || [],
      totalTickets,
      totalParticipants: uniqueParticipants
    })
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        submissions: [],
        totalTickets: 0,
        totalParticipants: 0
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
