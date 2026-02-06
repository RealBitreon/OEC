/**
 * Competition Draw API
 * POST /api/competitions/[id]/draw
 * 
 * This is the big moment - selecting winners for a competition.
 * It's a high-stakes operation that needs to be:
 * - Fair: Use crypto-grade randomness
 * - Auditable: Log everything
 * - Idempotent: Running it twice shouldn't create duplicate winners
 * - Transparent: Record probabilities and weights for verification
 * 
 * The algorithm supports two modes:
 * 1. Simple mode: Everyone has equal odds (or early-bird bonus)
 * 2. Tickets mode: Odds based on correct answers (gamification)
 * 
 * Security considerations:
 * - Only admins can run draws (requireAdmin check)
 * - Each draw gets a unique correlationId for audit trails
 * - Results are hashed for tamper-proofing
 * - We prevent duplicate draws (check for existing wheel_runs)
 */

import { NextRequest } from 'next/server'
import { requireAdmin, successResponse, errorResponse } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/server'
import { selectMultipleWinners, generateDrawHash, type Candidate } from '@/lib/utils/winner-selection'
import { calculateEarlyBonus } from '@/lib/utils/early-bonus'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Generate a unique ID for this request - makes debugging way easier
  // when you can grep logs for a specific correlationId
  const correlationId = randomUUID()
  
  try {
    // Auth check: Only admins can run draws
    const { user } = await requireAdmin()
    const body = await request.json()
    const { winnerCount } = body
    
    const supabase = createServiceClient()
    
    // Fetch competition config
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (compError || !competition) {
      return errorResponse('NOT_FOUND', 'المسابقة غير موجودة', 404, correlationId)
    }
    
    // Idempotency check: Has this draw already been executed?
    // We check for existing wheel_runs with winners to prevent accidental
    // duplicate draws. This is important because running a draw twice would
    // pick different winners (randomness), which would be confusing and unfair.
    const { data: existingRun } = await supabase
      .from('wheel_runs')
      .select('id, winners')
      .eq('competition_id', params.id)
      .single()
    
    if (existingRun && existingRun.winners && Array.isArray(existingRun.winners) && existingRun.winners.length > 0) {
      return errorResponse('ALREADY_DRAWN', 'تم تنفيذ السحب مسبقاً', 400, correlationId)
    }
    
    // Use provided winner count, or fall back to competition config, or default to 1
    const finalWinnerCount = winnerCount || competition.winner_count || 1
    
    // Get eligible submissions based on mode
    // In tickets mode, we can optionally filter out submissions below a threshold
    // (e.g., "must have at least 5 tickets to be eligible")
    let query = supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', params.id)
      .eq('status', 'accepted') // Only accepted submissions are eligible
      .order('submitted_at', { ascending: true }) // For deterministic ordering
    
    // Apply ticket threshold if configured
    // This lets admins say "you need at least X correct answers to win"
    if (competition.winner_selection_mode === 'tickets' && competition.min_tickets_threshold > 0) {
      query = query.gte('tickets_earned', competition.min_tickets_threshold)
    }
    
    const { data: eligible, error: eligibleError } = await query
    
    if (eligibleError) {
      console.error(`[${correlationId}] Eligible fetch error:`, eligibleError)
      return errorResponse('FETCH_FAILED', 'فشل جلب الإجابات المؤهلة', 500, correlationId)
    }
    
    if (!eligible || eligible.length === 0) {
      return errorResponse('NO_CANDIDATES', 'لا توجد إجابات مؤهلة للسحب', 404, correlationId)
    }
    
    // Build candidates list with weights
    // Weight determines odds - higher weight = better chance of winning
    const candidates: Candidate[] = eligible.map(sub => {
      let weight = 1.0 // Default: everyone has equal odds
      
      if (competition.winner_selection_mode === 'tickets') {
        // Tickets mode: weight = number of tickets earned
        // Tickets already include early bonus (calculated during review)
        weight = sub.tickets_earned || 1
      } else if (competition.early_bonus_enabled && competition.early_bonus_config) {
        // Simple mode with early bonus: weight = early bonus multiplier
        weight = calculateEarlyBonus(
          sub.submitted_at,
          competition.end_at,
          competition.early_bonus_config
        )
      }
      
      return {
        submissionId: sub.id,
        participantName: sub.participant_name,
        weight,
        submittedAt: sub.submitted_at
      }
    })
    
    // The magic happens here: select winners using weighted randomness
    const winners = selectMultipleWinners(candidates, finalWinnerCount)
    
    // Generate tamper-proof hash for verification
    // This lets us prove the results haven't been modified after the draw
    const timestamp = new Date().toISOString()
    const drawHash = generateDrawHash(params.id, winners, timestamp)
    
    // Save results to database
    const wheelRunData = {
      competition_id: params.id,
      winner_count: winners.length,
      status: 'completed',
      winners: winners, // Store full winner details as JSONB
      draw_metadata: {
        draw_hash: drawHash,
        timestamp,
        mode: competition.winner_selection_mode,
        total_candidates: eligible.length,
        correlation_id: correlationId
      },
      run_at: timestamp,
      run_by: user.id,
      is_published: false // Admin must explicitly publish results
    }
    
    // Update existing run or create new one
    if (existingRun) {
      await supabase
        .from('wheel_runs')
        .update(wheelRunData)
        .eq('id', existingRun.id)
    } else {
      await supabase
        .from('wheel_runs')
        .insert(wheelRunData)
    }
    
    // Mark winners in submissions table
    // This denormalizes the data for faster queries (we can find winners
    // without joining to wheel_runs)
    for (const winner of winners) {
      await supabase
        .from('submissions')
        .update({ is_winner: true })
        .eq('id', winner.submissionId)
    }
    
    // Audit log: Record who ran the draw and when
    // This is critical for accountability and debugging
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'wheel_draw_executed',
      entity_type: 'competition',
      entity_id: params.id,
      details: {
        winners: winners.map(w => ({
          submissionId: w.submissionId,
          participantName: w.participantName,
          position: w.position,
          weight: w.weight,
          probability: w.probability
        })),
        draw_hash: drawHash,
        mode: competition.winner_selection_mode,
        total_candidates: eligible.length
      }
    })
    
    return successResponse({
      winners,
      drawHash,
      message: `تم اختيار ${winners.length} فائز بنجاح`,
      metadata: {
        mode: competition.winner_selection_mode,
        totalCandidates: eligible.length,
        timestamp
      }
    }, correlationId)
    
  } catch (error: any) {
    console.error(`[${correlationId}] Draw exception:`, error)
    return errorResponse('SERVER_ERROR', error.message, 500, correlationId)
  }
}
