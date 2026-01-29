import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { submissionsRepo, questionsRepo, competitionsRepo } from '@/lib/repos'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { competition_id, participant_name, participant_email, first_name, father_name, family_name, grade, answers, proofs } = body

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
    let totalQuestions = questions.length

    for (const question of questions) {
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer === question.correctAnswer) {
        score++
      }
    }

    // Calculate tickets based on competition rules
    let ticketsEarned = 0
    const rules = competition.rules || { eligibilityMode: 'all_correct', ticketsPerCorrect: 1 }
    
    if (rules.eligibilityMode === 'all_correct') {
      if (score === totalQuestions) {
        ticketsEarned = rules.ticketsPerCorrect || 1
      }
    } else if (rules.eligibilityMode === 'min_correct') {
      if (score >= (rules.minCorrectAnswers || 0)) {
        ticketsEarned = (rules.ticketsPerCorrect || 1) * score
      }
    } else {
      ticketsEarned = (rules.ticketsPerCorrect || 1) * score
    }

    // Create submission
    const submission = {
      id: randomUUID(),
      userId: participant_name, // Using participant_name as userId for now
      competitionId: competition_id,
      questionId: '', // Not used in new schema
      answer: JSON.stringify(answers),
      isCorrect: score === totalQuestions,
      finalResult: undefined,
      submittedAt: new Date().toISOString(),
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
