'use server'

import { competitionsRepo, ticketsRepo, wheelRepo, winnersRepo } from '@/lib/repos'
import type { Competition, Ticket, WheelRun, Winner } from '@/lib/store/types'
import { checkEligibility } from './tickets'
import { nanoid } from 'nanoid'

/**
 * Get eligible candidates with their ticket counts for a competition
 */
export async function getEligibleCandidates(competitionId: string): Promise<Array<{
  studentUsername: string
  tickets: number
  eligible: boolean
  reason: string
}>> {
  const competitionTickets = await ticketsRepo.listByCompetition(competitionId)
  
  // Group by student
  const studentMap = new Map<string, number>()
  for (const ticket of competitionTickets) {
    const current = studentMap.get(ticket.studentUsername) || 0
    studentMap.set(ticket.studentUsername, current + ticket.count)
  }
  
  // Check eligibility for each student
  const candidates = []
  for (const entry of Array.from(studentMap.entries())) {
    const [studentUsername, ticketCount] = entry
    const eligibility = await checkEligibility(competitionId, studentUsername)
    candidates.push({
      studentUsername,
      tickets: ticketCount,
      eligible: eligibility.eligible,
      reason: eligibility.reason
    })
  }
  
  return candidates.sort((a, b) => b.tickets - a.tickets)
}

/**
 * Lock candidates snapshot for a competition
 */
export async function lockWheelSnapshot(competitionId: string, lockedBy: string): Promise<{
  success: boolean
  error?: string
  wheelRun?: WheelRun
}> {
  try {
    const competition = await competitionsRepo.getById(competitionId)
    
    if (!competition) {
      return { success: false, error: 'المسابقة غير موجودة' }
    }
    
    // Check if already locked
    const existing = await wheelRepo.getRunByCompetition(competitionId)
    
    if (existing && (existing.status === 'ready' || existing.status === 'done')) {
      return { success: false, error: 'تم قفل المرشحين مسبقاً' }
    }
    
    // Get eligible candidates
    const allCandidates = await getEligibleCandidates(competitionId)
    const eligibleCandidates = allCandidates.filter(c => c.eligible && c.tickets > 0)
    
    if (eligibleCandidates.length === 0) {
      return { success: false, error: 'لا يوجد مرشحون مؤهلون' }
    }
    
    const totalTickets = eligibleCandidates.reduce((sum, c) => sum + c.tickets, 0)
    
    // Create wheel run
    const wheelRun: WheelRun = {
      id: nanoid(),
      competitionId,
      competitionSlug: competition.slug,
      status: 'ready',
      lockedAt: new Date().toISOString(),
      runAt: null,
      lockedBy,
      rulesSnapshot: competition.rules,
      candidatesSnapshot: eligibleCandidates.map(c => ({
        studentUsername: c.studentUsername,
        tickets: c.tickets
      })),
      totalTickets,
      winnerUsername: null,
      winnerTicketIndex: null,
      seed: nanoid()
    }
    
    await wheelRepo.create(wheelRun)
    
    return { success: true, wheelRun }
  } catch (error) {
    console.error('Error locking wheel snapshot:', error)
    return { success: false, error: 'حدث خطأ في قفل المرشحين' }
  }
}

/**
 * Run the wheel draw and select winner
 */
export async function runWheelDraw(wheelRunId: string): Promise<{
  success: boolean
  error?: string
  winner?: Winner
  wheelRun?: WheelRun
}> {
  try {
    const wheelRun = await wheelRepo.getRunById(wheelRunId)
    
    if (!wheelRun) {
      return { success: false, error: 'السحب غير موجود' }
    }
    
    if (wheelRun.status !== 'ready') {
      return { success: false, error: 'السحب تم تنفيذه مسبقاً' }
    }
    
    if (wheelRun.candidatesSnapshot.length === 0) {
      return { success: false, error: 'لا يوجد مرشحون' }
    }
    
    // Build weighted ticket pool
    const ticketPool: string[] = []
    for (const candidate of wheelRun.candidatesSnapshot) {
      for (let i = 0; i < candidate.tickets; i++) {
        ticketPool.push(candidate.studentUsername)
      }
    }
    
    // Select random winner
    const winnerTicketIndex = Math.floor(Math.random() * ticketPool.length)
    const winnerUsername = ticketPool[winnerTicketIndex]
    
    // Update wheel run
    const updatedWheelRun = await wheelRepo.update(wheelRunId, {
      status: 'done',
      runAt: new Date().toISOString(),
      winnerUsername,
      winnerTicketIndex
    })
    
    // Create winner record
    const winner: Winner = {
      competitionId: wheelRun.competitionId,
      winnerUsername,
      runAt: updatedWheelRun.runAt!,
      wheelRunId: wheelRun.id,
      notes: `تم اختيار الفائز من بين ${wheelRun.candidatesSnapshot.length} مرشح (${wheelRun.totalTickets} تذكرة)`
    }
    
    await winnersRepo.create(winner)
    
    return { success: true, winner, wheelRun: updatedWheelRun }
  } catch (error) {
    console.error('Error running wheel draw:', error)
    return { success: false, error: 'حدث خطأ في تشغيل السحب' }
  }
}

/**
 * Get wheel run for a competition
 */
export async function getWheelRunForCompetition(competitionId: string): Promise<WheelRun | null> {
  return await wheelRepo.getRunByCompetition(competitionId)
}

/**
 * Get wheel run by ID
 */
export async function getWheelRunById(wheelRunId: string): Promise<WheelRun | null> {
  return await wheelRepo.getRunById(wheelRunId)
}
