import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { submissionId, isWinner } = await request.json()

    console.log('Mark winner request:', { submissionId, isWinner })

    if (!submissionId || typeof isWinner !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user is authenticated and has admin role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role (CEO or LRC_MANAGER)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Update submission with winner status (pass/fail)
    const { data, error } = await supabase
      .from('submissions')
      .update({
        is_winner: isWinner,
        status: isWinner ? 'approved' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()

    if (error) {
      console.error('Database error marking winner:', error)
      return NextResponse.json(
        { error: `Failed to update winner status: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    console.log('Successfully updated submission:', data)

    return NextResponse.json({
      success: true,
      message: isWinner ? 'تم تحديد الطالب كفائز (نجح)' : 'تم تحديد الطالب كخاسر (لم ينجح)'
    })
  } catch (error: any) {
    console.error('Error in mark-winner API:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
