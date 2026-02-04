import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, isWinner } = body

    console.log('[mark-winner] Request received:', { submissionId, isWinner, body })

    if (!submissionId || typeof isWinner !== 'boolean') {
      console.error('[mark-winner] Invalid request:', { submissionId, isWinner })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let supabase
    try {
      supabase = await createClient()
      console.log('[mark-winner] Supabase client created')
    } catch (error: any) {
      console.error('[mark-winner] Failed to create Supabase client:', error)
      return NextResponse.json(
        { error: `Failed to create database client: ${error.message}` },
        { status: 500 }
      )
    }

    // Verify user is authenticated and has admin role
    let user
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      user = authUser
      console.log('[mark-winner] Auth check:', { userId: user?.id, error: authError })
      
      if (authError) {
        console.error('[mark-winner] Auth error:', authError)
        return NextResponse.json(
          { error: `Authentication error: ${authError.message}` },
          { status: 401 }
        )
      }
      
      if (!user) {
        console.error('[mark-winner] No user found')
        return NextResponse.json(
          { error: 'Unauthorized: No user session' },
          { status: 401 }
        )
      }
    } catch (error: any) {
      console.error('[mark-winner] Exception during auth check:', error)
      return NextResponse.json(
        { error: `Auth check failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Check if user has admin role (CEO or LRC_MANAGER)
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', user.id)
        .single()

      console.log('[mark-winner] Profile check:', { profile, error: profileError })

      if (profileError) {
        console.error('[mark-winner] Profile error:', profileError)
        return NextResponse.json(
          { error: `Failed to fetch user profile: ${profileError.message}` },
          { status: 500 }
        )
      }

      if (!profile) {
        console.error('[mark-winner] No profile found for user:', user.id)
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }

      if (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER') {
        console.error('[mark-winner] Insufficient permissions:', { role: profile.role })
        return NextResponse.json(
          { error: `Forbidden: Admin access required. Your role: ${profile.role}` },
          { status: 403 }
        )
      }

      console.log('[mark-winner] User authorized:', { role: profile.role })
    } catch (error: any) {
      console.error('[mark-winner] Exception during profile check:', error)
      return NextResponse.json(
        { error: `Profile check failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Update submission with winner status (pass/fail)
    try {
      console.log('[mark-winner] Updating submission:', { submissionId, isWinner })
      
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
        console.error('[mark-winner] Database update error:', error)
        return NextResponse.json(
          { error: `Failed to update submission: ${error.message}` },
          { status: 500 }
        )
      }

      if (!data || data.length === 0) {
        console.error('[mark-winner] Submission not found:', submissionId)
        return NextResponse.json(
          { error: 'Submission not found or no permission to update' },
          { status: 404 }
        )
      }

      console.log('[mark-winner] Successfully updated submission:', data[0])

      return NextResponse.json({
        success: true,
        message: isWinner ? 'تم تحديد الطالب كفائز (نجح)' : 'تم تحديد الطالب كخاسر (لم ينجح)',
        data: data[0]
      })
    } catch (error: any) {
      console.error('[mark-winner] Exception during database update:', error)
      return NextResponse.json(
        { error: `Database update failed: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[mark-winner] Unhandled error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}`, stack: error.stack },
      { status: 500 }
    )
  }
}
