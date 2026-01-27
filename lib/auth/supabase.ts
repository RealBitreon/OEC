import { createClient } from '@/lib/supabase/server'
import { usersRepo } from '@/lib/repos'

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export async function getSupabaseSession(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Get user from database
    const dbUser = await usersRepo.getById(user.id)

    if (dbUser) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
      }
    }

    return null
  } catch (error) {
    console.error('Error getting Supabase session:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSupabaseSession()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
