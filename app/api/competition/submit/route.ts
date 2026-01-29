import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { submissionsRepo, questionsRepo, competitionsRepo } from '@/lib/repos'
import type { Competition } from '@/lib/store/types'

/**
 * Type guard to check if rules use the old schema (ticketsPerCorrect)
 */
function hasLegacyTicketsSchema(rules: any): rules is {
  eligibilityMode: 'all_correct' | 'min_correct' | 'per_correct'
  minCorrectAnswers?: number
  ticketsPerCorrect?: number
  earlyBonusTiers?: Array<{ cutoffDate: string; bonusTickets: number }>
} {
  return 'ticketsPerCorrect' in rules
}

/**
 * Calculate tickets earned based on competition rules
 * Supports both old (ticketsPerCorrect) and new (ticketsConfig) schemas
 * 
 * @example
 * // all_correct mode: only perfect scores earn tickets
 * computeTickets(rules, 10, 10, new Date()) // => baseTickets + bonuses
 * computeTickets(rules, 9, 10, new Date())  // => 0
 * 
 * // min_correct mode: scores >= threshold earn tickets
 * computeTickets(rules, 7, 10, new Date())  // => baseTickets (if minCorrectAnswers <= 7)
 */
function computeTickets(
  rules: Competition['rules'] | any,
  score: number,
  totalQuestions: number,
  submittedAt: Date
): number {
  // Handle legacy schema (ticketsPerCorrect)
  if (hasLegacyTicketsSchema(rules)) {
    const baseTickets = rules.ticketsPerCorrect || 1
    const eligibilityMode = rules.eligibilityMode || 'all_correct'
    const minCorrectAnswers = rules.minCorrectAnswers || 0

    let isEligible = false
    if (eligibilityMode === 'all_correct') {
      isEligible = score === totalQuestions
    } else if (eligibilityMode === 'min_correct') {
      isEligible = score >= minCorrectAnswers
    } else if (eligibilityMode === 'per_correct') {
      isEligible = score > 0
    }

    if (!isEligible) return 0

    // Calculate early bonus from legacy schema
    let bonusTickets = 0
    if (rules.earlyBonusTiers && rules.earlyBonusTiers.length > 0) {
      for (const tier of rules.earlyBonusTiers) {
        const cutoffDate = new Date(tier.cutoffDate)
        if (submittedAt <= cutoffDate) {
          bonusTickets = Math.max(bonusTickets, tier.bonusTickets || 0)
        }
      }
    }

    return baseTickets + bonusTickets
  }

  // Handle new schema (ticketsConfig)
  const ticketsConfig = rules.ticketsConfig || { baseTickets: 1, earlyBonusTiers: [] }
  const baseTickets = ticketsConfig.baseTickets || 1
  const eligibilityMode = rules.eligibilityMode || 'all_correct'
  const minCorrectAnswers = rules.minCorrectAnswers || 0

  let isEligible = false
  if (eligibilityMode === 'all_correct') {
    isEligible = score === totalQuestions
  } else if (eligibilityMode === 'min_correct') {
    isEligible = score >= minCorrectAnswers
  }

  if (!isEligible) return 0

  // Calculate early bonus from new schema
  let bonusTickets = 0
  if (ticketsConfig.earlyBonusTiers && ticketsConfig.earlyBonusTiers.length > 0) {
    for (const tier of ticketsConfig.earlyBonusTiers) {
      const beforeDate = new Date(tier.beforeDate)
      if (submittedAt <= beforeDate) {
        bonusTickets = Math.max(bonusTickets, tier.bonusTickets || 0)
      }
    }
  }

  return baseTickets + bonusTickets
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { competition_id, participant_name, answers } = body

    // Validate required fields
    if (!competition_id || !participant_name || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get competition
    const competition = await competitionsRepo.getById(competition_id)
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Get questions for this competition
    const questions = await questionsRepo.listByCompetition(competition_id)
    
    // Calculate score
    let score = 0
    const totalQuestions = questions.length

    for (const question of questions) {
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer === question.correctAnswer) {
        score++
      }
    }

    // Calculate tickets using the helper function
    const submittedAt = new Date()
    const ticketsEarned = computeTickets(
      competition.rules,
      score,
      totalQuestions,
      submittedAt
    )

    // Create submission
    const submission = {
      id: randomUUID(),
      userId: participant_name, // Using participant_name as userId for now
      competitionId: competition_id,
      questionId: '', // Not used in new schema
      answer: JSON.stringify(answers),
      isCorrect: score === totalQuestions,
      finalResult: undefined,
      submittedAt: submittedAt.toISOString(),
    }

    await submissionsRepo.create(submission)

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score,
        totalQuestions,
        ticketsEarned,
        status: 'pending',
      },
    })
  } catch (error) {
    console.error('Error submitting competition:', error)
    return NextResponse.json(
      { error: 'Failed to submit competition' },
      { status: 500 }
    )
  }
}
