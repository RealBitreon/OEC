import type { IQuestionsRepo } from '../interfaces'
import type { Question } from '@/lib/store/types'

export class SupabaseQuestionsRepo implements IQuestionsRepo {
  async listByCompetition(competitionId: string): Promise<Question[]> {
    throw new Error('Supabase repo not enabled')
  }

  async listTraining(): Promise<Question[]> {
    throw new Error('Supabase repo not enabled')
  }

  async listActive(): Promise<Question[]> {
    throw new Error('Supabase repo not enabled')
  }

  async getById(id: string): Promise<Question | null> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: Question): Promise<Question> {
    throw new Error('Supabase repo not enabled')
  }

  async update(id: string, patch: Partial<Question>): Promise<Question> {
    throw new Error('Supabase repo not enabled')
  }

  async delete(id: string): Promise<void> {
    throw new Error('Supabase repo not enabled')
  }
}
