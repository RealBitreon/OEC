import { NextResponse } from 'next/server'
import { competitionsRepo } from '@/lib/repos'
import type { Competition } from '@/lib/store/types'

export async function GET() {
  try {
    const activeCompetition = await competitionsRepo.getActive()
    
    return NextResponse.json({ competition: activeCompetition || null })
  } catch (error) {
    console.error('Error fetching active competition:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
