'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { questionsRepo, competitionsRepo } from '@/lib/repos'

export interface QuestionFormData {
  competition_id: string | null
  is_training: boolean
  type: 'mcq' | 'true_false' | 'text'
  question_text: string
  options?: string[]
  correct_answer: string | null
  source_ref: {
    volume: string
    page: string
    lineFrom: string
    lineTo: string
  }
}

export interface QuestionFilters {
  competition_id?: string
  type?: string
  is_training?: boolean
  has_correct_answer?: boolean
  search?: string
}

export async function getQuestions(filters: QuestionFilters = {}, page = 1, limit = 20) {
  let questions = await questionsRepo.listAll()
  
  // Apply filters
  if (filters.competition_id) {
    questions = questions.filter(q => q.competitionId === filters.competition_id)
  }
  if (filters.type) {
    questions = questions.filter(q => q.type === filters.type)
  }
  if (filters.is_training !== undefined) {
    questions = questions.filter(q => q.isTraining === filters.is_training)
  }
  if (filters.has_correct_answer !== undefined) {
    questions = questions.filter(q => 
      filters.has_correct_answer ? !!q.correctAnswer : !q.correctAnswer
    )
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    questions = questions.filter(q => 
      q.questionText.toLowerCase().includes(search)
    )
  }

  // Pagination
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedQuestions = questions.slice(start, end)

  return {
    questions: paginatedQuestions,
    total: questions.length,
    page,
    limit,
    totalPages: Math.ceil(questions.length / limit)
  }
}

export async function getQuestionById(id: string) {
  return await questionsRepo.getById(id)
}

export async function createQuestion(data: QuestionFormData) {
  const question = {
    id: randomUUID(),
    competitionId: data.competition_id,
    isTraining: data.is_training,
    type: data.type,
    questionText: data.question_text,
    options: data.options,
    correctAnswer: data.correct_answer || '',
    sourceRef: data.source_ref,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await questionsRepo.create(question)
  revalidatePath('/dashboard')
  return { success: true, question }
}

export async function updateQuestion(id: string, data: Partial<QuestionFormData>) {
  const updates: any = {
    updatedAt: new Date().toISOString(),
  }

  if (data.competition_id !== undefined) updates.competitionId = data.competition_id
  if (data.is_training !== undefined) updates.isTraining = data.is_training
  if (data.type) updates.type = data.type
  if (data.question_text) updates.questionText = data.question_text
  if (data.options) updates.options = data.options
  if (data.correct_answer !== undefined) updates.correctAnswer = data.correct_answer
  if (data.source_ref) updates.sourceRef = data.source_ref

  await questionsRepo.update(id, updates)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteQuestion(id: string) {
  await questionsRepo.delete(id)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleQuestionActive(id: string) {
  const question = await questionsRepo.getById(id)
  if (!question) throw new Error('Question not found')

  await questionsRepo.update(id, { isActive: !question.isActive })
  revalidatePath('/dashboard')
  return { success: true }
}

export async function duplicateQuestion(id: string) {
  const question = await questionsRepo.getById(id)
  if (!question) throw new Error('Question not found')

  const duplicated = {
    id: randomUUID(),
    competitionId: question.competitionId,
    isTraining: question.isTraining,
    type: question.type,
    questionText: question.questionText + ' (نسخة)',
    options: question.options,
    correctAnswer: question.correctAnswer,
    sourceRef: question.sourceRef,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await questionsRepo.create(duplicated)
  revalidatePath('/dashboard')
  return { success: true, question: duplicated }
}

export async function moveToTraining(id: string) {
  await questionsRepo.update(id, {
    competitionId: null,
    isTraining: true,
    updatedAt: new Date().toISOString(),
  })
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getCompetitions() {
  return await competitionsRepo.listAll()
}
