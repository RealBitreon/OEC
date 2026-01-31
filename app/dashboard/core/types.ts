// ============================================
// CORE TYPES - SINGLE SOURCE OF TRUTH
// ============================================

export type UserRole = 'CEO' | 'LRC_MANAGER'

export interface User {
  id: string
  username: string
  role: UserRole
  createdAt: string
}

export type CompetitionStatus = 'draft' | 'active' | 'archived'

export interface Competition {
  id: string
  title: string
  description: string
  status: CompetitionStatus
  start_at: string
  end_at: string
  wheel_at: string
  max_attempts?: number
  rules: CompetitionRules
  created_by: string
  created_at: string
}

export interface CompetitionRules {
  eligibilityMode: 'all_correct' | 'min_correct' | 'per_correct'
  minCorrectAnswers?: number
  ticketsPerCorrect?: number
  earlyBonusTiers?: Array<{
    cutoffDate: string
    bonusTickets: number
  }>
}

export type QuestionType = 'mcq' | 'true_false' | 'text'
export type QuestionStatus = 'DRAFT' | 'PUBLISHED'

export interface Question {
  id: string
  competition_id: string | null
  is_training: boolean
  status: QuestionStatus
  type: QuestionType
  question_text: string
  options: string[] | null
  correct_answer: string | null
  volume: string
  page: string
  line_from: string
  line_to: string
  is_active: boolean
  created_at: string
}

export interface Submission {
  id: string
  competition_id: string
  question_id: string
  user_id: string
  answer: string
  student_source_ref: {
    volume: string
    page: string
    lineFrom: string
    lineTo: string
  }
  auto_result: 'correct' | 'incorrect' | null
  final_result: 'correct' | 'incorrect' | null
  reviewed_by: string | null
  reviewed_at: string | null
  submitted_at: string
}

export interface Ticket {
  id: string
  competition_id: string
  user_id: string
  count: number
  reason: string
  created_at: string
}

export interface WheelRun {
  id: string
  competition_id: string
  locked_snapshot: any
  winner_id: string | null
  run_at: string | null
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  meta: any
  created_at: string
}

export type DashboardSection = 
  | 'overview'
  | 'competitions'
  | 'training-questions'
  | 'question-bank'
  | 'archives'
  | 'users'
  | 'audit'
  | 'settings'
