// Repository interfaces for data access layer

import type {
  User,
  Competition,
  Question,
  Submission,
  Ticket,
  WheelRun,
  Winner,
  AuditLog,
  Participant,
  TrainingSubmission,
} from '@/lib/store/types'

export interface IUsersRepo {
  getById(id: string): Promise<User | null>
  getByUsername(username: string): Promise<User | null>
  create(data: User): Promise<User>
  update(id: string, patch: Partial<User>): Promise<User>
  listAll(): Promise<User[]>
}

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

export interface IQuestionsRepo {
  getById(id: string): Promise<Question | null>
  listByCompetition(competitionId: string): Promise<Question[]>
  listTraining(): Promise<Question[]>
  listLibrary(): Promise<Question[]>
  listAll(): Promise<Question[]>
  create(data: Question): Promise<Question>
  update(id: string, patch: Partial<Question>): Promise<Question>
  delete(id: string): Promise<void>
  moveToTraining(competitionId: string): Promise<void>
  moveToLibrary(id: string): Promise<Question>
  publishToTraining(id: string): Promise<Question>
  copyToCompetition(questionId: string, competitionId: string): Promise<Question>
}

export interface ISubmissionsRepo {
  getById(id: string): Promise<Submission | null>
  listByUser(userId: string): Promise<Submission[]>
  listByCompetition(competitionId: string): Promise<Submission[]>
  create(data: Submission): Promise<Submission>
  update(id: string, patch: Partial<Submission>): Promise<Submission>
  deleteByCompetition(competitionId: string): Promise<void>
}

export interface ITicketsRepo {
  listByUser(userId: string, competitionId: string): Promise<Ticket[]>
  listByCompetition(competitionId: string): Promise<Ticket[]>
  create(data: Ticket): Promise<Ticket>
  update(id: string, patch: Partial<Ticket>): Promise<Ticket>
  delete(id: string): Promise<void>
  deleteByCompetition(competitionId: string): Promise<void>
  recalculate(competitionId: string): Promise<void>
}

export interface IWheelRepo {
  getByCompetition(competitionId: string): Promise<WheelRun | null>
  create(data: WheelRun): Promise<WheelRun>
  deleteByCompetition(competitionId: string): Promise<void>
}

export interface IWinnersRepo {
  getByCompetition(competitionId: string): Promise<Winner | null>
  create(data: Winner): Promise<Winner>
  update(id: string, patch: Partial<Winner>): Promise<Winner>
}

export interface IAuditRepo {
  create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>
  listByUser(userId: string): Promise<AuditLog[]>
  listAll(limit?: number): Promise<AuditLog[]>
}

export interface IParticipantsRepo {
  getById(id: string): Promise<Participant | null>
  listByCompetition(competitionId: string): Promise<Participant[]>
  create(data: Participant): Promise<Participant>
}

export interface ITrainingSubmissionsRepo {
  listByUser(userId: string): Promise<TrainingSubmission[]>
  create(data: TrainingSubmission): Promise<TrainingSubmission>
}
