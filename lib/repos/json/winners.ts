import type { IWinnersRepo } from '../interfaces'
import type { Winner } from '@/lib/store/types'
import { readWinners, writeWinners } from '@/lib/store/readWrite'

export class JsonWinnersRepo implements IWinnersRepo {
  async getByCompetition(competitionId: string): Promise<Winner | null> {
    const winners = await readWinners() as Winner[]
    return winners.find((w: Winner) => w.competitionId === competitionId) || null
  }

  async listAll(): Promise<Winner[]> {
    return await readWinners() as Winner[]
  }

  async create(data: Winner): Promise<Winner> {
    const winners = await readWinners() as Winner[]
    winners.push(data)
    await writeWinners(winners)
    return data
  }
}
