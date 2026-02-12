/**
 * Competition by ID API
 * GET /api/competitions/[id]
 */

import { NextResponse } from 'next/server'
import { competitionsRepo } from '@/lib/repos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const competition = await competitionsRepo.getById(params.id)

    if (!competition) {
      return NextResponse.json(
        { competition: null, message: 'Competition not found' },
        { status: 404 }
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
    console.error('Error fetching competition:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
