'use server'

import { revalidatePath } from 'next/cache'
import { Competition as DashboardCompetition } from '../core/types'
import { Competition as RepoCompetition } from '@/lib/store/types'
import crypto from 'crypto'
import { competitionsRepo } from '@/lib/repos'

// Transform dashboard format to repo format
function toRepoFormat(data: Partial<DashboardCompetition>): Partial<RepoCompetition> {
  const result: any = {}
  
  if (data.id) result.id = data.id
  if (data.title) result.title = data.title
  if (data.description !== undefined) result.description = data.description
  if (data.status) result.status = data.status
  if (data.start_at) result.startAt = data.start_at
  if (data.end_at) result.endAt = data.end_at
  if (data.wheel_at) result.wheelSpinAt = data.wheel_at
  if (data.created_at) result.createdAt = data.created_at
  
  // Transform rules
  if (data.rules) {
    result.rules = {
      eligibilityMode: data.rules.eligibilityMode,
      minCorrectAnswers: data.rules.minCorrectAnswers,
      ticketsConfig: {
        baseTickets: data.rules.ticketsPerCorrect || 1,
        earlyBonusTiers: (data.rules.earlyBonusTiers || []).map(tier => ({
          beforeDate: tier.cutoffDate,
          bonusTickets: tier.bonusTickets,
        })),
      },
    }
  }
  
  return result
}

// Transform repo format to dashboard format
function toDashboardFormat(data: RepoCompetition): DashboardCompetition {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    start_at: data.startAt,
    end_at: data.endAt,
    wheel_at: data.wheelSpinAt,
    rules: {
      eligibilityMode: data.rules.eligibilityMode,
      minCorrectAnswers: data.rules.minCorrectAnswers,
      ticketsPerCorrect: data.rules.ticketsConfig?.baseTickets || 1,
      earlyBonusTiers: (data.rules.ticketsConfig?.earlyBonusTiers || []).map(tier => ({
        cutoffDate: tier.beforeDate,
        bonusTickets: tier.bonusTickets,
      })),
    },
    created_by: '', // Not in repo type
    created_at: data.createdAt,
  }
}

export async function getCompetitions() {
  const competitions = await competitionsRepo.listAll()
  return competitions.map(toDashboardFormat)
}

export async function getCompetitionById(id: string) {
  const competition = await competitionsRepo.getById(id)
  return competition ? toDashboardFormat(competition) : null
}

export async function getCompetitionBySlug(slug: string) {
  const competition = await competitionsRepo.getBySlug(slug)
  return competition ? toDashboardFormat(competition) : null
}

export async function getActiveCompetition() {
  const competition = await competitionsRepo.getActive()
  return competition ? toDashboardFormat(competition) : null
}

export async function createCompetition(data: Omit<DashboardCompetition, 'id' | 'created_at' | 'created_by'>) {
  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  const competition: RepoCompetition = {
    id: crypto.randomUUID(),
    slug,
    ...toRepoFormat(data),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as RepoCompetition

  const created = await competitionsRepo.create(competition)
  revalidatePath('/dashboard')
  return { success: true, competition: toDashboardFormat(created) }
}

export async function updateCompetition(id: string, data: Partial<DashboardCompetition>) {
  const updates = toRepoFormat(data)
  await competitionsRepo.update(id, updates)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCompetition(id: string) {
  const competitions = await competitionsRepo.listAll()
  const competition = competitions.find(c => c.id === id)
  
  if (!competition) {
    throw new Error('Competition not found')
  }

  // Delete the competition and move questions to training
  await competitionsRepo.delete(id)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/competitions')
  revalidatePath('/dashboard/question-bank')
  return { success: true }
}

export async function archiveCompetition(id: string) {
  await competitionsRepo.update(id, { status: 'archived' })
  revalidatePath('/dashboard')
  return { success: true }
}

export async function activateCompetition(id: string) {
  // First, archive any currently active competition
  const competitions = await competitionsRepo.listAll()
  const activeCompetition = competitions.find(c => c.status === 'active')
  
  if (activeCompetition) {
    await competitionsRepo.update(activeCompetition.id, { status: 'archived' })
  }
  
  // Then activate the new competition
  await competitionsRepo.update(id, { status: 'active' })
  revalidatePath('/dashboard')
  return { success: true }
}
