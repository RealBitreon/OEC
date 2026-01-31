import { createServiceClient } from '@/lib/supabase/server'
import type { IQuestionsRepo } from '../interfaces'
import type { Question } from '@/lib/store/types'

export class SupabaseQuestionsRepo implements IQuestionsRepo {
  private transformFromDb(data: any): Question {
    return {
      id: data.id,
      competitionId: data.competition_id,
      isTraining: data.is_training || false,
      status: data.status || 'DRAFT',
      type: data.type,
      category: data.category,
      difficulty: data.difficulty,
      questionText: data.question_text,
      options: data.options || [],
      correctAnswer: data.correct_answer,
      sourceRef: {
        volume: data.volume || '',
        page: data.page || '',
        lineFrom: data.line_from || '',
        lineTo: data.line_to || '',
      },
      isActive: data.is_active !== false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async getById(id: string): Promise<Question | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.transformFromDb(data)
  }

  async listByCompetition(competitionId: string): Promise<Question[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('competition_id', competitionId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to list questions: ${error.message}`)
    return (data || []).map(q => this.transformFromDb(q))
  }

  async listTraining(): Promise<Question[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_training', true)
      .is('competition_id', null)
      .eq('status', 'PUBLISHED')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to list training questions: ${error.message}`)
    return (data || []).map(q => this.transformFromDb(q))
  }

  async listAll(): Promise<Question[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list all questions: ${error.message}`)
    return (data || []).map(q => this.transformFromDb(q))
  }

  async create(question: Question): Promise<Question> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .insert({
        id: question.id,
        competition_id: question.competitionId,
        is_training: question.isTraining,
        status: question.status || 'DRAFT',
        type: question.type,
        category: question.category,
        difficulty: question.difficulty,
        question_text: question.questionText,
        options: question.options,
        correct_answer: question.correctAnswer,
        volume: question.sourceRef?.volume,
        page: question.sourceRef?.page,
        line_from: question.sourceRef?.lineFrom,
        line_to: question.sourceRef?.lineTo,
        is_active: question.isActive,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create question: ${error.message}`)
    return this.transformFromDb(data)
  }

  async update(id: string, patch: Partial<Question>): Promise<Question> {
    const supabase = createServiceClient()
    const updateData: any = {}

    if (patch.competitionId !== undefined) updateData.competition_id = patch.competitionId
    if (patch.isTraining !== undefined) updateData.is_training = patch.isTraining
    if (patch.status !== undefined) updateData.status = patch.status
    if (patch.type) updateData.type = patch.type
    if (patch.category !== undefined) updateData.category = patch.category
    if (patch.difficulty !== undefined) updateData.difficulty = patch.difficulty
    if (patch.questionText) updateData.question_text = patch.questionText
    if (patch.options) updateData.options = patch.options
    if (patch.correctAnswer) updateData.correct_answer = patch.correctAnswer
    if (patch.sourceRef) {
      updateData.volume = patch.sourceRef.volume
      updateData.page = patch.sourceRef.page
      updateData.line_from = patch.sourceRef.lineFrom
      updateData.line_to = patch.sourceRef.lineTo
    }
    if (patch.isActive !== undefined) updateData.is_active = patch.isActive

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update question: ${error.message}`)
    return this.transformFromDb(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete question: ${error.message}`)
  }

  async moveToTraining(competitionId: string): Promise<void> {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('questions')
      .update({ 
        is_training: true,
        competition_id: null,
        is_active: false,
      })
      .eq('competition_id', competitionId)

    if (error) throw new Error(`Failed to move questions to training: ${error.message}`)
  }

  async listLibrary(): Promise<Question[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_training', false)
      .is('competition_id', null)
      .eq('status', 'DRAFT')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list library questions: ${error.message}`)
    return (data || []).map(q => this.transformFromDb(q))
  }

  async moveToLibrary(id: string): Promise<Question> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .update({
        status: 'DRAFT',
        is_training: false,
        competition_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to move question to library: ${error.message}`)
    return this.transformFromDb(data)
  }

  async publishToTraining(id: string): Promise<Question> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('questions')
      .update({
        status: 'PUBLISHED',
        is_training: true,
        competition_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to publish question to training: ${error.message}`)
    return this.transformFromDb(data)
  }

  async copyToCompetition(questionId: string, competitionId: string): Promise<Question> {
    const supabase = createServiceClient()
    
    // Get the source question
    const { data: sourceData, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (fetchError || !sourceData) {
      throw new Error(`Failed to fetch source question: ${fetchError?.message}`)
    }

    // Create a copy with new ID and competition_id
    const { data, error } = await supabase
      .from('questions')
      .insert({
        competition_id: competitionId,
        is_training: false,
        status: 'PUBLISHED',
        type: sourceData.type,
        category: sourceData.category,
        difficulty: sourceData.difficulty,
        question_text: sourceData.question_text,
        options: sourceData.options,
        correct_answer: sourceData.correct_answer,
        volume: sourceData.volume,
        page: sourceData.page,
        line_from: sourceData.line_from,
        line_to: sourceData.line_to,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to copy question to competition: ${error.message}`)
    return this.transformFromDb(data)
  }
}
