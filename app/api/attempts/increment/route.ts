import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { competitionId, deviceFingerprint, userId } = await request.json()

    if (!competitionId || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if can attempt first
    const { data: competition } = await supabase
      .from('competitions')
      .select('max_attempts')
      .eq('id', competitionId)
      .single()

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    const maxAttempts = competition.max_attempts || 2

    // Get current attempts
    const { data: tracking } = await supabase
      .from('attempt_tracking')
      .select('attempt_count')
      .eq('competition_id', competitionId)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    const currentAttempts = tracking?.attempt_count || 0

    if (currentAttempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum attempts reached' },
        { status: 403 }
      )
    }

    // Increment attempt
    const { data: result, error } = await supabase
      .from('attempt_tracking')
      .upsert({
        competition_id: competitionId,
        device_fingerprint: deviceFingerprint,
        user_id: userId || null,
        attempt_count: currentAttempts + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'competition_id,device_fingerprint',
      })
      .select()
      .single()

    if (error) {
      console.error('Error incrementing attempt:', error)
      return NextResponse.json(
        { error: 'Failed to increment attempt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      attemptCount: result.attempt_count,
      remainingAttempts: maxAttempts - result.attempt_count,
    })
  } catch (error) {
    console.error('Error incrementing attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
