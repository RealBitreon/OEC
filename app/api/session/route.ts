import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ user: null, error: 'Auth error' }, { status: 401 })
    }

    if (!authUser) {
      console.error('No auth user')
      return NextResponse.json({ user: null, error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Auth user found:', authUser.id, authUser.email)

    // Get profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, username, email, role, created_at, auth_id')
      .eq('auth_id', authUser.id)
      .single()

    if (profileError) {
      console.error('Profile query error:', profileError)
      console.error('Auth user ID:', authUser.id)
      console.error('Auth user email:', authUser.email)
      console.error('Auth user metadata:', authUser.user_metadata)
      
      return NextResponse.json({ 
        user: null, 
        error: 'Profile not found',
        debug: {
          authUserId: authUser.id,
          authUserEmail: authUser.email,
          profileError: profileError.message
        }
      }, { status: 404 })
    }

    if (!profile) {
      console.error('Profile not found for auth user:', authUser.id)
      return NextResponse.json({ 
        user: null, 
        error: 'Profile not found',
        debug: {
          authUserId: authUser.id,
          authUserEmail: authUser.email,
          message: 'Run fix_auth_complete.sql to create missing profiles'
        }
      }, { status: 404 })
    }

    console.log('Profile found:', profile.username, profile.role)

    return NextResponse.json({ 
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role,
        createdAt: profile.created_at
      }
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ 
      user: null, 
      error: 'Internal server error',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
