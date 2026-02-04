import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// LRC Teacher Reset Code - Change this to update the code
const RESET_CODE = '12311'

export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  
  try {
    const body = await request.json()
    const { competitionId, deviceFingerprint, resetCode } = body

    console.log(`[${correlationId}] [RESET ATTEMPTS] Request:`, {
      competitionId,
      fingerprint: deviceFingerprint?.substring(0, 8) + '...',
      codeProvided: !!resetCode
    })

    // Validate inputs
    if (!competitionId || !deviceFingerprint || !resetCode) {
      return NextResponse.json(
        { ok: false, code: 'MISSING_FIELDS', error: 'الحقول المطلوبة مفقودة', correlationId },
        { status: 400 }
      )
    }

    // Verify reset code - CRITICAL SECURITY CHECK
    if (resetCode.trim() !== RESET_CODE) {
      console.log(`[${correlationId}] Invalid code provided`)
      return NextResponse.json(
        { ok: false, code: 'INVALID_CODE', error: 'كود غير صحيح - يرجى التحقق من الكود مع معلم مركز مصادر التعلم', correlationId },
        { status: 403 }
      )
    }

    const supabase = createServiceClient()

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('id, max_attempts')
      .eq('id', competitionId)
      .single()

    if (compError || !competition) {
      console.error('[RESET ATTEMPTS] Competition not found:', compError)
      return NextResponse.json(
        { error: 'المسابقة غير موجودة' },
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
        { error: 'فشل إعادة تعيين المحاولات' },
        { status: 500 }
      )
    }

    console.log('[RESET ATTEMPTS] Successfully reset attempts for device:', deviceFingerprint.substring(0, 8) + '...')

    // Return updated attempt info
    return NextResponse.json({
      canAttempt: true,
      remainingAttempts: competition.max_attempts || 3,
      maxAttempts: competition.max_attempts || 3,
      currentAttempts: 0,
      message: 'تم إعادة تعيين المحاولات بنجاح'
    })

  } catch (error: any) {
    console.error('[RESET ATTEMPTS] Unexpected error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في الخادم' },
      { status: 500 }
    )
  }
}
