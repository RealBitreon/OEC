/**
 * Final Review API (Batch Save)
 * POST /api/submissions/[id]/review-final
 * 
 * This endpoint handles the final commit of a submission review.
 * It's called when a reviewer has finished grading all questions and
 * is ready to accept or reject the submission.
 * 
 * Key features:
 * - Optimistic concurrency control (version checking)
 * - Atomic updates (all-or-nothing)
 * - Automatic ticket calculation
 * - Early bonus application
 * - Draft cleanup
 * 
 * Why separate draft and final endpoints?
 * - Drafts are frequent, low-stakes (autosave every 2 min)
 * - Finals are rare, high-stakes (explicit user action)
 * - Different validation rules (finals require a decision)
 * - Different side effects (finals trigger notifications, update stats)
 */

import { NextRequest } from 'next/server'
import { requireAdmin, successResponse, errorResponse } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateEarlyBonus } from '@/lib/utils/early-bonus'
import { randomUUID } from 'crypto'
import { z } from 'zod'

// Input validation schema using Zod
// This ensures we get clean, type-safe data before we touch the database
const ReviewFinalSchema = z.object({
  corrections: z.record(z.object({
    isCorrect: z.boolean(),
    notes: z.string().optional()
  })),
  finalDecision: z.enum(['accepted', 'rejected']),
  version: z.number().int().min(0).optional() // For optimistic concurrency
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = randomUUID()
  
  try {
    const { user } = await requireAdmin()
    const body = await request.json()
    
    // Validate input - fail fast if data is malformed
    const validation = ReviewFinalSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse('INVALID_INPUT', 'البيانات غير صحيحة', 400, correlationId)
    }
    
    const { corrections, finalDecision, version } = validation.data
    
    const supabase = createServiceClient()
    
    // Fetch current submission for version check
    // We need the version to implement optimistic concurrency control
    const { data: current, error: fetchError } = await supabase
      .from('submissions')
      .select('review_version, competition_id, submitted_at')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !current) {
      return errorResponse('NOT_FOUND', 'الإجابة غير موجودة', 404, correlationId)
    }
    
    // Optimistic concurrency check
    // If the version doesn't match, someone else modified this submission
    // while we were working on it. We reject the save to prevent data loss.
    if (version !== undefined && current.review_version !== version) {
      return errorResponse(
        'VERSION_CONFLICT',
        'تم تعديل هذه الإجابة من قبل مراجع آخر. يرجى تحديث الصفحة.',
        409,
        correlationId
      )
    }
    
    // Get competition config to determine how to calculate tickets
    const { data: competition } = await supabase
      .from('competitions')
      .select('winner_selection_mode, tickets_per_correct, early_bonus_enabled, early_bonus_config, end_at')
      .eq('id', current.competition_id)
      .single()
    
    // Calculate tickets if in tickets mode
    // Tickets = (correct answers × tickets_per_correct) × early_bonus_multiplier
    let ticketsEarned = 0
    let earlyBonusWeight = 1.0
    
    if (competition?.winner_selection_mode === 'tickets' && finalDecision === 'accepted') {
      const correctCount = Object.values(corrections).filter(c => c.isCorrect).length
      ticketsEarned = correctCount * (competition.tickets_per_correct || 1)
      
      // Apply early bonus if enabled
      // This rewards people who submitted early
      if (competition.early_bonus_enabled && competition.early_bonus_config) {
        earlyBonusWeight = calculateEarlyBonus(
          current.submitted_at,
          competition.end_at,
          competition.early_bonus_config
        )
        // Floor the result to avoid fractional tickets
        ticketsEarned = Math.floor(ticketsEarned * earlyBonusWeight)
      }
    }
    
    // Build submission_answers array
    // This is stored as JSONB in the database for flexible querying
    const submissionAnswers = Object.entries(corrections).map(([questionId, correction]) => ({
      question_id: questionId,
      is_correct: correction.isCorrect,
      notes: correction.notes || null
    }))
    
    // Atomic update with version check
    // The .eq('review_version', current.review_version) ensures we only
    // update if nobody else has modified the submission since we fetched it
    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: finalDecision,
        submission_answers: submissionAnswers,
        tickets_earned: ticketsEarned,
        early_bonus_weight: earlyBonusWeight,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_version: current.review_version + 1, // Increment version
        review_draft: null // Clear any saved draft
      })
      .eq('id', params.id)
      .eq('review_version', current.review_version) // Concurrency check
      .select()
      .single()
    
    if (error) {
      console.error(`[${correlationId}] Update error:`, error)
      
      // Check if it's a version conflict (no rows updated)
      // This can happen if another reviewer saved between our fetch and update
      if (error.code === 'PGRST116') {
        return errorResponse(
          'VERSION_CONFLICT',
          'تم تعديل هذه الإجابة من قبل مراجع آخر. يرجى تحديث الصفحة.',
          409,
          correlationId
        )
      }
      
      return errorResponse('UPDATE_FAILED', error.message, 500, correlationId)
    }
    
    // Clean up: Delete the draft since we've finalized the review
    await supabase
      .from('submission_review_drafts')
      .delete()
      .eq('submission_id', params.id)
      .eq('reviewer_id', user.id)
    
    // Audit log: Record who reviewed what and when
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'submission_reviewed',
      entity_type: 'submission',
      entity_id: params.id,
      details: {
        finalDecision,
        ticketsEarned,
        earlyBonusWeight,
        correctionsCount: Object.keys(corrections).length,
        mode: competition?.winner_selection_mode
      }
    })
    
    // Build success message with ticket info if applicable
    const message = finalDecision === 'accepted' 
      ? `تم قبول الإجابة ✓${ticketsEarned > 0 ? ` (${ticketsEarned} تذكرة)` : ''}`
      : 'تم رفض الإجابة'
    
    return successResponse({
      submission: data,
      message
    }, correlationId)
    
  } catch (error: any) {
    console.error(`[${correlationId}] Review final exception:`, error)
    return errorResponse('SERVER_ERROR', error.message, 500, correlationId)
  }
}
