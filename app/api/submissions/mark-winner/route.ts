import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { submissionId, isWinner } = await request.json()

    if (!submissionId || typeof isWinner !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update submission with winner status (pass/fail)
    const { error } = await supabase
      .from('submissions')
      .update({
        is_winner: isWinner,
        status: isWinner ? 'approved' : 'rejected', // Keep for compatibility but focus on is_winner
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Error marking winner:', error)
      return NextResponse.json(
        { error: 'Failed to update winner status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: isWinner ? 'تم تحديد الطالب كفائز (نجح)' : 'تم تحديد الطالب كخاسر (لم ينجح)'
    })
  } catch (error) {
    console.error('Error in mark-winner API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
