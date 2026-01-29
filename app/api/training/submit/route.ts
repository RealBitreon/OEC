import { NextRequest, NextResponse } from 'next/server'
import { questionsRepo, trainingSubmissionsRepo } from '@/lib/repos'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { questionId, answer, studentName } = body

    if (!questionId || !answer || !studentName) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة' },
        { status: 400 }
      )
    }

    // Fetch the question
    const question = await questionsRepo.getById(questionId)
    
    if (!question || !question.isTraining) {
      return NextResponse.json(
        { error: 'السؤال غير موجود' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()

    // Create training submission (using studentName as identifier)
    const submission = await trainingSubmissionsRepo.create({
      id: crypto.randomUUID(),
      userId: studentName.trim(), // Store student name instead of user ID
      questionId,
      answer: answer.trim(),
      isCorrect,
      submittedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      isCorrect,
      submission,
    })
  } catch (error) {
    console.error('Error submitting training answer:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    )
  }
}
