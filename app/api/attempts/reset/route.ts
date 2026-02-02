import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RESET_CODE = '12311'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { competitionId, deviceFingerprint, resetCode } = body

    console.log('[RESET ATTEMPTS] Request:', {
      competitionId,
      fingerprint: deviceFingerprint?.substring(0, 8) + '...',
      codeProvided: !!resetCode
    })

    // Validate inputs
    if (!competitionId || !deviceFingerprint || !resetCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify reset code
    if (resetCode !== RESET_CODE) {
      console.log('[RESET ATTEMPTS] Invalid code provided')
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('id, max_attempts')
      .eq('id', competitionId)
      .single()

    if (compError || !competition) {
      console.error('[RESET ATTEMPTS] Competition not found:', compError)
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Reset the attempt tracking for this device
    const { error: resetError } = await supabase
      .from('attempt_tracking')
      .delete()
      .eq('competition_id', competitionId)
      .eq('device_fingerprint', deviceFingerprint)

    if (resetError) {
      console.error('[RESET ATTEMPTS] Error resetting:', resetError)
      return NextResponse.json(
        { error: 'Failed to reset attempts' },
        { status: 500 }
      )
    }

    console.log('[RESET ATTEMPTS] Successfully reset attempts')

    // Return updated attempt info
    return NextResponse.json({
      canAttempt: true,
      remainingAttempts: competition.max_attempts,
      maxAttempts: competition.max_attempts,
      message: 'Attempts reset successfully'
    })

  } catch (error) {
    console.error('[RESET ATTEMPTS] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
