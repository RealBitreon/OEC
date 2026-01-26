/**
 * Repository factory - switches between JSON and Supabase implementations
 * based on DATA_PROVIDER environment variable
 */

import type {
  ICompetitionsRepo,
  IQuestionsRepo,
  ISubmissionsRepo,
  ITicketsRepo,
  IWheelRepo,
  IWinnersRepo,
  IUsersRepo,
  IAuditRepo,
  ITrainingSubmissionsRepo
} from './interfaces'

// JSON implementations
import { JsonCompetitionsRepo } from './json/competitions'
import { JsonQuestionsRepo } from './json/questions'
import { JsonSubmissionsRepo } from './json/submissions'
import { JsonTicketsRepo } from './json/tickets'
import { JsonWheelRepo } from './json/wheel'
import { JsonWinnersRepo } from './json/winners'
import { JsonUsersRepo } from './json/users'
import { JsonAuditRepo } from './json/audit'
import { JsonTrainingSubmissionsRepo } from './json/training-submissions'

// Supabase implementations
import { SupabaseCompetitionsRepo } from './supabase/competitions'
import { SupabaseQuestionsRepo } from './supabase/questions'
import { SupabaseSubmissionsRepo } from './supabase/submissions'
import { SupabaseTicketsRepo } from './supabase/tickets'
import { SupabaseWheelRepo } from './supabase/wheel'
import { SupabaseWinnersRepo } from './supabase/winners'
import { SupabaseUsersRepo } from './supabase/users'
import { SupabaseAuditRepo } from './supabase/audit'
import { SupabaseTrainingSubmissionsRepo } from './supabase/training-submissions'

const DATA_PROVIDER = process.env.DATA_PROVIDER || 'json'

function createCompetitionsRepo(): ICompetitionsRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseCompetitionsRepo()
  }
  return new JsonCompetitionsRepo()
}

function createQuestionsRepo(): IQuestionsRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseQuestionsRepo()
  }
  return new JsonQuestionsRepo()
}

function createSubmissionsRepo(): ISubmissionsRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseSubmissionsRepo()
  }
  return new JsonSubmissionsRepo()
}

function createTicketsRepo(): ITicketsRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseTicketsRepo()
  }
  return new JsonTicketsRepo()
}

function createWheelRepo(): IWheelRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseWheelRepo()
  }
  return new JsonWheelRepo()
}

function createWinnersRepo(): IWinnersRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseWinnersRepo()
  }
  return new JsonWinnersRepo()
}

function createUsersRepo(): IUsersRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseUsersRepo()
  }
  return new JsonUsersRepo()
}

function createAuditRepo(): IAuditRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseAuditRepo()
  }
  return new JsonAuditRepo()
}

function createTrainingSubmissionsRepo(): ITrainingSubmissionsRepo {
  if (DATA_PROVIDER === 'supabase') {
    return new SupabaseTrainingSubmissionsRepo()
  }
  return new JsonTrainingSubmissionsRepo()
}

// Export singleton instances
export const competitionsRepo = createCompetitionsRepo()
export const questionsRepo = createQuestionsRepo()
export const submissionsRepo = createSubmissionsRepo()
export const ticketsRepo = createTicketsRepo()
export const wheelRepo = createWheelRepo()
export const winnersRepo = createWinnersRepo()
export const usersRepo = createUsersRepo()
export const auditRepo = createAuditRepo()
export const trainingSubmissionsRepo = createTrainingSubmissionsRepo()
