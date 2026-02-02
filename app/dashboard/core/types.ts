// Core types for dashboard
export type UserRole = 'CEO' | 'LRC_MANAGER'

export interface User {
  id: string
  username: string
  email?: string
  role: UserRole
  createdAt: string
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
