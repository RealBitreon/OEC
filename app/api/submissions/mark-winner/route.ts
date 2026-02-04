import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError, successResponse, errorResponse } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  
  try {
    // Require admin authentication
    const { user } = await requireAdmin()
    
    const body = await request.json()
    const { submissionId, isWinner } = body

    if (!submissionId || typeof isWinner !== 'boolean') {
      return errorResponse('INVALID_INPUT', 'الحقول المطلوبة مفقودة', 400, correlationId)
    }

    const supabase = createServiceClient()

    // Update submission with winner status
    const { data, error } = await supabase
      .from('submissions')
      .update({
        is_winner: isWinner,
        status: isWinner ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error('[mark-winner] Database error:', error)
      return errorResponse('DATABASE_ERROR', 'فشل تحديث الإجابة', 500, correlationId)
    }

    if (!data) {
      return errorResponse('NOT_FOUND', 'الإجابة غير موجودة', 404, correlationId)
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'submission_reviewed',
      entity_type: 'submission',
      entity_id: submissionId,
      details: { isWinner, status: isWinner ? 'approved' : 'rejected' }
    })

    return successResponse({
      success: true,
      message: isWinner ? 'تم تحديد الطالب كفائز 🎉' : 'تم تحديد الطالب كخاسر',
      submission: data
    }, correlationId)
    
  } catch (error) {
    return handleAuthError(error, correlationId)
  }
}
