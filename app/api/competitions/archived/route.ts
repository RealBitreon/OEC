import { NextResponse } from 'next/server'
import { competitionsRepo } from '@/lib/repos'
import type { Competition } from '@/lib/store/types'

export async function GET() {
  try {
    const archivedCompetitions = await competitionsRepo.listByStatus('archived')
    const sorted = archivedCompetitions.sort((a: Competition, b: Competition) => 
      new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    )
    
    return NextResponse.json({ competitions: sorted })
  } catch (error) {
    console.error('Error fetching archived competitions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
