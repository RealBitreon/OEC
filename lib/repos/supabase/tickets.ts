import { createServiceClient } from '@/lib/supabase/server'
import type { ITicketsRepo } from '../interfaces'
import type { Ticket } from '@/lib/store/types'

export class SupabaseTicketsRepo implements ITicketsRepo {
  async listByUser(userId: string, competitionId: string): Promise<Ticket[]> {
    // Tickets are now calculated from submissions
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('participant_name', userId)
      .eq('competition_id', competitionId)
      .eq('status', 'approved')

    if (error) return []

    return (data || []).map(s => ({
      id: s.id,
      userId,
      competitionId,
      count: s.tickets_earned || 0,
      reason: 'Correct answers',
      createdAt: s.submitted_at,
    }))
  }

  async listByCompetition(competitionId: string): Promise<Ticket[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('status', 'approved')

    if (error) return []

    return (data || []).map(s => ({
      id: s.id,
      userId: s.participant_name,
      competitionId,
      count: s.tickets_earned || 0,
      reason: 'Correct answers',
      createdAt: s.submitted_at,
    }))
  }

  async create(ticket: Ticket): Promise<Ticket> {
    // Tickets are managed through submissions
    return ticket
  }

  async update(id: string, patch: Partial<Ticket>): Promise<Ticket> {
    throw new Error('Tickets are managed through submissions')
  }

  async delete(id: string): Promise<void> {
    // Tickets are managed through submissions
  }

  async deleteByCompetition(competitionId: string): Promise<void> {
    // Tickets are managed through submissions
  }

  async recalculate(competitionId: string): Promise<void> {
    // Recalculation happens automatically through submission updates
  }
}
