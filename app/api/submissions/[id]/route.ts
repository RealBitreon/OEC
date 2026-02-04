import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError, successResponse, errorResponse } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const correlationId = randomUUID()
  
  try {
    // Require admin authentication
    const { user } = await requireAdmin()
    
    // Handle params as Promise in Next.js 15+
    const resolvedParams = await Promise.resolve(params)
    const submissionId = resolvedParams.id

    if (!submissionId) {
      return errorResponse('INVALID_INPUT', 'معرف الإجابة مطلوب', 400, correlationId)
    }

    const supabase = createServiceClient()

    // Delete the submission
    const { error: deleteError } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      console.error('[DELETE submission] Error:', deleteError)
      return errorResponse('DATABASE_ERROR', 'فشل حذف الإجابة', 500, correlationId)
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'submission_deleted',
      entity_type: 'submission',
      entity_id: submissionId,
      details: { deleted_by: user.username }
    })

    return successResponse({ success: true, message: 'تم حذف الإجابة بنجاح' }, correlationId)
    
  } catch (error) {
    return handleAuthError(error, correlationId)
  }
}
