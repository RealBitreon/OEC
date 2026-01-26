import type { IWinnersRepo } from '../interfaces'
import type { Winner } from '@/lib/store/types'

export class SupabaseWinnersRepo implements IWinnersRepo {
  async getByCompetition(competitionId: string): Promise<Winner | null> {
    throw new Error('Supabase repo not enabled')
  }

  async listAll(): Promise<Winner[]> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: Winner): Promise<Winner> {
    throw new Error('Supabase repo not enabled')
  }
}
