import type { ITrainingSubmissionsRepo } from '../interfaces'
import { readTrainingSubmissions, writeTrainingSubmissions } from '@/lib/store/readWrite'

export class JsonTrainingSubmissionsRepo implements ITrainingSubmissionsRepo {
  async list(filters?: { studentUsername?: string }): Promise<any[]> {
    let submissions = await readTrainingSubmissions() as any[]

    if (filters?.studentUsername) {
      submissions = submissions.filter((s: any) => s.studentUsername === filters.studentUsername)
    }

    return submissions
  }

  async create(data: any): Promise<any> {
    const submissions = await readTrainingSubmissions() as any[]
    submissions.push(data)
    await writeTrainingSubmissions(submissions)
    return data
  }
}
