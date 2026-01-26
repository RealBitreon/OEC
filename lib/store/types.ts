export interface Competition {
  id: string
  slug: string
  title: string
  status: 'active' | 'archived' | 'draft'
  startAt: string
  endAt: string
  wheelSpinAt: string
  publishedAt?: string
  rules: {
    eligibility: {
      mode: 'all_correct' | 'min_correct'
      minCorrect: number
    }
    tickets: {
      basePerCorrect: number
      earlyBonusMode: 'tiers' | 'none'
      tiers: Array<{
        fromHours: number
        toHours: number
        bonus: number
      }>
      startReference: 'competition_published_at'
    }
  }
  createdBy: string
  createdAt: string
}

export interface Question {
  id: string
  competitionId: string | null
  type: 'text' | 'true_false' | 'mcq'
  title: string
  body: string
  options?: string[]
  correctAnswer: any
  isActive: boolean
  isTraining?: boolean
  createdAt: string
}

export interface Submission {
  id: string
  competitionId: string
  questionId: string
  studentUsername: string
  answer: any
  source: {
    volume: string
    page: string
    lineFrom: number
    lineTo: number
    firstWord: string
    lastWord: string
  }
  autoResult: 'correct' | 'incorrect' | 'pending'
  finalResult: 'correct' | 'incorrect' | 'pending'
  correctedBy: string | null
  reason: string | null
  submittedAt: string
}

export interface Winner {
  competitionId: string
  winnerUsername: string
  runAt: string
  wheelRunId?: string
  notes?: string
}

export interface WheelRun {
  id: string
  competitionId: string
  competitionSlug: string
  status: 'ready' | 'running' | 'done'
  lockedAt: string
  runAt: string | null
  lockedBy: string
  rulesSnapshot: {
    eligibility: {
      mode: 'all_correct' | 'min_correct'
      minCorrect: number
    }
    tickets: {
      basePerCorrect: number
      earlyBonusMode: 'tiers' | 'none'
      tiers: Array<{
        fromHours: number
        toHours: number
        bonus: number
      }>
      startReference: 'competition_published_at'
    }
  }
  candidatesSnapshot: Array<{
    studentUsername: string
    tickets: number
  }>
  totalTickets: number
  winnerUsername: string | null
  winnerTicketIndex: number | null
  seed: string
}

export interface AuditLog {
  id: string
  action: string
  performedBy: string
  details: any
  timestamp: string
}

export interface Ticket {
  id: string
  competitionId: string
  studentUsername: string
  submissionId: string
  questionId: string
  count: number
  reason: string
  createdAt: string
}
