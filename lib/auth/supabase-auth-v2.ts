import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export interface User {
  id: string
  authId: string
  username: string
  email?: string
  role: 'CEO' | 'LRC_MANAGER'
  createdAt: string
}

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Sign up a new user with Supabase Auth (username-based)
 * Email is auto-generated as username@local.app for Supabase Auth compatibility
 * Role code is REQUIRED - no signup without valid role code
 */
export async function signup(
  username: string,
  password: string,
  roleCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate role code is provided
    if (!roleCode) {
      return { success: false, error: 'Role code is required' }
    }

    // Determine role based on role code
    let role: 'CEO' | 'LRC_MANAGER' | 'VIEWER'
    
    if (roleCode === process.env.CEO_ROLE_CODE) {
      role = 'CEO'
    } else if (roleCode === process.env.MANAGER_ROLE_CODE) {
      role = 'LRC_MANAGER'
    } else {
      return { success: false, error: 'Invalid role code' }
    }

    const supabase = await createClient()

    // Check if username already exists
    const serviceSupabase = createServiceClient()
    const { data: existingUser } = await serviceSupabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { success: false, error: 'Username already exists' }
    }

    // Create email from username for Supabase Auth (required by Supabase)
    // Format: username@local.app
    const email = `${username}@local.app`

    // Sign up with Supabase Auth using service client to bypass email confirmation
    const { data, error } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username,
        role,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Failed to create user' }
    }

    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: 'Signup failed' }
  }
}

/**
 * Login with username and password
 * Converts username to email format for Supabase Auth
 */
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Convert username to email format
    const email = `${username}@local.app`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: 'Invalid username or password' }
    }

    if (!data.session) {
      return { success: false, error: 'Failed to create session' }
    }

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Get current authenticated user with profile data
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()

    // Get auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return null
    }

    // Get profile data from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found for auth user:', authUser.id)
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
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Check if current user has admin role (CEO or LRC_MANAGER)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user ? ['CEO', 'LRC_MANAGER'].includes(user.role) : false
}

/**
 * Check if current user is CEO
 */
export async function isCEO(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'CEO'
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (!['CEO', 'LRC_MANAGER'].includes(user.role)) {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

/**
 * Require CEO role - throws if not CEO
 */
export async function requireCEO(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'CEO') {
    throw new Error('Forbidden: CEO access required')
  }
  return user
}

// ============================================================================
// Admin Functions (using service role)
// ============================================================================

/**
 * Update user role (CEO only)
 */
export async function updateUserRole(
  userId: string,
  newRole: 'CEO' | 'LRC_MANAGER'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient()

    // Get user's auth_id
    const { data: user } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Update role in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Update role in auth metadata
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      user.auth_id,
      {
        user_metadata: { role: newRole }
      }
    )

    if (metaError) {
      console.error('Failed to update auth metadata:', metaError)
    }

    return { success: true }
  } catch (error) {
    console.error('Update user role error:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get all users error:', error)
    return []
  }

  return data.map(user => ({
    id: user.id,
    authId: user.auth_id,
    username: user.username,
    email: user.email || undefined,
    role: user.role as 'CEO' | 'LRC_MANAGER',
    createdAt: user.created_at,
  }))
}

/**
 * Delete user (CEO only)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient()

    // Get user's auth_id
    const { data: user } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', userId)
      .single()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Delete from auth (will cascade to users table)
    const { error } = await supabase.auth.admin.deleteUser(user.auth_id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete user error:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
