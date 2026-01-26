import type { IWheelRepo } from '../interfaces'
import type { WheelRun } from '@/lib/store/types'

export class SupabaseWheelRepo implements IWheelRepo {
  async getRunByCompetition(competitionId: string): Promise<WheelRun | null> {
    throw new Error('Supabase repo not enabled')
  }

  async getRunById(id: string): Promise<WheelRun | null> {
    throw new Error('Supabase repo not enabled')
  }

  async listRuns(filters?: { competitionId?: string; status?: string }): Promise<WheelRun[]> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: WheelRun): Promise<WheelRun> {
    throw new Error('Supabase repo not enabled')
  }

  async update(id: string, patch: Partial<WheelRun>): Promise<WheelRun> {
    throw new Error('Supabase repo not enabled')
  }
}
