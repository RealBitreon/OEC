import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * FIXED Competition Submission API
 * 
 * Changes from original:
 * 1. Actually creates tickets in tickets table
 * 2. Returns proper HTTP status codes (400, 404, 500)
 * 3. Structured error responses with correlation IDs
 * 4. Validates competition is active
 * 5. Persists tickets_earned to submission record
 * 6. Idempotent (checks for existing submission)
 */

interface ErrorResponse {
  ok: false
  code: string
  message: string
  hint?: string
  correlationId: string
}

interface SuccessResponse {
  ok: true
  submission: {
    id: string
    score: number
    totalQuestions: number
    ticketsEarned: number
    status: string
    isEligible: boolean
  }
  correlationId: string
}

function computeTickets(
  rules: any,
  score: number,
  totalQuestions: number,
  submittedAt: Date
): number {
  const eligibilityMode = rules.eligibilityMode || 'all_correct'
  const minCorrectAnswers = rules.minCorrectAnswers || 0
  
  // Determine base tickets
  let baseTickets = 1
  if (rules.ticketsConfig?.baseTickets) {
    baseTickets = rules.ticketsConfig.baseTickets
  } else if (rules.ticketsPerCorrect) {
    baseTickets = rules.ticketsPerCorrect
  }
  
  // Check eligibility
  let isEligible = false
  if (eligibilityMode === 'all_correct') {
    isEligible = score === totalQuestions && totalQuestions > 0
  } else if (eligibilityMode === 'min_correct') {
    isEligible = score >= minCorrectAnswers
  } else if (eligibilityMode === 'per_correct') {
    isEligible = score > 0
  }
  
  if (!isEligible) return 0
  
  // Calculate early bonus
  let bonusTickets = 0
  const earlyBonusTiers = rules.ticketsConfig?.earlyBonusTiers || rules.earlyBonusTiers || []
  
  for (const tier of earlyBonusTiers) {
    const cutoffDate = new Date(tier.beforeDate || tier.cutoffDate)
    if (submittedAt <= cutoffDate) {
      bonusTickets = Math.max(bonusTickets, tier.bonusTickets || 0)
    }
  }
  
  return baseTickets + bonusTickets
}

export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  const supabase = createServiceClient()
  
  try {
    const body = await request.json()
    
    console.log(`[${correlationId}] Submission request received:`, {
      competition_id: body.competition_id,
      participant_name: body.participant_name,
      answersCount: Object.keys(body.answers || {}).length,
      proofsCount: Object.keys(body.proofs || {}).length,
      timestamp: new Date().toISOString()
    })
    
    const { 
      competition_id, 
      participant_name, 
      first_name,
      father_name,
      family_name,
      grade,
      answers, 
      proofs,
      participant_email 
    } = body

    // Validate required fields
    if (!competition_id || !participant_name || !answers) {
      return NextResponse.json<ErrorResponse>(
        { 
          ok: false,
          code: 'MISSING_FIELDS',
          message: 'الحقول المطلوبة مفقودة',
          hint: 'يجب توفير competition_id و participant_name و answers',
          correlationId
        },
        { status: 400 }
      )
    }

    // Get competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competition_id)
      .single()
    
    if (compError || !competition) {
      console.error(`[${correlationId}] Competition not found:`, compError)
      return NextResponse.json<ErrorResponse>(
        { 
          ok: false,
          code: 'COMPETITION_NOT_FOUND',
          message: 'المسابقة غير موجودة',
          correlationId
        },
        { status: 404 }
      )
    }
    
    // Validate competition is active
    if (competition.status !== 'active') {
      return NextResponse.json<ErrorResponse>(
        { 
          ok: false,
          code: 'COMPETITION_NOT_ACTIVE',
          message: 'المسابقة غير نشطة حالياً',
          hint: `حالة المسابقة: ${competition.status}`,
          correlationId
        },
        { status: 400 }
      )
    }

    // Check for existing submission (idempotency)
    const { data: existing } = await supabase
      .from('submissions')
      .select('id, status, tickets_earned')
      .eq('competition_id', competition_id)
      .eq('participant_name', participant_name)
      .maybeSingle()
    
    if (existing) {
      console.log(`[${correlationId}] Duplicate submission detected, returning existing`)
      return NextResponse.json<SuccessResponse>({
        ok: true,
        submission: {
          id: existing.id,
          score: 0,
          totalQuestions: 0,
          ticketsEarned: existing.tickets_earned || 0,
          status: existing.status || 'pending',
          isEligible: (existing.tickets_earned || 0) > 0
        },
        correlationId
      })
    }

    // Get questions for this competition
    console.log(`[${correlationId}] Fetching questions for competition:`, competition_id)
    
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('competition_id', competition_id)
      .eq('is_active', true)
    
    console.log(`[${correlationId}] Questions fetched:`, {
      count: questions?.length || 0,
      error: qError?.message
    })
    
    if (qError) {
      console.error(`[${correlationId}] Failed to fetch questions:`, qError)
      return NextResponse.json<ErrorResponse>(
        { 
          ok: false,
          code: 'QUESTIONS_FETCH_FAILED',
          message: 'فشل جلب الأسئلة',
          hint: qError.message,
          correlationId
        },
        { status: 500 }
      )
    }
    
    const totalQuestions = questions?.length || 0
    
    // Calculate score
    let score = 0
    for (const question of questions || []) {
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer === question.correct_answer) {
        score++
      }
    }

    // Calculate tickets
    const submittedAt = new Date()
    const ticketsEarned = computeTickets(
      competition.rules,
      score,
      totalQuestions,
      submittedAt
    )

    // Create submission
    const submissionId = randomUUID()
    
    console.log(`[${correlationId}] Creating submission:`, {
      id: submissionId,
      competition_id,
      participant_name,
      score,
      totalQuestions,
      ticketsEarned
    })
    
    const { error: subError } = await supabase
      .from('submissions')
      .insert({
        id: submissionId,
        competition_id,
        participant_name,
        participant_email: participant_email || null,
        first_name: first_name || null,
        father_name: father_name || null,
        family_name: family_name || null,
        grade: grade || null,
        answers,
        proofs: proofs || {},
        score,
        total_questions: totalQuestions,
        tickets_earned: ticketsEarned,
        status: 'pending',
        submitted_at: submittedAt.toISOString(),
        is_correct: score === totalQuestions
      })
    
    if (subError) {
      console.error(`[${correlationId}] Failed to create submission:`, {
        error: subError,
        code: subError.code,
        message: subError.message,
        details: subError.details,
        hint: subError.hint
      })
      return NextResponse.json<ErrorResponse>(
        { 
          ok: false,
          code: 'SUBMISSION_CREATE_FAILED',
          message: 'فشل حفظ الإجابات',
          hint: `${subError.message} (${subError.code})`,
          correlationId
        },
        { status: 500 }
      )
    }

    // ✅ FIX: Actually create tickets if earned
    if (ticketsEarned > 0) {
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: null, // Anonymous submission
          competition_id,
          count: ticketsEarned,
          reason: `submission_${submissionId}`,
          created_at: submittedAt.toISOString()
        })
      
      if (ticketError) {
        console.error(`[${correlationId}] Failed to create tickets:`, ticketError)
        // Don't fail the whole request, but log it
      } else {
        console.log(`[${correlationId}] Created ${ticketsEarned} tickets for submission ${submissionId}`)
      }
    }

    console.log(`[${correlationId}] Submission created successfully: ${submissionId}, score: ${score}/${totalQuestions}, tickets: ${ticketsEarned}`)

    return NextResponse.json<SuccessResponse>({
      ok: true,
      submission: {
        id: submissionId,
        score,
        totalQuestions,
        ticketsEarned,
        status: 'pending',
        isEligible: ticketsEarned > 0
      },
      correlationId
    })
    
  } catch (error: any) {
    console.error(`[${correlationId}] Unexpected error:`, error)
    return NextResponse.json<ErrorResponse>(
      { 
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ غير متوقع',
        hint: error.message,
        correlationId
      },
      { status: 500 }
    )
  }
}
