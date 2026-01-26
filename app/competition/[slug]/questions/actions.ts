'use server'

import { getStudentTickets, checkEligibility } from '@/lib/competition/tickets'

export async function getStudentTicketsInfo(competitionId: string, studentUsername: string) {
  try {
    const totalTickets = await getStudentTickets(competitionId, studentUsername)
    const eligibility = await checkEligibility(competitionId, studentUsername)
    
    return {
      success: true,
      totalTickets,
      eligibility
    }
  } catch (error) {
    return {
      success: false,
      error: 'حدث خطأ في جلب البيانات'
    }
  }
}
