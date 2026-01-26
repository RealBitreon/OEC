import type { ISubmissionsRepo } from '../interfaces'
import type { Submission } from '@/lib/store/types'

export class SupabaseSubmissionsRepo implements ISubmissionsRepo {
  async list(filters?: {
    competitionId?: string
    studentUsername?: string
    questionId?: string
    finalResult?: 'correct' | 'incorrect' | 'pending'
  }): Promise<Submission[]> {
    throw new Error('Supabase repo not enabled')
  }

  async getById(id: string): Promise<Submission | null> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: Submission): Promise<Submission> {
    throw new Error('Supabase repo not enabled')
  }

  async update(id: string, patch: Partial<Submission>): Promise<Submission> {
    throw new Error('Supabase repo not enabled')
  }

  async countCorrectByStudent(competitionId: string, studentUsername: string): Promise<number> {
    throw new Error('Supabase repo not enabled')
  }
}
