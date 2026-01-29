// ============================================
// AUTH LIBRARY - SUPABASE AUTH ONLY
// ============================================

'use server'

import { createClient } from '@/lib/supabase/server'
import { User, UserRole } from '../core/types'

/**
 * Get authenticated user profile from database
 * SINGLE SOURCE OF TRUTH - reads from profiles table
 */
export async function getUserProfile(): Promise<User | null> {
  const supabase = await createClient()
  
  // Get authenticated user from Supabase Auth
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    return null
  }

  // Fetch profile from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, role, created_at')
    .eq('id', authUser.id)
    .single()
  
  if (profileError || !profile) {
    return null
  }

  // Validate role
  const validRoles = ['CEO', 'LRC_MANAGER', 'STUDENT']
  if (!validRoles.includes(profile.role)) {
    return null
  }

  return {
    id: profile.id,
    username: profile.username,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
  }
}

/**
 * Revalidate user role from database (for sensitive operations)
 * NEVER trust client-side data
 */
export async function revalidateRole(userId: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, role, created_at')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }

  const validRoles = ['CEO', 'LRC_MANAGER', 'STUDENT']
  if (!validRoles.includes(profile.role)) {
    return null
  }

  return {
    id: profile.id,
    username: profile.username,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
  }
}
