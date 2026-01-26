import type { ICompetitionsRepo } from '../interfaces'
import type { Competition } from '@/lib/store/types'

export class SupabaseCompetitionsRepo implements ICompetitionsRepo {
  async getActive(): Promise<Competition | null> {
    throw new Error('Supabase repo not enabled')
  }

  async getBySlug(slug: string): Promise<Competition | null> {
    throw new Error('Supabase repo not enabled')
  }

  async getById(id: string): Promise<Competition | null> {
    throw new Error('Supabase repo not enabled')
  }

  async listAll(): Promise<Competition[]> {
    throw new Error('Supabase repo not enabled')
  }

  async listByStatus(status: 'active' | 'archived' | 'draft'): Promise<Competition[]> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: Competition): Promise<Competition> {
    throw new Error('Supabase repo not enabled')
  }

  async update(id: string, patch: Partial<Competition>): Promise<Competition> {
    throw new Error('Supabase repo not enabled')
  }

  async archiveActive(): Promise<void> {
    throw new Error('Supabase repo not enabled')
  }
}
