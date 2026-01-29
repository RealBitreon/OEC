// Repository factory - exports singleton instances
// Using Supabase implementations

import type {
  IUsersRepo,
  ICompetitionsRepo,
  IQuestionsRepo,
  ISubmissionsRepo,
  ITicketsRepo,
  IWheelRepo,
  IWinnersRepo,
  IAuditRepo,
  IParticipantsRepo,
  ITrainingSubmissionsRepo,
} from './interfaces'

// Import Supabase implementations
import { SupabaseUsersRepo } from './supabase/users'
import { SupabaseCompetitionsRepo } from './supabase/competitions'
import { SupabaseQuestionsRepo } from './supabase/questions'
import { SupabaseSubmissionsRepo } from './supabase/submissions'
import { SupabaseTicketsRepo } from './supabase/tickets'
import { SupabaseWheelRepo, SupabaseWinnersRepo, SupabaseParticipantsRepo, SupabaseTrainingSubmissionsRepo } from './supabase/wheel'
import { SupabaseAuditRepo } from './supabase/audit'

// Export singleton instances - Using Supabase
export const usersRepo: IUsersRepo = new SupabaseUsersRepo()
export const competitionsRepo: ICompetitionsRepo = new SupabaseCompetitionsRepo()
export const questionsRepo: IQuestionsRepo = new SupabaseQuestionsRepo()
export const submissionsRepo: ISubmissionsRepo = new SupabaseSubmissionsRepo()
export const ticketsRepo: ITicketsRepo = new SupabaseTicketsRepo()
export const wheelRepo: IWheelRepo = new SupabaseWheelRepo()
export const winnersRepo: IWinnersRepo = new SupabaseWinnersRepo()
export const auditRepo: IAuditRepo = new SupabaseAuditRepo()
export const participantsRepo: IParticipantsRepo = new SupabaseParticipantsRepo()
export const trainingSubmissionsRepo: ITrainingSubmissionsRepo = new SupabaseTrainingSubmissionsRepo()
