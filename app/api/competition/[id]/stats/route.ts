import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = randomUUID()
  
  try {
    const { id } = await params
    const supabase = createServiceClient()

    // Get all submissions for this competition
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', id)

    if (submissionsError) {
      console.error(`[${correlationId}] Error fetching submissions:`, submissionsError)
      return NextResponse.json(
        { 
          ok: true,
          data: {
            submissions: [],
            totalTickets: 0,
            totalParticipants: 0
          },
          correlationId
        },
        { status: 200 }
      )
    }

    // Calculate total tickets
    const totalTickets = submissions?.reduce((sum, sub) => sum + (sub.tickets_earned || 0), 0) || 0

    // Calculate unique participants
    const uniqueParticipants = new Set(
      submissions?.map(sub => sub.participant_email || sub.participant_name)
    ).size

    return NextResponse.json({
      ok: true,
      data: {
        submissions: submissions || [],
        totalTickets,
        totalParticipants: uniqueParticipants
      },
      correlationId
    })
  } catch (error: any) {
    console.error(`[${correlationId}] Error in stats API:`, error)
    return NextResponse.json(
      { 
        ok: false,
        code: 'INTERNAL_ERROR',
        error: 'حدث خطأ داخلي',
        correlationId
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
