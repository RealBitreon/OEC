import { createServiceClient } from '@/lib/supabase/server'
import type { ICompetitionsRepo } from '../interfaces'
import type { Competition } from '@/lib/store/types'

export class SupabaseCompetitionsRepo implements ICompetitionsRepo {
  private transformFromDb(data: any): Competition {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      status: data.status,
      startAt: data.start_at,
      endAt: data.end_at,
      wheelSpinAt: data.wheel_at,
      maxAttempts: data.max_attempts || 2,
      rules: data.rules || {
        eligibilityMode: 'all_correct',
        ticketsConfig: {
          baseTickets: 1,
          earlyBonusTiers: [],
        },
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async getActive(): Promise<Competition | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return this.transformFromDb(data)
  }

  async getBySlug(slug: string): Promise<Competition | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) return null
    return this.transformFromDb(data)
  }

  async getById(id: string): Promise<Competition | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.transformFromDb(data)
  }

  async listAll(): Promise<Competition[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list competitions: ${error.message}`)
    return (data || []).map(c => this.transformFromDb(c))
  }

  async listByStatus(status: 'active' | 'archived' | 'draft'): Promise<Competition[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list competitions by status: ${error.message}`)
    return (data || []).map(c => this.transformFromDb(c))
  }

  async create(competition: Competition): Promise<Competition> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('competitions')
      .insert({
        id: competition.id,
        title: competition.title,
        slug: competition.slug,
        description: competition.description,
        status: competition.status,
        start_at: competition.startAt,
        end_at: competition.endAt,
        wheel_at: competition.wheelSpinAt,
        max_attempts: competition.maxAttempts || 2,
        rules: competition.rules,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create competition: ${error.message}`)
    return this.transformFromDb(data)
  }

  async update(id: string, patch: Partial<Competition>): Promise<Competition> {
    const supabase = createServiceClient()
    const updateData: any = {}

    if (patch.title) updateData.title = patch.title
    if (patch.slug) updateData.slug = patch.slug
    if (patch.description !== undefined) updateData.description = patch.description
    if (patch.status) updateData.status = patch.status
    if (patch.startAt) updateData.start_at = patch.startAt
    if (patch.endAt) updateData.end_at = patch.endAt
    if (patch.wheelSpinAt) updateData.wheel_at = patch.wheelSpinAt
    if (patch.maxAttempts !== undefined) updateData.max_attempts = patch.maxAttempts
    if (patch.rules) updateData.rules = patch.rules

    const { data, error } = await supabase
      .from('competitions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update competition: ${error.message}`)
    return this.transformFromDb(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient()
    
    // First, move all questions to training
    const { error: questionsError } = await supabase
      .from('questions')
      .update({ 
        competition_id: null,
        source_ref: 'training'
      })
      .eq('competition_id', id)
    
    if (questionsError) {
      throw new Error(`Failed to move questions to training: ${questionsError.message}`)
    }
    
    // Delete related data (cascade should handle this, but being explicit)
    // Delete submissions
    await supabase
      .from('submissions')
      .delete()
      .eq('competition_id', id)
    
    // Delete tickets
    await supabase
      .from('tickets')
      .delete()
      .eq('competition_id', id)
    
    // Delete wheel runs
    await supabase
      .from('wheel_runs')
      .delete()
      .eq('competition_id', id)
    
    // Delete winners
    await supabase
      .from('winners')
      .delete()
      .eq('competition_id', id)
    
    // Finally, delete the competition
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete competition: ${error.message}`)
  }

  async archiveActive(): Promise<void> {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('competitions')
      .update({ status: 'archived' })
      .eq('status', 'active')

    if (error) throw new Error(`Failed to archive active competitions: ${error.message}`)
  }
}
