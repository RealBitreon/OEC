import { NextResponse } from 'next/server'
import { competitionsRepo } from '@/lib/repos'

export async function GET() {
  try {
    const competition = await competitionsRepo.getActive()
    
    if (!competition) {
      return NextResponse.json({ competition: null })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error('Error fetching active competition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active competition' },
      { status: 500 }
    )
  }
}
