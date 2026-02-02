'use server'

import { redirect } from 'next/navigation'
import { login } from '@/lib/auth/supabase-auth'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username) {
    return { error: 'Username is required' }
  }

  const result = await login(username, password)

  if (!result.success) {
    return { error: result.error }
  }

  // Redirect to home page
  redirect('/')
}
