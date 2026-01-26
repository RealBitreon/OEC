import type { ITrainingSubmissionsRepo } from '../interfaces'

export class SupabaseTrainingSubmissionsRepo implements ITrainingSubmissionsRepo {
  async list(filters?: { studentUsername?: string }): Promise<any[]> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: any): Promise<any> {
    throw new Error('Supabase repo not enabled')
  }
}
