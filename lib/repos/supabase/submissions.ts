import { createServiceClient } from '@/lib/supabase/server'
import type { ISubmissionsRepo } from '../interfaces'
import type { Submission } from '@/lib/store/types'

export class SupabaseSubmissionsRepo implements ISubmissionsRepo {
  private transformFromDb(data: any): Submission {
    return {
      id: data.id,
      userId: data.participant_name, // Using participant_name as userId for now
      competitionId: data.competition_id,
      questionId: '', // Not directly stored in new schema
      answer: JSON.stringify(data.answers),
      isCorrect: data.status === 'approved',
      finalResult: data.status === 'approved' ? 'correct' : 'incorrect',
      submittedAt: data.submitted_at,
      reviewedAt: data.reviewed_at,
      reviewedBy: data.reviewed_by,
    }
  }

  async getById(id: string): Promise<Submission | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.transformFromDb(data)
  }

  async listByUser(userId: string): Promise<Submission[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('participant_name', userId)
      .order('submitted_at', { ascending: false })

    if (error) throw new Error(`Failed to list submissions: ${error.message}`)
    return (data || []).map(s => this.transformFromDb(s))
  }

  async listByCompetition(competitionId: string): Promise<Submission[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', competitionId)
      .order('submitted_at', { ascending: false })

    if (error) throw new Error(`Failed to list submissions: ${error.message}`)
    return (data || []).map(s => this.transformFromDb(s))
  }

  async create(submission: Submission): Promise<Submission> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        id: submission.id,
        competition_id: submission.competitionId,
        participant_name: submission.userId,
        answers: JSON.parse(submission.answer),
        status: 'pending',
        submitted_at: submission.submittedAt,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create submission: ${error.message}`)
    return this.transformFromDb(data)
  }

  async update(id: string, patch: Partial<Submission>): Promise<Submission> {
    const supabase = createServiceClient()
    const updateData: any = {}

    if (patch.finalResult) {
      updateData.status = patch.finalResult === 'correct' ? 'approved' : 'rejected'
    }
    if (patch.reviewedAt) updateData.reviewed_at = patch.reviewedAt
    if (patch.reviewedBy) updateData.reviewed_by = patch.reviewedBy

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update submission: ${error.message}`)
    return this.transformFromDb(data)
  }

  async deleteByCompetition(competitionId: string): Promise<void> {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('competition_id', competitionId)

    if (error) throw new Error(`Failed to delete submissions: ${error.message}`)
  }
}
