import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { questionsRepo, trainingSubmissionsRepo } from '@/lib/repos'
import { generateId } from '@/lib/store/helpers'

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getSession()
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { questionId, answer, isCorrect } = body

    if (!questionId || answer === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify it's a training question
    const question = await questionsRepo.getById(questionId)

    if (!question || !question.isTraining || question.competitionId !== null) {
      return NextResponse.json(
        { error: 'Invalid training question' },
        { status: 400 }
      )
    }

    // Save training submission
    const newSubmission = {
      id: generateId(),
      questionId,
      studentUsername: session.username,
      answer,
      isCorrect,
      answeredAt: new Date().toISOString(),
    }

    await trainingSubmissionsRepo.create(newSubmission)

    return NextResponse.json({ success: true, submission: newSubmission })
  } catch (error) {
    console.error('Training submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
