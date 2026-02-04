'use server'

import { redirect } from 'next/navigation'
import { login } from '@/lib/auth/supabase-auth'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/dashboard'

  if (!username) {
    return { error: 'Username is required' }
  }

  const result = await login(username, password)

  if (!result.success) {
    return { error: result.error }
  }

  // Security: Only allow internal redirects
  const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
  const safeRedirect = isValidRedirect ? redirectTo : '/dashboard'

  // Redirect to intended destination
  redirect(safeRedirect)
}
