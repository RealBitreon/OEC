'use server'

import { redirect } from 'next/navigation'
import { login } from '@/lib/auth/supabase-auth'

export async function loginAction(formData: FormData) {
  const startTime = Date.now()
  console.log('[LOGIN ACTION] Started at:', new Date().toISOString())
  
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const redirectTo = formData.get('redirectTo') as string || '/dashboard'

    console.log('[LOGIN ACTION] Username:', username?.trim())

    // Validate inputs
    if (!username || !username.trim()) {
      console.log('[LOGIN ACTION] Validation failed: username missing')
      return { error: 'اسم المستخدم مطلوب' }
    }

    if (username.trim().length < 3) {
      console.log('[LOGIN ACTION] Validation failed: username too short')
      return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }
    }

    if (!password) {
      console.log('[LOGIN ACTION] Validation failed: password missing')
      return { error: 'كلمة المرور مطلوبة' }
    }

    // Attempt login
    console.log('[LOGIN ACTION] Calling login function...')
    const loginStart = Date.now()
    const result = await login(username.trim(), password)
    const loginDuration = Date.now() - loginStart
    console.log(`[LOGIN ACTION] Login function completed in ${loginDuration}ms`)

    if (!result.success) {
      console.log('[LOGIN ACTION] Login failed:', result.error)
      return { error: result.error || 'فشل تسجيل الدخول' }
    }

    // Security: Only allow internal redirects
    const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
    const safeRedirect = isValidRedirect ? redirectTo : '/dashboard'

    const totalDuration = Date.now() - startTime
    console.log(`[LOGIN ACTION] Success! Total duration: ${totalDuration}ms. Redirecting to:`, safeRedirect)

    // Redirect to intended destination
    redirect(safeRedirect)
  } catch (error: any) {
    // If it's a redirect error, let it propagate
    if (error?.message?.includes('NEXT_REDIRECT')) {
      console.log('[LOGIN ACTION] Redirect triggered (this is normal)')
      throw error
    }
    
    const totalDuration = Date.now() - startTime
    console.error(`[LOGIN ACTION] Error after ${totalDuration}ms:`, error)
    return { error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى' }
  }
}
