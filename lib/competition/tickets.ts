'use server'

import { competitionsRepo, submissionsRepo, questionsRepo, ticketsRepo } from '@/lib/repos'
import type { Competition, Submission, Ticket, Question } from '@/lib/store/types'
import { nanoid } from 'nanoid'

/**
 * Compute ticket count for a submission based on competition rules
 * This is a pure function, not a server action
 */
function computeTicketCount(
  competition: Competition,
  submission: Submission
): { count: number; reason: string } {
  // Only correct submissions get tickets
  if (submission.finalResult !== 'correct') {
    return { count: 0, reason: 'incorrect answer' }
  }

  const rules = competition.rules?.tickets
  if (!rules) {
    return { count: 1, reason: 'base 1 (no rules defined)' }
  }

  let count = rules.basePerCorrect || 1
  let reason = `base ${count}`

  // Calculate early bonus if enabled
  if (rules.earlyBonusMode === 'tiers' && rules.tiers && rules.tiers.length > 0) {
    const referenceTime = competition.publishedAt || competition.createdAt
    const submittedTime = submission.submittedAt
    
    const hoursDiff = (new Date(submittedTime).getTime() - new Date(referenceTime).getTime()) / (1000 * 60 * 60)
    
    // Find matching tier
    const tier = rules.tiers.find(t => hoursDiff >= t.fromHours && hoursDiff < t.toHours)
    if (tier && tier.bonus > 0) {
      count += tier.bonus
      reason += ` + early bonus ${tier.bonus} (${tier.fromHours}-${tier.toHours}h)`
    }
  }

  return { count, reason }
}

/**
 * Create or update tickets for a submission
 */
export async function upsertTicketsForSubmission(submission: Submission): Promise<void> {
  const competition = await competitionsRepo.getById(submission.competitionId)
  if (!competition) {
    throw new Error('Competition not found')
  }

  // Remove existing tickets for this submission
  await ticketsRepo.deleteBySubmission(submission.id)

  // If submission is correct, create new ticket
  if (submission.finalResult === 'correct') {
    const { count, reason } = computeTicketCount(competition, submission)
    
    const newTicket: Ticket = {
      id: nanoid(),
      competitionId: submission.competitionId,
      studentUsername: submission.studentUsername,
      submissionId: submission.id,
      questionId: submission.questionId,
      count,
      reason,
      createdAt: new Date().toISOString()
    }
    
    await ticketsRepo.create(newTicket)
  }
}

/**
 * Remove all tickets for a submission
 */
export async function removeTicketsForSubmission(submissionId: string): Promise<void> {
  await ticketsRepo.deleteBySubmission(submissionId)
}

/**
 * Recalculate all tickets for a competition
 */
export async function recalculateTicketsForCompetition(competitionId: string): Promise<{
  before: number
  after: number
  added: number
  removed: number
  updated: number
}> {
  const competition = await competitionsRepo.getById(competitionId)
  if (!competition) {
    throw new Error('Competition not found')
  }

  // Get existing tickets for this competition
  const existingTickets = await ticketsRepo.listByCompetition(competitionId)
  const beforeCount = existingTickets.reduce((sum, t) => sum + t.count, 0)

  // Remove all tickets for this competition
  await ticketsRepo.deleteByCompetition(competitionId)

  // Get all correct submissions for this competition
  const competitionSubmissions = await submissionsRepo.list({
    competitionId,
    finalResult: 'correct'
  })

  // Create new tickets
  const newTickets: Ticket[] = []
  for (const submission of competitionSubmissions) {
    const { count, reason } = computeTicketCount(competition, submission)
    
    newTickets.push({
      id: nanoid(),
      competitionId: submission.competitionId,
      studentUsername: submission.studentUsername,
      submissionId: submission.id,
      questionId: submission.questionId,
      count,
      reason,
      createdAt: new Date().toISOString()
    })
  }

  const afterCount = newTickets.reduce((sum, t) => sum + t.count, 0)

  // Save updated tickets
  await ticketsRepo.bulkCreate(newTickets)

  // Calculate stats
  const existingSubmissionIds = new Set(existingTickets.map(t => t.submissionId))
  const newSubmissionIds = new Set(newTickets.map(t => t.submissionId))
  
  const added = newTickets.filter(t => !existingSubmissionIds.has(t.submissionId)).length
  const removed = existingTickets.filter(t => !newSubmissionIds.has(t.submissionId)).length
  const updated = newTickets.filter(t => existingSubmissionIds.has(t.submissionId)).length - added

  return {
    before: beforeCount,
    after: afterCount,
    added,
    removed,
    updated
  }
}

/**
 * Get total tickets for a student in a competition
 */
export async function getStudentTickets(competitionId: string, studentUsername: string): Promise<number> {
  const tickets = await ticketsRepo.listByStudent(competitionId, studentUsername)
  return tickets.reduce((sum, t) => sum + t.count, 0)
}

/**
 * Check if a student is eligible for the wheel based on competition rules
 */
export async function checkEligibility(competitionId: string, studentUsername: string): Promise<{
  eligible: boolean
  reason: string
}> {
  const competition = await competitionsRepo.getById(competitionId)
  if (!competition) {
    return { eligible: false, reason: 'Competition not found' }
  }

  // Get active questions for this competition
  const activeQuestions = await questionsRepo.listByCompetition(competitionId)
  const activeQuestionsFiltered = activeQuestions.filter(q => q.isActive)

  if (activeQuestionsFiltered.length === 0) {
    return { eligible: false, reason: 'No active questions' }
  }

  // Get student's correct submissions count
  const correctCount = await submissionsRepo.countCorrectByStudent(competitionId, studentUsername)

  const eligibilityRules = competition.rules?.eligibility
  if (!eligibilityRules) {
    // Fallback to old rules structure
    const oldRules = competition.rules as any
    if (oldRules?.eligibleMode === 'all_correct') {
      const eligible = correctCount === activeQuestionsFiltered.length
      return {
        eligible,
        reason: eligible ? 'All questions correct' : `${correctCount}/${activeQuestionsFiltered.length} correct (need all)`
      }
    } else if (oldRules?.eligibleMode === 'min_correct') {
      const minCorrect = oldRules.minCorrect || 0
      const eligible = correctCount >= minCorrect
      return {
        eligible,
        reason: eligible ? `${correctCount} correct (min ${minCorrect})` : `${correctCount}/${minCorrect} correct`
      }
    }
  }

  // Use new rules structure
  if (eligibilityRules.mode === 'all_correct') {
    const eligible = correctCount === activeQuestionsFiltered.length
    return {
      eligible,
      reason: eligible ? 'All questions correct' : `${correctCount}/${activeQuestionsFiltered.length} correct (need all)`
    }
  } else if (eligibilityRules.mode === 'min_correct') {
    const minCorrect = eligibilityRules.minCorrect || 0
    const eligible = correctCount >= minCorrect
    return {
      eligible,
      reason: eligible ? `${correctCount} correct (min ${minCorrect})` : `${correctCount}/${minCorrect} correct`
    }
  }

  return { eligible: false, reason: 'Unknown eligibility mode' }
}

/**
 * Get all tickets grouped by student for a competition
 */
export async function getCompetitionTicketsSummary(competitionId: string): Promise<Array<{
  studentUsername: string
  totalTickets: number
  correctAnswers: number
}>> {
  const competitionTickets = await ticketsRepo.listByCompetition(competitionId)
  const competitionSubmissions = await submissionsRepo.list({
    competitionId,
    finalResult: 'correct'
  })
  
  const studentMap = new Map<string, { totalTickets: number; correctAnswers: number }>()
  
  for (const ticket of competitionTickets) {
    const current = studentMap.get(ticket.studentUsername) || { totalTickets: 0, correctAnswers: 0 }
    current.totalTickets += ticket.count
    studentMap.set(ticket.studentUsername, current)
  }
  
  for (const submission of competitionSubmissions) {
    const current = studentMap.get(submission.studentUsername) || { totalTickets: 0, correctAnswers: 0 }
    current.correctAnswers += 1
    studentMap.set(submission.studentUsername, current)
  }
  
  return Array.from(studentMap.entries()).map(([studentUsername, data]) => ({
    studentUsername,
    ...data
  })).sort((a, b) => b.totalTickets - a.totalTickets)
}
