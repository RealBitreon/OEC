import { createServiceClient } from '@/lib/supabase/server'
import type { IWheelRepo, IWinnersRepo, IParticipantsRepo, ITrainingSubmissionsRepo } from '../interfaces'
import type { WheelRun, Winner, Participant, TrainingSubmission } from '@/lib/store/types'

export class SupabaseWheelRepo implements IWheelRepo {
  async getByCompetition(competitionId: string): Promise<WheelRun | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('wheel_spins')
      .select('*')
      .eq('competition_id', competitionId)
      .order('spun_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      competitionId: data.competition_id,
      winnerId: data.submission_id || '',
      snapshot: {},
      ranAt: data.spun_at,
      ranBy: '',
    }
  }

  async create(wheelRun: WheelRun): Promise<WheelRun> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('wheel_spins')
      .insert({
        competition_id: wheelRun.competitionId,
        submission_id: wheelRun.winnerId,
        participant_name: '',
        prize_name: 'Winner',
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create wheel run: ${error.message}`)

    return {
      id: data.id,
      competitionId: data.competition_id,
      winnerId: data.submission_id || '',
      snapshot: {},
      ranAt: data.spun_at,
      ranBy: '',
    }
  }

  async deleteByCompetition(competitionId: string): Promise<void> {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('wheel_spins')
      .delete()
      .eq('competition_id', competitionId)

    if (error) throw new Error(`Failed to delete wheel runs: ${error.message}`)
  }
}

export class SupabaseWinnersRepo implements IWinnersRepo {
  async getByCompetition(competitionId: string): Promise<Winner | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('wheel_spins')
      .select('*')
      .eq('competition_id', competitionId)
      .order('spun_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      competitionId: data.competition_id,
      userId: data.participant_name,
      displayName: data.participant_name,
      isPublic: true,
      wonAt: data.spun_at,
    }
  }

  async create(winner: Winner): Promise<Winner> {
    return winner // Managed through wheel_spins
  }

  async update(id: string, patch: Partial<Winner>): Promise<Winner> {
    throw new Error('Winners are managed through wheel_spins')
  }
}

export class SupabaseParticipantsRepo implements IParticipantsRepo {
  async getById(id: string): Promise<Participant | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      competitionId: data.competition_id,
      name: data.participant_name,
      phone: data.participant_email || '',
      createdAt: data.submitted_at,
    }
  }

  async listByCompetition(competitionId: string): Promise<Participant[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', competitionId)
      .order('submitted_at', { ascending: false })

    if (error) return []

    return (data || []).map(s => ({
      id: s.id,
      competitionId: s.competition_id,
      name: s.participant_name,
      phone: s.participant_email || '',
      createdAt: s.submitted_at,
    }))
  }

  async create(participant: Participant): Promise<Participant> {
    return participant // Managed through submissions
  }
}

export class SupabaseTrainingSubmissionsRepo implements ITrainingSubmissionsRepo {
  async listByUser(userId: string): Promise<TrainingSubmission[]> {
    // Training submissions could be stored separately or in submissions table
    return []
  }

  async create(submission: TrainingSubmission): Promise<TrainingSubmission> {
    return submission
  }
}
