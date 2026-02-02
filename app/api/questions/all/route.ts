import { NextResponse } from 'next/server'
import { questionsRepo } from '@/lib/repos'

export async function GET() {
  try {
    const questions = await questionsRepo.listAll()
    
    // Transform to match the expected format
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      competition_id: q.competitionId,
      is_training: q.isTraining,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      question_text: q.questionText,
      options: q.options,
      correct_answer: q.correctAnswer,
      volume: q.sourceRef.volume,
      page: q.sourceRef.page,
      line_from: q.sourceRef.lineFrom,
      line_to: q.sourceRef.lineTo,
      is_active: q.isActive,
      created_at: q.createdAt,
      status: q.status
    }))

    return NextResponse.json({ questions: transformedQuestions })
  } catch (error: any) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.message },
      { status: 500 }
    )
  }
}
