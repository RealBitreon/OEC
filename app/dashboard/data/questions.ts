// Questions data layer - handles all question database operations
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Question, QuestionType } from '../core/types'
import {
  validateSourceReference,
  validateMCQOptions,
  validateCorrectAnswer,
  ValidationError,
} from '../core/validation'
import { getUserProfile } from '../lib/auth'

export interface QuestionFilters {
  competition_id?: string
  type?: QuestionType
  is_training?: boolean
  has_correct_answer?: boolean
  search?: string
}

export interface QuestionInput {
  competition_id: string | null
  is_training: boolean
  type: QuestionType
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

export async function getQuestions(
  filters: QuestionFilters = {},
  page = 1,
  limit = 20
) {
  const supabase = await createClient()

  let query = supabase
    .from('questions')
    .select('*, competition:competitions(title)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters.competition_id) query = query.eq('competition_id', filters.competition_id)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.is_training !== undefined) query = query.eq('is_training', filters.is_training)
  if (filters.has_correct_answer === false) query = query.is('correct_answer', null)
  if (filters.search) query = query.ilike('question_text', `%${filters.search}%`)

  const from = (page - 1) * limit
  const { data, error, count } = await query.range(from, from + limit - 1)

  if (error) throw new Error(error.message)

  return {
    questions: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  }
}

export async function createQuestion(input: QuestionInput): Promise<Question> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  validateSourceReference(input.source_ref)

  if (input.type === 'mcq' && input.options) {
    validateMCQOptions(input.options)
  }

  validateCorrectAnswer(input.type, input.correct_answer, input.options)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .insert({
      competition_id: input.competition_id,
      is_training: input.is_training,
      type: input.type,
      question_text: input.question_text,
      options: input.type === 'mcq' ? input.options : null,
      correct_answer: input.correct_answer,
      volume: input.source_ref.volume,
      page: input.source_ref.page,
      line_from: input.source_ref.lineFrom,
      line_to: input.source_ref.lineTo,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'question_created',
    details: { question_id: data.id, type: input.type },
  })

  revalidatePath('/dashboard')
  return data
}

export async function updateQuestion(
  questionId: string,
  input: Partial<QuestionInput>
): Promise<Question> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  if (input.source_ref) validateSourceReference(input.source_ref)
  if (input.type === 'mcq' && input.options) validateMCQOptions(input.options)

  const updateData: any = {}
  if (input.competition_id !== undefined) updateData.competition_id = input.competition_id
  if (input.is_training !== undefined) updateData.is_training = input.is_training
  if (input.type) updateData.type = input.type
  if (input.question_text) updateData.question_text = input.question_text
  if (input.options !== undefined) updateData.options = input.type === 'mcq' ? input.options : null
  if (input.correct_answer !== undefined) updateData.correct_answer = input.correct_answer
  if (input.source_ref) {
    updateData.volume = input.source_ref.volume
    updateData.page = input.source_ref.page
    updateData.line_from = input.source_ref.lineFrom
    updateData.line_to = input.source_ref.lineTo
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'question_updated',
    details: { question_id: questionId },
  })

  revalidatePath('/dashboard')
  return data
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ is_active: false })
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'question_deleted',
    details: { question_id: questionId },
  })

  revalidatePath('/dashboard')
}

export async function duplicateQuestion(questionId: string): Promise<Question> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { data: original, error: fetchError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (fetchError || !original) throw new Error('السؤال غير موجود')

  const { data, error } = await supabase
    .from('questions')
    .insert({
      competition_id: original.competition_id,
      is_training: original.is_training,
      type: original.type,
      question_text: original.question_text + ' (نسخة)',
      options: original.options,
      correct_answer: original.correct_answer,
      volume: original.volume,
      page: original.page,
      line_from: original.line_from,
      line_to: original.line_to,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'question_duplicated',
    details: { original_id: questionId, new_id: data.id },
  })

  revalidatePath('/dashboard')
  return data
}

export async function moveToTraining(questionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ is_training: true, competition_id: null })
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'question_moved_to_training',
    details: { question_id: questionId },
  })

  revalidatePath('/dashboard')
}

export async function setCorrectAnswer(questionId: string, correctAnswer: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ correct_answer: correctAnswer })
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'correct_answer_set',
    details: { question_id: questionId },
  })

  revalidatePath('/dashboard')
}

export type { QuestionInput as QuestionFormData }
