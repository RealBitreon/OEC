import type { ICompetitionsRepo } from '../interfaces'
import type { Competition } from '@/lib/store/types'
import { readCompetitions, writeCompetitions } from '@/lib/store/readWrite'

export class JsonCompetitionsRepo implements ICompetitionsRepo {
  async getActive(): Promise<Competition | null> {
    const competitions = await readCompetitions() as Competition[]
    return competitions.find((c: Competition) => c.status === 'active') || null
  }

  async getBySlug(slug: string): Promise<Competition | null> {
    const competitions = await readCompetitions() as Competition[]
    return competitions.find((c: Competition) => c.slug === slug) || null
  }

  async getById(id: string): Promise<Competition | null> {
    const competitions = await readCompetitions() as Competition[]
    return competitions.find((c: Competition) => c.id === id) || null
  }

  async listAll(): Promise<Competition[]> {
    return await readCompetitions() as Competition[]
  }

  async listByStatus(status: 'active' | 'archived' | 'draft'): Promise<Competition[]> {
    const competitions = await readCompetitions() as Competition[]
    return competitions.filter((c: Competition) => c.status === status)
  }

  async create(data: Competition): Promise<Competition> {
    const competitions = await readCompetitions() as Competition[]
    competitions.push(data)
    await writeCompetitions(competitions)
    return data
  }

  async update(id: string, patch: Partial<Competition>): Promise<Competition> {
    const competitions = await readCompetitions() as Competition[]
    const index = competitions.findIndex((c: Competition) => c.id === id)
    
    if (index === -1) {
      throw new Error('Competition not found')
    }

    competitions[index] = { ...competitions[index], ...patch }
    await writeCompetitions(competitions)
    return competitions[index]
  }

  async archiveActive(): Promise<void> {
    const competitions = await readCompetitions() as Competition[]
    competitions.forEach((c: Competition) => {
      if (c.status === 'active') {
        c.status = 'archived'
      }
    })
    await writeCompetitions(competitions)
  }
}
