import { cookies } from 'next/headers'
import crypto from 'crypto'
import { usersRepo } from '@/lib/repos'
import { createServiceClient } from '@/lib/supabase/server'

export interface User {
  id: string
  username: string
  role: 'CEO' | 'LRC_MANAGER' | 'VIEWER'
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
}

// Hash password using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Create session
async function createSession(userId: string): Promise<Session> {
  const supabase = createServiceClient()
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error('Failed to create session')

  return {
    id: data.id,
    userId: data.user_id,
    expiresAt: data.expires_at,
  }
}

// Get session
async function getSession(sessionId: string): Promise<Session | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !data) return null

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('sessions').delete().eq('id', sessionId)
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    expiresAt: data.expires_at,
  }
}

// Delete session
async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('sessions').delete().eq('id', sessionId)
}

// Login
export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await usersRepo.getByUsername(username)
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' }
    }

    const hashedPassword = hashPassword(password)
    
    // Get user with password from database
    const supabase = createServiceClient()
    const { data: dbUser } = await supabase
      .from('users')
      .select('password')
      .eq('id', user.id)
      .single()

    if (!dbUser || dbUser.password !== hashedPassword) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Create session
    const session = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Logout
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete('session')
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return null
    }

    const session = await getSession(sessionId)
    if (!session) {
      cookieStore.delete('session')
      return null
    }

    const user = await usersRepo.getById(session.userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role as 'CEO' | 'LRC_MANAGER' | 'VIEWER',
      createdAt: user.createdAt,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Require auth
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Signup
export async function signup(username: string, password: string, role: 'CEO' | 'LRC_MANAGER' | 'VIEWER' = 'VIEWER'): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user exists
    const existingUser = await usersRepo.getByUsername(username)
    if (existingUser) {
      return { success: false, error: 'Username already exists' }
    }

    // Create user
    const hashedPassword = hashPassword(password)
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        username,
        password: hashedPassword,
        role,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Failed to create user' }
    }

    // Create session
    const session = await createSession(data.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: 'Signup failed' }
  }
}
