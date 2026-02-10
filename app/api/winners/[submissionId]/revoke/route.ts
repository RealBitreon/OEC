import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError, successResponse, errorResponse } from '@/lib/auth/guards';
import { createServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

/**
 * POST /api/winners/[submissionId]/revoke
 * 
 * Revokes winner status from a submission.
 * Only accessible by CEO/Manager roles.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const correlationId = randomUUID();
  
  try {
    // Require admin authentication
    const { user } = await requireAdmin();
    
    console.log(`[${correlationId}] Revoke winner request:`, {
      submissionId: params.submissionId,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    const supabase = createServiceClient();

    // Get current submission state
    const { data: currentSubmission } = await supabase
      .from('submissions')
      .select('id, participant_name, is_winner, status, competition_id')
      .eq('id', params.submissionId)
      .single();

    if (!currentSubmission) {
      return errorResponse('NOT_FOUND', 'الإجابة غير موجودة', 404, correlationId);
    }

    if (currentSubmission.is_winner !== true) {
      return errorResponse('INVALID_STATE', 'هذا الطالب ليس فائزاً', 400, correlationId);
    }

    // Revoke winner status
    const { data, error } = await supabase
      .from('submissions')
      .update({
        is_winner: null,
        status: 'pending',
        tickets_earned: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.submissionId)
      .select()
      .single();

    if (error) {
      console.error(`[${correlationId}] Database error:`, error);
      return errorResponse('DATABASE_ERROR', `فشل إلغاء الفوز: ${error.message}`, 500, correlationId);
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'winner_revoked',
      entity_type: 'submission',
      entity_id: params.submissionId,
      details: { 
        previous_is_winner: currentSubmission.is_winner,
        previous_status: currentSubmission.status,
        participant_name: currentSubmission.participant_name
      }
    });

    console.log(`[${correlationId}] Winner revoked successfully`);

    return successResponse({
      success: true,
      message: 'تم إلغاء الفوز بنجاح',
      submission: data
    }, correlationId);
    
  } catch (error: any) {
    console.error(`[${correlationId}] Unexpected error:`, error);
    return handleAuthError(error, correlationId);
  }
}
