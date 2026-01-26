'use server'

import { 
  competitionsRepo, 
  questionsRepo, 
  submissionsRepo, 
  winnersRepo, 
  usersRepo, 
  auditRepo 
} from '@/lib/repos'
import type { Competition, Question, Submission, Winner, AuditLog } from '@/lib/store/types'
import type { User } from '@/lib/auth/types'
import { requireSession } from '@/lib/auth/requireSession'
import { randomUUID } from 'crypto'
import { upsertTicketsForSubmission, recalculateTicketsForCompetition } from '@/lib/competition/tickets'
import { lockWheelSnapshot, runWheelDraw, getEligibleCandidates } from '@/lib/competition/wheel'

// Helper to create audit log
async function createAuditLog(action: string, performedBy: string, details: any) {
  await auditRepo.append({
    action,
    performedBy,
    details
  })
}

// Competition Actions
export async function createCompetition(data: {
  title: string
  startAt: string
  endAt: string
  wheelSpinAt: string
  minCorrect: number
  eligibleMode: 'all_correct' | 'min_correct'
  username: string
}) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }
    
    const slug = `${new Date(data.startAt).getFullYear()}-${String(new Date(data.startAt).getMonth() + 1).padStart(2, '0')}`
    
    const newCompetition: Competition = {
      id: randomUUID(),
      slug,
      title: data.title,
      status: 'draft',
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      wheelSpinAt: new Date(data.wheelSpinAt).toISOString(),
      publishedAt: new Date().toISOString(),
      rules: {
        eligibility: {
          mode: data.eligibleMode,
          minCorrect: data.minCorrect
        },
        tickets: {
          basePerCorrect: 1,
          earlyBonusMode: 'tiers',
          tiers: [
            { fromHours: 0, toHours: 24, bonus: 3 },
            { fromHours: 24, toHours: 72, bonus: 2 },
            { fromHours: 72, toHours: 120, bonus: 1 },
            { fromHours: 120, toHours: 99999, bonus: 0 }
          ],
          startReference: 'competition_published_at'
        }
      },
      createdBy: data.username,
      createdAt: new Date().toISOString()
    }

    await competitionsRepo.create(newCompetition)
    await createAuditLog('create_competition', session.username, { competitionId: newCompetition.id, title: data.title })

    const competitions = await competitionsRepo.listAll()
    return { success: true, competitions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في الإنشاء' }
  }
}

export async function updateCompetition(id: string, updates: Partial<Competition>) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    // If activating, archive current active
    if (updates.status === 'active') {
      await competitionsRepo.archiveActive()
    }

    await competitionsRepo.update(id, updates)
    await createAuditLog('update_competition', session.username, { competitionId: id, updates })

    const competitions = await competitionsRepo.listAll()
    return { success: true, competitions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}

export async function archiveCompetition(id: string) {
  return updateCompetition(id, { status: 'archived' })
}

// Question Actions
export async function createQuestion(data: {
  competitionId: string
  type: 'text' | 'true_false' | 'mcq'
  title: string
  body: string
  options?: string[]
  correctAnswer: any
  sourceRef: {
    volume: string
    page: string
    lineFrom: number
    lineTo: number
  }
  isActive?: boolean
}) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }
    
    // Validate source reference
    if (!data.sourceRef.volume || !data.sourceRef.page) {
      return { success: false, error: 'المرجع الرسمي مطلوب (المجلد والصفحة)' }
    }

    // Validate correct answer based on type
    if (data.type === 'mcq') {
      if (!data.options || data.options.length < 2) {
        return { success: false, error: 'يجب إضافة خيارين على الأقل' }
      }
      if (typeof data.correctAnswer !== 'number' || data.correctAnswer < 0 || data.correctAnswer >= data.options.length) {
        return { success: false, error: 'يجب اختيار إجابة صحيحة من الخيارات' }
      }
    } else if (data.type === 'true_false') {
      if (typeof data.correctAnswer !== 'boolean') {
        return { success: false, error: 'يجب اختيار صح أو خطأ' }
      }
    } else if (data.type === 'text') {
      const variants = Array.isArray(data.correctAnswer) ? data.correctAnswer : [data.correctAnswer]
      const validVariants = variants.filter((v: string) => v && v.trim())
      if (validVariants.length === 0) {
        return { success: false, error: 'يجب إضافة إجابة مقبولة واحدة على الأقل' }
      }
      // Normalize text answers
      data.correctAnswer = validVariants.map((v: string) => v.trim())
    }
    
    const newQuestion: Question = {
      id: randomUUID(),
      competitionId: data.competitionId,
      type: data.type,
      title: data.title.trim(),
      body: data.body.trim(),
      options: data.options?.map(o => o.trim()),
      correctAnswer: data.correctAnswer,
      sourceRef: {
        volume: data.sourceRef.volume.trim(),
        page: data.sourceRef.page.trim(),
        lineFrom: data.sourceRef.lineFrom || 0,
        lineTo: data.sourceRef.lineTo || 0
      },
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString()
    }

    await questionsRepo.create(newQuestion)
    await createAuditLog('create_question', session.username, { questionId: newQuestion.id, competitionId: data.competitionId })

    const questions = await questionsRepo.listActive()
    return { success: true, questions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في الإنشاء' }
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    await questionsRepo.update(id, updates)
    await createAuditLog('update_question', session.username, { questionId: id, updates })

    const questions = await questionsRepo.listActive()
    return { success: true, questions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}

export async function deleteQuestion(id: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    await questionsRepo.delete(id)
    await createAuditLog('delete_question', session.username, { questionId: id })

    const questions = await questionsRepo.listActive()
    return { success: true, questions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في الحذف' }
  }
}

// Submission Actions
export async function updateSubmission(id: string, updates: {
  finalResult: 'correct' | 'incorrect' | 'pending'
  reason?: string
  correctedBy: string
}) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const submission = await submissionsRepo.update(id, {
      finalResult: updates.finalResult,
      reason: updates.reason || null,
      correctedBy: updates.correctedBy
    })
    
    await createAuditLog('update_submission', session.username, { submissionId: id, updates })

    // Update tickets based on new finalResult
    try {
      await upsertTicketsForSubmission(submission)
    } catch (error) {
      console.error('Error updating tickets:', error)
    }

    const submissions = await submissionsRepo.list()
    return { success: true, submissions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}

// Wheel Actions
export async function lockSnapshot(competitionId: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const result = await lockWheelSnapshot(competitionId, session.username)
    
    if (result.success) {
      await createAuditLog('lock_wheel_snapshot', session.username, { 
        competitionId, 
        wheelRunId: result.wheelRun!.id,
        candidatesCount: result.wheelRun!.candidatesSnapshot.length,
        totalTickets: result.wheelRun!.totalTickets
      })
    }
    
    return result
  } catch (error) {
    return { success: false, error: 'حدث خطأ في القفل' }
  }
}

export async function runDraw(wheelRunId: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const result = await runWheelDraw(wheelRunId)
    
    if (result.success) {
      await createAuditLog('run_wheel_draw', session.username, { 
        wheelRunId,
        competitionId: result.wheelRun!.competitionId,
        winnerUsername: result.winner!.winnerUsername,
        candidatesCount: result.wheelRun!.candidatesSnapshot.length
      })
    }
    
    return result
  } catch (error) {
    return { success: false, error: 'حدث خطأ في السحب' }
  }
}

export async function getEligibilityPreview(competitionId: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const candidates = await getEligibleCandidates(competitionId)
    const eligible = candidates.filter(c => c.eligible && c.tickets > 0)
    const totalTickets = eligible.reduce((sum, c) => sum + c.tickets, 0)
    
    return {
      success: true,
      eligibleCount: eligible.length,
      totalCandidates: candidates.length,
      totalTickets,
      topCandidates: candidates.slice(0, 10)
    }
  } catch (error) {
    return { success: false, error: 'حدث خطأ' }
  }
}

// Old wheel action (deprecated but kept for compatibility)
export async function runWheel(competitionId: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const competition = await competitionsRepo.getById(competitionId)
    
    if (!competition) {
      return { success: false, error: 'المسابقة غير موجودة' }
    }

    const competitionSubmissions = await submissionsRepo.list({
      competitionId,
      finalResult: 'correct'
    })

    // Calculate eligible students
    const studentScores = new Map<string, number>()
    competitionSubmissions.forEach(sub => {
      const username = sub.studentUsername || sub.participantId || ''
      if (username) {
        const current = studentScores.get(username) || 0
        studentScores.set(username, current + 1)
      }
    })

    // Get questions for all_correct mode
    const compQuestions = await questionsRepo.listByCompetition(competitionId)
    const activeQuestions = compQuestions.filter(q => q.isActive)

    const eligible: string[] = []
    studentScores.forEach((score, username) => {
      const eligibilityRules = competition.rules?.eligibility
      if (eligibilityRules) {
        if (eligibilityRules.mode === 'all_correct') {
          if (score === activeQuestions.length) {
            eligible.push(username)
          }
        } else if (eligibilityRules.mode === 'min_correct') {
          if (score >= eligibilityRules.minCorrect) {
            eligible.push(username)
          }
        }
      } else {
        // Fallback to old rules structure
        const oldRules = competition.rules as any
        if (oldRules?.eligibleMode === 'all_correct') {
          if (score === activeQuestions.length) {
            eligible.push(username)
          }
        } else if (oldRules?.eligibleMode === 'min_correct') {
          if (score >= (oldRules?.minCorrect || 0)) {
            eligible.push(username)
          }
        }
      }
    })

    if (eligible.length === 0) {
      return { success: false, error: 'لا يوجد طلاب مؤهلون' }
    }

    // Random winner
    const winnerUsername = eligible[Math.floor(Math.random() * eligible.length)]

    const newWinner: Winner = {
      competitionId,
      winnerUsername,
      runAt: new Date().toISOString(),
      notes: `تم اختيار الفائز من بين ${eligible.length} طالب مؤهل`
    }

    await winnersRepo.create(newWinner)
    await createAuditLog('run_wheel', session.username, { competitionId, winnerUsername, eligibleCount: eligible.length })

    const winners = await winnersRepo.listAll()
    return { success: true, winner: newWinner, eligible, winners }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في السحب' }
  }
}

// User Management (CEO only)
export async function updateUserRole(username: string, newRole: 'ceo' | 'lrc_manager' | 'student') {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo') {
      return { success: false, error: 'غير مصرح - CEO فقط' }
    }

    await usersRepo.updateRole(username, newRole)
    await createAuditLog('update_user_role', session.username, { username, newRole })

    const users = await usersRepo.listAll()
    return { success: true, users }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}

// Tickets Actions
export async function updateCompetitionTicketsSettings(competitionId: string, ticketsSettings: {
  basePerCorrect: number
  earlyBonusMode: 'tiers' | 'none'
  tiers: Array<{ fromHours: number; toHours: number; bonus: number }>
  publishedAt?: string
}) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const updates: Partial<Competition> = {
      rules: {
        eligibility: { mode: 'all_correct', minCorrect: 0 }, // Will be merged with existing
        tickets: {
          basePerCorrect: ticketsSettings.basePerCorrect,
          earlyBonusMode: ticketsSettings.earlyBonusMode,
          tiers: ticketsSettings.tiers,
          startReference: 'competition_published_at'
        }
      }
    }

    if (ticketsSettings.publishedAt) {
      updates.publishedAt = ticketsSettings.publishedAt
    }

    // Get existing competition to preserve eligibility rules
    const existing = await competitionsRepo.getById(competitionId)
    if (existing) {
      updates.rules!.eligibility = existing.rules.eligibility
    }

    await competitionsRepo.update(competitionId, updates)
    await createAuditLog('update_tickets_settings', session.username, { competitionId, ticketsSettings })

    const competitions = await competitionsRepo.listAll()
    return { success: true, competitions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}

export async function recalculateCompetitionTickets(competitionId: string) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    const stats = await recalculateTicketsForCompetition(competitionId)
    await createAuditLog('recalculate_tickets', session.username, { competitionId, stats })

    return { success: true, stats }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في إعادة الاحتساب' }
  }
}

export async function updateCompetitionEligibilityRules(competitionId: string, eligibilityRules: {
  mode: 'all_correct' | 'min_correct'
  minCorrect: number
}) {
  try {
    const session = await requireSession()
    if (session.role !== 'ceo' && session.role !== 'lrc_manager') {
      return { success: false, error: 'غير مصرح' }
    }

    // Get existing competition to preserve tickets rules
    const existing = await competitionsRepo.getById(competitionId)
    if (!existing) {
      return { success: false, error: 'المسابقة غير موجودة' }
    }

    await competitionsRepo.update(competitionId, {
      rules: {
        eligibility: eligibilityRules,
        tickets: existing.rules.tickets
      }
    })
    await createAuditLog('update_eligibility_rules', session.username, { competitionId, eligibilityRules })

    const competitions = await competitionsRepo.listAll()
    return { success: true, competitions }
  } catch (error) {
    return { success: false, error: 'حدث خطأ في التحديث' }
  }
}
