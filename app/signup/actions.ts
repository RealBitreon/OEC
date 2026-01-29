'use server'

import { redirect } from 'next/navigation'
import { signup } from '@/lib/auth/supabase-auth'

type SignupResult = {
  error?: string
  success?: boolean
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const roleCode = formData.get('roleCode') as string

  if (!username) {
    return { error: 'Username is required' }
  }

  const result = await signup(username, password, roleCode)

  if (!result.success) {
    return { error: result.error }
  }

  // Redirect to login after signup
  redirect('/login')
}
