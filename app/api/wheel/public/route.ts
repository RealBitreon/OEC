import { NextRequest, NextResponse } from 'next/server'
import { getWheelRunForCompetition } from '@/lib/competition/wheel'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    
    if (!competitionId) {
      return NextResponse.json({ error: 'Missing competitionId' }, { status: 400 })
    }
    
    const wheelRun = await getWheelRunForCompetition(competitionId)
    
    return NextResponse.json({ wheelRun })
  } catch (error) {
    console.error('Error fetching public wheel data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
