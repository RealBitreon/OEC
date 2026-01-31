import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { competitionId, deviceFingerprint } = await request.json()

    if (!competitionId || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get competition max attempts
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('max_attempts')
      .eq('id', competitionId)
      .single()

    if (compError || !competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    const maxAttempts = competition.max_attempts || 2

    // Get current attempts
    const { data: tracking, error: trackError } = await supabase
      .from('attempt_tracking')
      .select('attempt_count')
      .eq('competition_id', competitionId)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    const currentAttempts = tracking?.attempt_count || 0
    const canAttempt = currentAttempts < maxAttempts
    const remainingAttempts = Math.max(0, maxAttempts - currentAttempts)

    return NextResponse.json({
      canAttempt,
      currentAttempts,
      maxAttempts,
      remainingAttempts,
    })
  } catch (error) {
    console.error('Error checking attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
