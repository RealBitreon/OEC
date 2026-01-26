import type { ISubmissionsRepo } from '../interfaces'
import type { Submission } from '@/lib/store/types'
import { readSubmissions, writeSubmissions } from '@/lib/store/readWrite'

export class JsonSubmissionsRepo implements ISubmissionsRepo {
  async list(filters?: {
    competitionId?: string
    studentUsername?: string
    questionId?: string
    finalResult?: 'correct' | 'incorrect' | 'pending'
  }): Promise<Submission[]> {
    let submissions = await readSubmissions() as Submission[]

    if (filters?.competitionId) {
      submissions = submissions.filter((s: Submission) => s.competitionId === filters.competitionId)
    }
    if (filters?.studentUsername) {
      submissions = submissions.filter((s: Submission) => s.studentUsername === filters.studentUsername)
    }
    if (filters?.questionId) {
      submissions = submissions.filter((s: Submission) => s.questionId === filters.questionId)
    }
    if (filters?.finalResult) {
      submissions = submissions.filter((s: Submission) => s.finalResult === filters.finalResult)
    }

    return submissions
  }

  async getById(id: string): Promise<Submission | null> {
    const submissions = await readSubmissions() as Submission[]
    return submissions.find((s: Submission) => s.id === id) || null
  }

  async create(data: Submission): Promise<Submission> {
    const submissions = await readSubmissions() as Submission[]
    submissions.push(data)
    await writeSubmissions(submissions)
    return data
  }

  async update(id: string, patch: Partial<Submission>): Promise<Submission> {
    const submissions = await readSubmissions() as Submission[]
    const index = submissions.findIndex((s: Submission) => s.id === id)
    
    if (index === -1) {
      throw new Error('Submission not found')
    }

    submissions[index] = { ...submissions[index], ...patch }
    await writeSubmissions(submissions)
    return submissions[index]
  }

  async countCorrectByStudent(competitionId: string, studentUsername: string): Promise<number> {
    const submissions = await this.list({
      competitionId,
      studentUsername,
      finalResult: 'correct'
    })
    return submissions.length
  }
}
