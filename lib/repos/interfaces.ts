/**
 * Repository interfaces for data access layer
 * These interfaces abstract the underlying data store (JSON, Supabase, etc.)
 */

import type { 
  Competition, 
  Question, 
  Submission, 
  Ticket, 
  WheelRun, 
  Winner, 
  AuditLog 
} from '@/lib/store/types'
import type { User } from '@/lib/auth/types'

// Competitions Repository
export interface ICompetitionsRepo {
  getActive(): Promise<Competition | null>
  getBySlug(slug: string): Promise<Competition | null>
  getById(id: string): Promise<Competition | null>
  listAll(): Promise<Competition[]>
  listByStatus(status: 'active' | 'archived' | 'draft'): Promise<Competition[]>
  create(data: Competition): Promise<Competition>
  update(id: string, patch: Partial<Competition>): Promise<Competition>
  archiveActive(): Promise<void>
}

// Questions Repository
export interface IQuestionsRepo {
  listByCompetition(competitionId: string): Promise<Question[]>
  listTraining(): Promise<Question[]>
  listActive(): Promise<Question[]>
  getById(id: string): Promise<Question | null>
  create(data: Question): Promise<Question>
  update(id: string, patch: Partial<Question>): Promise<Question>
  delete(id: string): Promise<void>
}

// Submissions Repository
export interface ISubmissionsRepo {
  list(filters?: {
    competitionId?: string
    studentUsername?: string
    questionId?: string
    finalResult?: 'correct' | 'incorrect' | 'pending'
  }): Promise<Submission[]>
  getById(id: string): Promise<Submission | null>
  create(data: Submission): Promise<Submission>
  update(id: string, patch: Partial<Submission>): Promise<Submission>
  countCorrectByStudent(competitionId: string, studentUsername: string): Promise<number>
}

// Tickets Repository
export interface ITicketsRepo {
  listByCompetition(competitionId: string): Promise<Ticket[]>
  listByStudent(competitionId: string, studentUsername: string): Promise<Ticket[]>
  getTotalsByStudent(competitionId: string): Promise<Map<string, number>>
  getById(id: string): Promise<Ticket | null>
  create(data: Ticket): Promise<Ticket>
  deleteBySubmission(submissionId: string): Promise<void>
  deleteByCompetition(competitionId: string): Promise<void>
  bulkCreate(tickets: Ticket[]): Promise<void>
}

// Wheel Repository
export interface IWheelRepo {
  getRunByCompetition(competitionId: string): Promise<WheelRun | null>
  getRunById(id: string): Promise<WheelRun | null>
  listRuns(filters?: { competitionId?: string; status?: string }): Promise<WheelRun[]>
  create(data: WheelRun): Promise<WheelRun>
  update(id: string, patch: Partial<WheelRun>): Promise<WheelRun>
}

// Winners Repository
export interface IWinnersRepo {
  getByCompetition(competitionId: string): Promise<Winner | null>
  listAll(): Promise<Winner[]>
  create(data: Winner): Promise<Winner>
}

// Users Repository
export interface IUsersRepo {
  findByUsername(username: string): Promise<User | null>
  listAll(): Promise<User[]>
  create(data: User): Promise<User>
  updateRole(username: string, role: 'ceo' | 'lrc_manager' | 'student'): Promise<User>
}

// Audit Repository
export interface IAuditRepo {
  list(filters?: {
    action?: string
    performedBy?: string
    limit?: number
  }): Promise<AuditLog[]>
  append(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>
}

// Training Submissions Repository
export interface ITrainingSubmissionsRepo {
  list(filters?: { studentUsername?: string }): Promise<any[]>
  create(data: any): Promise<any>
}
