/**
 * Server-side auth helpers for dashboard pages
 * 
 * IMPORTANT: These should ONLY be used in Server Components
 * Layout already checks auth, so these are for getting user data only
 */

import { createClient } from '@/lib/supabase/server'

export interface DashboardUser {
  id: string
  authId: string
  username: string
  email?: string
  role: 'CEO' | 'LRC_MANAGER'
  createdAt: string
}

/**
 * Get current user profile from database
 * Assumes auth check already done at layout level
 * Returns null if user not found (should not happen in dashboard)
 */
export async function getCurrentDashboardUser(): Promise<DashboardUser | null> {
  try {
    const supabase = await createClient()
    
    // Get auth user (already validated by layout)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    // Get profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, auth_id, username, email, role, created_at')
      .eq('auth_id', authUser.id)
      .single()

    if (error || !profile) {
      console.error('Profile not found for auth user:', authUser.id, error)
      return null
    }

    return {
      id: profile.id,
      authId: profile.auth_id,
      username: profile.username,
      email: profile.email || undefined,
      role: profile.role as 'CEO' | 'LRC_MANAGER',
      createdAt: profile.created_at,
    }
  } catch (error) {
    console.error('Get current dashboard user error:', error)
    return null
  }
}

/**
 * Check if current user has admin role (CEO or LRC_MANAGER)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentDashboardUser()
  return user ? ['CEO', 'LRC_MANAGER'].includes(user.role) : false
}

/**
 * Check if current user is CEO
 */
export async function isCEO(): Promise<boolean> {
  const user = await getCurrentDashboardUser()
  return user?.role === 'CEO'
}
