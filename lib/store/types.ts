// Core type definitions for the application

export interface User {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher' | 'manager' | 'ceo'
  displayName?: string
  createdAt: string
  updatedAt: string
}

export interface Competition {
  id: string
  title: string
  slug: string
  description: string
  status: 'draft' | 'active' | 'archived'
  startAt: string
  endAt: string
  wheelSpinAt: string
  maxAttempts?: number
  winnerCount?: number // Number of winners to select (1-10), defaults to 1
  rules: {
    eligibilityMode: 'all_correct' | 'min_correct'
    minCorrectAnswers?: number
    ticketsConfig: {
      baseTickets: number
      earlyBonusTiers: Array<{
        beforeDate: string
        bonusTickets: number
      }>
    }
  }
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  competitionId: string | null
  isTraining: boolean
  status: 'DRAFT' | 'PUBLISHED'
  type: 'mcq' | 'true_false' | 'text' | 'fill_blank' | 'essay'
  category?: string
  difficulty?: 'سهل' | 'متوسط' | 'صعب'
  questionText: string
  options?: string[]
  correctAnswer: string
  sourceRef: {
    volume: string
    page: string
    lineFrom: string
    lineTo: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Submission {
  id: string
  userId: string
  competitionId: string
  questionId: string
  answer: string
  isCorrect: boolean
  finalResult?: 'correct' | 'incorrect'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface Ticket {
  id: string
  userId: string
  competitionId: string
  count: number
  reason: string
  createdAt: string
}

export interface WheelRun {
  id: string
  competitionId: string
  winnerId: string
  snapshot: any
  ranAt: string
  ranBy: string
}

export interface Winner {
  id: string
  competitionId: string
  userId: string
  displayName: string
  isPublic: boolean
  wonAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  details: any
  createdAt: string
}

export interface Participant {
  id: string
  competitionId: string
  name: string
  phone: string
  createdAt: string
}

export interface TrainingSubmission {
  id: string
  userId: string
  questionId: string
  answer: string
  isCorrect: boolean
  submittedAt: string
}
