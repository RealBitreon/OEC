import type { ITicketsRepo } from '../interfaces'
import type { Ticket } from '@/lib/store/types'

export class SupabaseTicketsRepo implements ITicketsRepo {
  async listByCompetition(competitionId: string): Promise<Ticket[]> {
    throw new Error('Supabase repo not enabled')
  }

  async listByStudent(competitionId: string, studentUsername: string): Promise<Ticket[]> {
    throw new Error('Supabase repo not enabled')
  }

  async getTotalsByStudent(competitionId: string): Promise<Map<string, number>> {
    throw new Error('Supabase repo not enabled')
  }

  async getById(id: string): Promise<Ticket | null> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: Ticket): Promise<Ticket> {
    throw new Error('Supabase repo not enabled')
  }

  async deleteBySubmission(submissionId: string): Promise<void> {
    throw new Error('Supabase repo not enabled')
  }

  async deleteByCompetition(competitionId: string): Promise<void> {
    throw new Error('Supabase repo not enabled')
  }

  async bulkCreate(tickets: Ticket[]): Promise<void> {
    throw new Error('Supabase repo not enabled')
  }
}
