import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { submissionsRepo, questionsRepo } from '@/lib/repos'
import { upsertTicketsForSubmission } from '@/lib/competition/tickets'
import { randomUUID } from 'crypto'

interface Question {
  id: string
  type: 'text' | 'true_false' | 'mcq'
  correctAnswer?: string
}

interface Submission {
  id: string
  questionId: string
  competitionId: string
  studentUsername: string
  answer: string
  source: {
    volume: string
    page: string
    lineFrom: number
    lineTo: number
    firstWord: string
    lastWord: string
  }
  autoResult: 'correct' | 'incorrect' | 'pending'
  finalResult: 'correct' | 'incorrect' | 'pending'
  correctedBy: string | null
  reason: string | null
  submittedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, competitionId, answer, documentation } = body

    if (!questionId || !competitionId || !answer || !documentation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already submitted
    const existingSubmissions = await submissionsRepo.list({
      questionId,
      studentUsername: session.username
    })

    if (existingSubmissions.length > 0) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    // Get question to determine auto-result
    const question = await questionsRepo.getById(questionId)

    let autoResult: 'correct' | 'incorrect' | 'pending' = 'pending'

    if (question) {
      if (question.type === 'true_false' || question.type === 'mcq') {
        if (question.correctAnswer) {
          autoResult = answer.toLowerCase() === question.correctAnswer.toLowerCase()
            ? 'correct'
            : 'incorrect'
        }
      }
    }

    const newSubmission: Submission = {
      id: randomUUID(),
      questionId,
      competitionId,
      studentUsername: session.username,
      answer,
      source: {
        volume: documentation.part,
        page: documentation.page,
        lineFrom: parseInt(documentation.lineFrom) || 0,
        lineTo: parseInt(documentation.lineTo) || 0,
        firstWord: documentation.firstWord,
        lastWord: documentation.lastWord
      },
      autoResult,
      finalResult: autoResult, // Set finalResult same as autoResult initially
      correctedBy: null,
      reason: null,
      submittedAt: new Date().toISOString()
    }

    await submissionsRepo.create(newSubmission)

    // Generate tickets if auto-graded as correct
    if (autoResult === 'correct') {
      try {
        await upsertTicketsForSubmission(newSubmission)
      } catch (error) {
        console.error('Error generating tickets:', error)
        // Don't fail the submission if ticket generation fails
      }
    }

    return NextResponse.json(newSubmission)
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
