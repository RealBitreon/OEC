import type { IQuestionsRepo } from '../interfaces'
import type { Question } from '@/lib/store/types'
import { readQuestions, writeQuestions } from '@/lib/store/readWrite'

export class JsonQuestionsRepo implements IQuestionsRepo {
  async listByCompetition(competitionId: string): Promise<Question[]> {
    const questions = await readQuestions() as Question[]
    return questions.filter((q: Question) => q.competitionId === competitionId)
  }

  async listTraining(): Promise<Question[]> {
    const questions = await readQuestions() as Question[]
    return questions.filter((q: Question) => q.isTraining === true || q.competitionId === null)
  }

  async listActive(): Promise<Question[]> {
    const questions = await readQuestions() as Question[]
    return questions.filter((q: Question) => q.isActive)
  }

  async getById(id: string): Promise<Question | null> {
    const questions = await readQuestions() as Question[]
    return questions.find((q: Question) => q.id === id) || null
  }

  async create(data: Question): Promise<Question> {
    const questions = await readQuestions() as Question[]
    questions.push(data)
    await writeQuestions(questions)
    return data
  }

  async update(id: string, patch: Partial<Question>): Promise<Question> {
    const questions = await readQuestions() as Question[]
    const index = questions.findIndex((q: Question) => q.id === id)
    
    if (index === -1) {
      throw new Error('Question not found')
    }

    questions[index] = { ...questions[index], ...patch }
    await writeQuestions(questions)
    return questions[index]
  }

  async delete(id: string): Promise<void> {
    const questions = await readQuestions() as Question[]
    const filtered = questions.filter((q: Question) => q.id !== id)
    await writeQuestions(filtered)
  }
}
