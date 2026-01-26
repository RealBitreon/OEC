import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

// Optional endpoint to track participation
// Can be extended to save to participants.json if needed

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug } = body

    // Optional: Save participation record to participants.json
    // For now, just return success

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Error recording participation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
