import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is CEO or LRC_MANAGER
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all competitions
    const { data: competitions, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching competitions:', error)
      return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 })
    }

    return NextResponse.json(competitions)
  } catch (error) {
    console.error('Error in admin competitions route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
