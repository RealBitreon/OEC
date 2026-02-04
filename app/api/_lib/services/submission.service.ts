/**
 * Submission Service
 * 
 * Production-grade business logic layer following Meta/Microsoft standards:
 * - Separation of concerns
 * - Transaction management
 * - Business rule enforcement
 * - Audit logging
 * - Type safety
 * 
 * @module api/services/submission
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Simple logger replacement
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, error: Error, data?: any) => console.error(`[ERROR] ${msg}`, error, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || '')
}

// Simple error classes
class DatabaseError extends Error {
  constructor(message: string, public originalError: any, public context?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`)
    this.name = 'NotFoundError'
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

/**
 * Submission status enum
 */
export enum SubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

/**
 * Submission data transfer object
 */
export interface SubmissionDTO {
  id: string
  competitionId: string
  participantName: string
  participantEmail?: string
  firstName?: string
  fatherName?: string
  familyName?: string
  grade?: string
  answers: Record<string, string>
  proofs?: Record<string, string>
  score: number
  totalQuestions: number
  ticketsEarned: number
  status: SubmissionStatus
  isWinner?: boolean | null
  submittedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  reviewNotes?: string | null
}

/**
 * Submission filter options
 */
export interface SubmissionFilters {
  competitionId?: string
  participantName?: string
  status?: 'winner' | 'loser' | 'not_reviewed'
  search?: string
  isWinner?: boolean | null
}

/**
 * Paginated submission result
 */
export interface PaginatedSubmissions {
  data: SubmissionDTO[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Submission statistics
 */
export interface SubmissionStats {
  total: number
  winners: number
  losers: number
  notReviewed: number
  averageScore: number
  averagePercentage: number
}

/**
 * Submission Service Class
 */
export class SubmissionService {
  private supabase: SupabaseClient
  
  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createServiceClient()
  }
  
  /**
   * Retrieves paginated submissions with filters
   * 
   * @param filters - Filter criteria
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page
   * @param requestId - Correlation ID
   * @returns Paginated submissions
   */
  async getSubmissions(
    filters: SubmissionFilters,
    page: number = 1,
    pageSize: number = 20,
    requestId: string
  ): Promise<PaginatedSubmissions> {
    try {
      logger.info('Fetching submissions', { requestId, filters, page, pageSize })
      
      let query = this.supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, title, slug)
        `, { count: 'exact' })
        .order('submitted_at', { ascending: false })
      
      // Apply filters
      if (filters.competitionId) {
        query = query.eq('competition_id', filters.competitionId)
      }
      
      if (filters.participantName) {
        query = query.eq('participant_name', filters.participantName)
      }
      
      if (filters.status) {
        if (filters.status === 'winner') {
          query = query.eq('is_winner', true)
        } else if (filters.status === 'loser') {
          query = query.eq('is_winner', false)
        } else if (filters.status === 'not_reviewed') {
          query = query.is('is_winner', null)
        }
      }
      
      if (filters.search) {
        query = query.or(
          `participant_name.ilike.%${filters.search}%,participant_email.ilike.%${filters.search}%`
        )
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      if (error) {
        throw new DatabaseError(
          'Failed to fetch submissions',
          error,
          { filters, page, pageSize }
        )
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize)
      
      logger.info('Submissions fetched successfully', {
        requestId,
        count: data?.length || 0,
        total: count,
        page,
        totalPages
      })
      
      return {
        data: (data || []) as SubmissionDTO[],
        total: count || 0,
        page,
        pageSize,
        totalPages
      }
    } catch (error) {
      logger.error('Error fetching submissions', error as Error, { requestId, filters })
      throw error
    }
  }
  
  /**
   * Retrieves submission by ID
   * 
   * @param submissionId - Submission UUID
   * @param requestId - Correlation ID
   * @returns Submission data
   * @throws NotFoundError if submission doesn't exist
   */
  async getSubmissionById(
    submissionId: string,
    requestId: string
  ): Promise<SubmissionDTO> {
    try {
      logger.info('Fetching submission by ID', { requestId, submissionId })
      
      const { data, error } = await this.supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, title, slug)
        `)
        .eq('id', submissionId)
        .single()
      
      if (error || !data) {
        throw new NotFoundError('Submission', submissionId)
      }
      
      return data as SubmissionDTO
    } catch (error) {
      logger.error('Error fetching submission', error as Error, { requestId, submissionId })
      throw error
    }
  }
  
  /**
   * Marks submission as winner or loser
   * 
   * @param submissionId - Submission UUID
   * @param isWinner - Winner status
   * @param reviewerId - Reviewer user ID
   * @param notes - Optional review notes
   * @param requestId - Correlation ID
   * @returns Updated submission
   */
  async markWinner(
    submissionId: string,
    isWinner: boolean,
    reviewerId: string,
    notes: string | undefined,
    requestId: string
  ): Promise<SubmissionDTO> {
    try {
      logger.info('Marking submission winner status', {
        requestId,
        submissionId,
        isWinner,
        reviewerId
      })
      
      // Check if submission exists
      const existing = await this.getSubmissionById(submissionId, requestId)
      
      // Update submission
      const { data, error } = await this.supabase
        .from('submissions')
        .update({
          is_winner: isWinner,
          status: isWinner ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          review_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()
      
      if (error) {
        throw new DatabaseError(
          'Failed to update submission',
          error,
          { submissionId, isWinner }
        )
      }
      
      // Log audit trail
      await this.logAudit(
        reviewerId,
        'submission_reviewed',
        {
          submissionId,
          isWinner,
          previousStatus: existing.isWinner,
          notes
        },
        requestId
      )
      
      logger.info('Submission winner status updated', {
        requestId,
        submissionId,
        isWinner
      })
      
      return data as SubmissionDTO
    } catch (error) {
      logger.error('Error marking winner', error as Error, {
        requestId,
        submissionId,
        isWinner
      })
      throw error
    }
  }
  
  /**
   * Deletes submission
   * 
   * @param submissionId - Submission UUID
   * @param deletedBy - User ID performing deletion
   * @param requestId - Correlation ID
   */
  async deleteSubmission(
    submissionId: string,
    deletedBy: string,
    requestId: string
  ): Promise<void> {
    try {
      logger.info('Deleting submission', { requestId, submissionId, deletedBy })
      
      // Get submission details for audit log
      const submission = await this.getSubmissionById(submissionId, requestId)
      
      // Delete submission
      const { error } = await this.supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId)
      
      if (error) {
        throw new DatabaseError(
          'Failed to delete submission',
          error,
          { submissionId }
        )
      }
      
      // Log audit trail
      await this.logAudit(
        deletedBy,
        'submission_deleted',
        {
          submissionId,
          participantName: submission.participantName,
          competitionId: submission.competitionId
        },
        requestId
      )
      
      logger.info('Submission deleted successfully', { requestId, submissionId })
    } catch (error) {
      logger.error('Error deleting submission', error as Error, {
        requestId,
        submissionId
      })
      throw error
    }
  }
  
  /**
   * Updates submission answers and proofs
   * 
   * @param submissionId - Submission UUID
   * @param answers - Updated answers
   * @param proofs - Updated proofs
   * @param updatedBy - User ID performing update
   * @param requestId - Correlation ID
   * @returns Updated submission
   */
  async updateAnswers(
    submissionId: string,
    answers: Record<string, string>,
    proofs: Record<string, string>,
    updatedBy: string,
    requestId: string
  ): Promise<SubmissionDTO> {
    try {
      logger.info('Updating submission answers', { requestId, submissionId, updatedBy })
      
      // Get existing submission
      const existing = await this.getSubmissionById(submissionId, requestId)
      
      // Update submission
      const { data, error } = await this.supabase
        .from('submissions')
        .update({
          answers,
          proofs,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single()
      
      if (error) {
        throw new DatabaseError(
          'Failed to update submission answers',
          error,
          { submissionId }
        )
      }
      
      // Log audit trail
      await this.logAudit(
        updatedBy,
        'submission_answers_updated',
        {
          submissionId,
          participantName: existing.participantName,
          answersCount: Object.keys(answers).length,
          proofsCount: Object.keys(proofs).length
        },
        requestId
      )
      
      logger.info('Submission answers updated', { requestId, submissionId })
      
      return data as SubmissionDTO
    } catch (error) {
      logger.error('Error updating answers', error as Error, {
        requestId,
        submissionId
      })
      throw error
    }
  }
  
  /**
   * Gets submission statistics
   * 
   * @param competitionId - Optional competition filter
   * @param requestId - Correlation ID
   * @returns Submission statistics
   */
  async getStats(
    competitionId: string | undefined,
    requestId: string
  ): Promise<SubmissionStats> {
    try {
      logger.info('Fetching submission stats', { requestId, competitionId })
      
      let query = this.supabase
        .from('submissions')
        .select('is_winner, score, total_questions', { count: 'exact' })
      
      if (competitionId) {
        query = query.eq('competition_id', competitionId)
      }
      
      const { data, count } = await query
      
      const winners = data?.filter(s => s.is_winner === true).length || 0
      const losers = data?.filter(s => s.is_winner === false).length || 0
      const notReviewed = data?.filter(s => s.is_winner === null).length || 0
      
      // Calculate average score
      const totalScore = data?.reduce((sum, s) => sum + (s.score || 0), 0) || 0
      const totalPossible = data?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0
      const averagePercentage = totalPossible > 0 
        ? Math.round((totalScore / totalPossible) * 100) 
        : 0
      const averageScore = data && data.length > 0
        ? Math.round(totalScore / data.length * 10) / 10
        : 0
      
      return {
        total: count || 0,
        winners,
        losers,
        notReviewed,
        averageScore,
        averagePercentage
      }
    } catch (error) {
      logger.error('Error fetching stats', error as Error, { requestId, competitionId })
      throw new DatabaseError('Failed to fetch submission statistics', error)
    }
  }
  
  /**
   * Logs audit trail
   * 
   * @param userId - User performing action
   * @param action - Action type
   * @param details - Action details
   * @param requestId - Correlation ID
   */
  private async logAudit(
    userId: string,
    action: string,
    details: any,
    requestId: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          details: {
            ...details,
            requestId,
            timestamp: new Date().toISOString()
          }
        })
    } catch (error) {
      // Don't fail the operation if audit logging fails
      logger.warn('Failed to log audit trail', { requestId, userId, action, error })
    }
  }
}

/**
 * Factory function to create submission service
 */
export function createSubmissionService(supabase?: SupabaseClient): SubmissionService {
  return new SubmissionService(supabase)
}
