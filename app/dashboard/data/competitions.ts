// Competition data layer - handles all competition database operations
'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Competition } from '../core/types'
import { validateDates, ValidationError } from '../core/validation'
import { getUserProfile } from '../lib/auth'

export async function getCompetitions(): Promise<Competition[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getActiveCompetition(): Promise<Competition | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('status', 'active')
    .single()

  if (error) return null
  return data
}

interface CreateCompetitionInput {
  title: string
  slug: string
  description: string
  start_at: string
  end_at: string
  wheel_spin_at: string
}

export async function createCompetition(input: CreateCompetitionInput): Promise<Competition> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  validateDates(input.start_at, input.end_at, input.wheel_spin_at)

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('competitions')
    .insert({
      ...input,
      status: 'draft',
      rules: {
        eligibilityMode: 'all_correct',
        ticketsConfig: { baseTickets: 1 },
        allowManualAdjustments: true,
      },
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await serviceClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'competition_created',
    details: { competition_id: data.id, title: input.title },
  })

  revalidatePath('/dashboard')
  return data
}

export async function activateCompetition(competitionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const serviceClient = createServiceClient()

  await serviceClient
    .from('competitions')
    .update({ status: 'archived' })
    .eq('status', 'active')

  const { error } = await serviceClient
    .from('competitions')
    .update({ status: 'active' })
    .eq('id', competitionId)

  if (error) throw new Error(error.message)

  await serviceClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'competition_activated',
    details: { competition_id: competitionId },
  })

  revalidatePath('/dashboard')
}

export async function archiveCompetition(competitionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('competitions')
    .update({ status: 'archived' })
    .eq('id', competitionId)

  if (error) throw new Error(error.message)

  await serviceClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'competition_archived',
    details: { competition_id: competitionId },
  })

  revalidatePath('/dashboard')
}

export async function deleteCompetition(competitionId: string): Promise<void> {
  const user = await getUserProfile()
  if (!user) throw new ValidationError('غير مصرح')

  const serviceClient = createServiceClient()

  await serviceClient
    .from('questions')
    .update({ is_training: true, competition_id: null })
    .eq('competition_id', competitionId)

  const { error } = await serviceClient
    .from('competitions')
    .delete()
    .eq('id', competitionId)

  if (error) throw new Error(error.message)

  await serviceClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'competition_deleted',
    details: { competition_id: competitionId },
  })

  revalidatePath('/dashboard')
}
