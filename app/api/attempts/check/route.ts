import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { competitionId, deviceFingerprint } = await request.json()
    
    console.log('[ATTEMPTS CHECK API] Request:', { 
      competitionId, 
      fingerprint: deviceFingerprint?.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    })

    if (!competitionId || !deviceFingerprint) {
      console.error('[ATTEMPTS CHECK API] Missing fields')
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
      console.error('[ATTEMPTS CHECK API] Competition not found:', compError)
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    const maxAttempts = competition.max_attempts || 2

    // ✅ FIX: Count only SUBMITTED attempts (not just views)
    // Check how many submissions exist for this device
    const { count } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('competition_id', competitionId)
      .eq('device_fingerprint', deviceFingerprint)

    const currentAttempts = count || 0
    const canAttempt = currentAttempts < maxAttempts
    const remainingAttempts = Math.max(0, maxAttempts - currentAttempts)
    
    const result = {
      canAttempt,
      currentAttempts,
      maxAttempts,
      remainingAttempts,
    }
    
    console.log('[ATTEMPTS CHECK API] Result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[ATTEMPTS CHECK API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
