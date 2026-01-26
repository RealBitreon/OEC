import type { IWheelRepo } from '../interfaces'
import type { WheelRun } from '@/lib/store/types'
import { readWheelRuns, writeWheelRuns } from '@/lib/store/readWrite'

export class JsonWheelRepo implements IWheelRepo {
  async getRunByCompetition(competitionId: string): Promise<WheelRun | null> {
    const wheelRuns = await readWheelRuns() as WheelRun[]
    return wheelRuns.find((wr: WheelRun) => wr.competitionId === competitionId) || null
  }

  async getRunById(id: string): Promise<WheelRun | null> {
    const wheelRuns = await readWheelRuns() as WheelRun[]
    return wheelRuns.find((wr: WheelRun) => wr.id === id) || null
  }

  async listRuns(filters?: { competitionId?: string; status?: string }): Promise<WheelRun[]> {
    let wheelRuns = await readWheelRuns() as WheelRun[]

    if (filters?.competitionId) {
      wheelRuns = wheelRuns.filter((wr: WheelRun) => wr.competitionId === filters.competitionId)
    }
    if (filters?.status) {
      wheelRuns = wheelRuns.filter((wr: WheelRun) => wr.status === filters.status)
    }

    return wheelRuns
  }

  async create(data: WheelRun): Promise<WheelRun> {
    const wheelRuns = await readWheelRuns() as WheelRun[]
    wheelRuns.push(data)
    await writeWheelRuns(wheelRuns)
    return data
  }

  async update(id: string, patch: Partial<WheelRun>): Promise<WheelRun> {
    const wheelRuns = await readWheelRuns() as WheelRun[]
    const index = wheelRuns.findIndex((wr: WheelRun) => wr.id === id)
    
    if (index === -1) {
      throw new Error('Wheel run not found')
    }

    wheelRuns[index] = { ...wheelRuns[index], ...patch }
    await writeWheelRuns(wheelRuns)
    return wheelRuns[index]
  }
}
