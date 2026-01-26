// JSON Schema Validation for Data Integrity
import type { Competition, Question, Submission, Ticket, WheelRun, Winner, AuditLog } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateCompetition(comp: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!comp.id || typeof comp.id !== 'string') errors.push('Competition missing valid id')
  if (!comp.slug || typeof comp.slug !== 'string') errors.push('Competition missing valid slug')
  if (!comp.title || typeof comp.title !== 'string') errors.push('Competition missing valid title')
  if (!['active', 'archived', 'draft'].includes(comp.status)) {
    errors.push(`Competition ${comp.id} has invalid status: ${comp.status}`)
  }
  if (!comp.startAt || !comp.endAt || !comp.wheelSpinAt) {
    errors.push(`Competition ${comp.id} missing required dates`)
  }
  if (!comp.rules || !comp.rules.eligibility || !comp.rules.tickets) {
    errors.push(`Competition ${comp.id} missing rules structure`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateQuestion(q: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!q.id || typeof q.id !== 'string') errors.push('Question missing valid id')
  if (!q.title || typeof q.title !== 'string') errors.push(`Question ${q.id} missing title`)
  if (!['text', 'true_false', 'mcq'].includes(q.type)) {
    errors.push(`Question ${q.id} has invalid type: ${q.type}`)
  }
  
  // Training vs Competition consistency
  if (q.isTraining === true && q.competitionId !== null && q.competitionId !== undefined) {
    errors.push(`Question ${q.id} is marked as training but has competitionId`)
  }
  if (q.isTraining === false && !q.competitionId) {
    errors.push(`Question ${q.id} is not training but missing competitionId`)
  }

  if (q.type === 'mcq' && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
    errors.push(`MCQ Question ${q.id} must have at least 2 options`)
  }

  if (q.correctAnswer === undefined || q.correctAnswer === null) {
    errors.push(`Question ${q.id} missing correctAnswer`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateSubmission(sub: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!sub.id || typeof sub.id !== 'string') errors.push('Submission missing valid id')
  if (!sub.competitionId) errors.push(`Submission ${sub.id} missing competitionId`)
  if (!sub.questionId) errors.push(`Submission ${sub.id} missing questionId`)
  if (!sub.studentUsername) errors.push(`Submission ${sub.id} missing studentUsername`)
  
  if (!['correct', 'incorrect', 'pending'].includes(sub.autoResult)) {
    errors.push(`Submission ${sub.id} has invalid autoResult: ${sub.autoResult}`)
  }
  if (!['correct', 'incorrect', 'pending'].includes(sub.finalResult)) {
    errors.push(`Submission ${sub.id} has invalid finalResult: ${sub.finalResult}`)
  }

  if (!sub.source || !sub.source.volume || !sub.source.page) {
    errors.push(`Submission ${sub.id} missing source information`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateTicket(ticket: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!ticket.id) errors.push('Ticket missing id')
  if (!ticket.competitionId) errors.push(`Ticket ${ticket.id} missing competitionId`)
  if (!ticket.studentUsername) errors.push(`Ticket ${ticket.id} missing studentUsername`)
  if (!ticket.submissionId) errors.push(`Ticket ${ticket.id} missing submissionId`)
  if (typeof ticket.count !== 'number' || ticket.count < 0) {
    errors.push(`Ticket ${ticket.id} has invalid count: ${ticket.count}`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateWheelRun(run: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!run.id) errors.push('WheelRun missing id')
  if (!run.competitionId) errors.push(`WheelRun ${run.id} missing competitionId`)
  if (!['ready', 'running', 'done'].includes(run.status)) {
    errors.push(`WheelRun ${run.id} has invalid status: ${run.status}`)
  }
  if (!run.candidatesSnapshot || !Array.isArray(run.candidatesSnapshot)) {
    errors.push(`WheelRun ${run.id} missing candidatesSnapshot`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateWinner(winner: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!winner.competitionId) errors.push('Winner missing competitionId')
  if (!winner.winnerUsername) errors.push('Winner missing winnerUsername')
  if (!winner.runAt) errors.push('Winner missing runAt timestamp')

  return { valid: errors.length === 0, errors, warnings }
}

export function validateAllData(data: {
  competitions: any[]
  questions: any[]
  submissions: any[]
  tickets: any[]
  wheelRuns: any[]
  winners: any[]
}): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate each entity
  data.competitions.forEach(c => {
    const result = validateCompetition(c)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  data.questions.forEach(q => {
    const result = validateQuestion(q)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  data.submissions.forEach(s => {
    const result = validateSubmission(s)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  data.tickets.forEach(t => {
    const result = validateTicket(t)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  data.wheelRuns.forEach(r => {
    const result = validateWheelRun(r)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  data.winners.forEach(w => {
    const result = validateWinner(w)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  })

  // Cross-entity consistency checks
  const activeCompetitions = data.competitions.filter(c => c.status === 'active')
  if (activeCompetitions.length > 1) {
    errors.push(`Multiple active competitions found: ${activeCompetitions.map(c => c.slug).join(', ')}`)
  }

  // Check for duplicate IDs
  const competitionIds = data.competitions.map(c => c.id)
  const duplicateCompIds = competitionIds.filter((id, idx) => competitionIds.indexOf(id) !== idx)
  if (duplicateCompIds.length > 0) {
    errors.push(`Duplicate competition IDs: ${duplicateCompIds.join(', ')}`)
  }

  const questionIds = data.questions.map(q => q.id)
  const duplicateQIds = questionIds.filter((id, idx) => questionIds.indexOf(id) !== idx)
  if (duplicateQIds.length > 0) {
    errors.push(`Duplicate question IDs: ${duplicateQIds.join(', ')}`)
  }

  // Check orphaned submissions
  const validCompIds = new Set(data.competitions.map(c => c.id))
  const validQIds = new Set(data.questions.map(q => q.id))
  
  data.submissions.forEach(sub => {
    if (!validCompIds.has(sub.competitionId)) {
      warnings.push(`Submission ${sub.id} references non-existent competition ${sub.competitionId}`)
    }
    if (!validQIds.has(sub.questionId)) {
      warnings.push(`Submission ${sub.id} references non-existent question ${sub.questionId}`)
    }
  })

  // Check tickets only exist for correct submissions
  const correctSubmissionIds = new Set(
    data.submissions.filter(s => s.finalResult === 'correct').map(s => s.id)
  )
  
  data.tickets.forEach(ticket => {
    if (!correctSubmissionIds.has(ticket.submissionId)) {
      errors.push(`Ticket ${ticket.id} references submission ${ticket.submissionId} which is not marked correct`)
    }
  })

  return { valid: errors.length === 0, errors, warnings }
}
