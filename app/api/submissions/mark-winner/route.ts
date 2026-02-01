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

    // Update submission with winner status
    const { error } = await supabase
      .from('submissions')
      .update({
        is_winner: isWinner,
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
      message: isWinner ? 'تم تحديد الطالب كفائز' : 'تم تحديد الطالب كخاسر'
    })
  } catch (error) {
    console.error('Error in mark-winner API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
