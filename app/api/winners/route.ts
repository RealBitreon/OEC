import { NextResponse } from 'next/server'
import { readWinners } from '@/lib/store/readWrite'
import type { Winner } from '@/lib/store/types'

export async function GET() {
  try {
    const winners = await readWinners() as Winner[]
    
    return NextResponse.json({ winners })
  } catch (error) {
    console.error('Error fetching winners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
