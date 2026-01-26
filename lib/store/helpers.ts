import { competitionsRepo } from '@/lib/repos'

interface Competition {
  id: string
  slug: string
  status: 'draft' | 'active' | 'archived'
}

export async function getActiveCompetition(): Promise<Competition | null> {
  return await competitionsRepo.getActive()
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
