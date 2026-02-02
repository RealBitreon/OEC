import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// LRC Teacher Reset Code - Change this to update the code
const RESET_CODE = '12311'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { competitionId, deviceFingerprint, resetCode } = body

    console.log('[RESET ATTEMPTS] Request:', {
      competitionId,
      fingerprint: deviceFingerprint?.substring(0, 8) + '...',
      codeProvided: !!resetCode,
      timestamp: new Date().toISOString()
    })

    // Validate inputs
    if (!competitionId || !deviceFingerprint || !resetCode) {
      console.log('[RESET ATTEMPTS] Missing required fields')
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      )
    }

    // Verify reset code - CRITICAL SECURITY CHECK
    if (resetCode.trim() !== RESET_CODE) {
      console.log('[RESET ATTEMPTS] Invalid code provided:', resetCode.substring(0, 3) + '...')
      return NextResponse.json(
        { error: 'كود غير صحيح - يرجى التحقق من الكود مع معلم مركز مصادر التعلم' },
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
