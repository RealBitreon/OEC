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

    console.log(`[${correlationId}] Mark winner request:`, {
      submissionId,
      isWinner,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (!submissionId || typeof isWinner !== 'boolean') {
      console.error(`[${correlationId}] Invalid input:`, { submissionId, isWinner })
      return errorResponse('INVALID_INPUT', 'الحقول المطلوبة مفقودة', 400, correlationId)
    }

    const supabase = createServiceClient()

    // First, get the current submission to log the change
    const { data: currentSubmission } = await supabase
      .from('submissions')
      .select('id, participant_name, is_winner, status')
      .eq('id', submissionId)
      .single()

    console.log(`[${correlationId}] Current submission state:`, currentSubmission)

    // Update submission with winner status
    const updateData = {
      is_winner: isWinner,
      status: isWinner ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString()
    }

    console.log(`[${correlationId}] Attempting update with data:`, updateData)

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error(`[${correlationId}] Database error:`, {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return errorResponse('DATABASE_ERROR', `فشل تحديث الإجابة: ${error.message}`, 500, correlationId)
    }

    if (!data) {
      console.error(`[${correlationId}] No data returned after update`)
      return errorResponse('NOT_FOUND', 'الإجابة غير موجودة', 404, correlationId)
    }

    console.log(`[${correlationId}] Update successful:`, {
      id: data.id,
      participant_name: data.participant_name,
      is_winner: data.is_winner,
      status: data.status,
      previous_is_winner: currentSubmission?.is_winner
    })

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'submission_reviewed',
      entity_type: 'submission',
      entity_id: submissionId,
      details: { 
        isWinner, 
        status: isWinner ? 'approved' : 'rejected',
        previous_is_winner: currentSubmission?.is_winner,
        previous_status: currentSubmission?.status
      }
    })

    const successMessage = isWinner ? 'تم تحديد الطالب كفائز 🎉' : 'تم تحديد الطالب كخاسر'
    console.log(`[${correlationId}] Success: ${successMessage}`)

    return successResponse({
      success: true,
      message: successMessage,
      submission: data
    }, correlationId)
    
  } catch (error: any) {
    console.error(`[${correlationId}] Unexpected error:`, {
      error,
      message: error.message,
      stack: error.stack
    })
    return handleAuthError(error, correlationId)
  }
}
