import { NextRequest, NextResponse } from 'next/server'
import { getWheelRunForCompetition, getEligibleCandidates } from '@/lib/competition/wheel'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    
    if (!competitionId) {
      return NextResponse.json({ error: 'Missing competitionId' }, { status: 400 })
    }
    
    const wheelRun = await getWheelRunForCompetition(competitionId)
    
    // If no wheel run, provide eligibility preview
    let eligiblePreview = null
    if (!wheelRun) {
      const candidates = await getEligibleCandidates(competitionId)
      const eligible = candidates.filter(c => c.eligible && c.tickets > 0)
      const totalTickets = eligible.reduce((sum, c) => sum + c.tickets, 0)
      
      eligiblePreview = {
        eligibleCount: eligible.length,
        totalCandidates: candidates.length,
        totalTickets,
        topCandidates: candidates.slice(0, 10)
      }
    }
    
    return NextResponse.json({ wheelRun, eligiblePreview })
  } catch (error) {
    console.error('Error fetching wheel status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
