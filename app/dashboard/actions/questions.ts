'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { questionsRepo, competitionsRepo } from '@/lib/repos'
import type { Question as RepoQuestion } from '@/lib/store/types'
import type { Question as DashboardQuestion } from '../core/types'

// Transform repo format to dashboard format
function toDashboardFormat(q: RepoQuestion): DashboardQuestion {
  return {
    id: q.id,
    competition_id: q.competitionId,
    is_training: q.isTraining,
    status: 'PUBLISHED', // Default to PUBLISHED for existing questions
    type: q.type as DashboardQuestion['type'],
    question_text: q.questionText,
    options: q.options || null,
    correct_answer: q.correctAnswer || null,
    volume: q.sourceRef.volume,
    page: q.sourceRef.page,
    line_from: q.sourceRef.lineFrom,
    line_to: q.sourceRef.lineTo,
    is_active: q.isActive,
    created_at: q.createdAt,
  }
}

export interface QuestionFormData {
  competition_id: string | null
  is_training: boolean
  status: 'DRAFT' | 'PUBLISHED'
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
    questions: paginatedQuestions.map(toDashboardFormat),
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
  // ENFORCE: Questions from library/training pages must have competition_id = NULL
  if (data.competition_id !== null) {
    throw new Error('Questions cannot be directly assigned to competitions. Use addToCompetition instead.')
  }

  const question = {
    id: randomUUID(),
    competitionId: null, // Always null for new questions
    isTraining: data.is_training,
    status: data.status,
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

  // ENFORCE: Cannot set competition_id through update
  // Use addToCompetition or copyToCompetition instead
  if (data.competition_id !== undefined && data.competition_id !== null) {
    throw new Error('Cannot assign questions to competitions through update. Use addToCompetition instead.')
  }

  if (data.is_training !== undefined) updates.isTraining = data.is_training
  if (data.status !== undefined) updates.status = data.status
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
    status: 'DRAFT' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await questionsRepo.create(duplicated)
  revalidatePath('/dashboard')
  return { success: true, question: duplicated }
}

export async function moveToTraining(id: string) {
  await questionsRepo.publishToTraining(id)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function moveToLibrary(id: string) {
  await questionsRepo.moveToLibrary(id)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getLibraryQuestions() {
  const questions = await questionsRepo.listLibrary()
  return questions.map(toDashboardFormat)
}

export async function addQuestionsToCompetition(questionIds: string[], competitionId: string) {
  // Verify competition exists
  const competition = await competitionsRepo.getById(competitionId)
  if (!competition) {
    throw new Error('Competition not found')
  }

  // Copy each question to the competition
  const copiedQuestions = []
  for (const questionId of questionIds) {
    const copied = await questionsRepo.copyToCompetition(questionId, competitionId)
    copiedQuestions.push(copied)
  }

  revalidatePath('/dashboard')
  return { success: true, count: copiedQuestions.length }
}

export async function bulkImportQuestions(
  questions: Array<Omit<QuestionFormData, 'competition_id' | 'is_training' | 'status'>>,
  destination: 'library' | 'training'
) {
  const imported = []
  
  for (const q of questions) {
    const questionData: QuestionFormData = {
      ...q,
      competition_id: null, // Always null for imports
      is_training: destination === 'training',
      status: destination === 'training' ? 'PUBLISHED' : 'DRAFT',
    }
    
    const result = await createQuestion(questionData)
    imported.push(result.question)
  }

  revalidatePath('/dashboard')
  return { success: true, count: imported.length, questions: imported }
}

export async function getCompetitions() {
  return await competitionsRepo.listAll()
}
