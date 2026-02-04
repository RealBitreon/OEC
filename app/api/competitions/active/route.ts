import { NextResponse } from 'next/server'
import { competitionsRepo } from '@/lib/repos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const competition = await competitionsRepo.getActive()

    if (!competition) {
      return NextResponse.json(
        { competition: null, message: 'No active competition' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    return NextResponse.json(
      { competition },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching active competition:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
