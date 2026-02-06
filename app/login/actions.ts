'use server'

import { redirect } from 'next/navigation'
import { login } from '@/lib/auth/supabase-auth'

export async function loginAction(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const redirectTo = formData.get('redirectTo') as string || '/dashboard'

    // Validate inputs
    if (!username || !username.trim()) {
      return { error: 'اسم المستخدم مطلوب' }
    }

    if (username.trim().length < 3) {
      return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }
    }

    if (!password) {
      return { error: 'كلمة المرور مطلوبة' }
    }

    // Attempt login
    const result = await login(username.trim(), password)

    if (!result.success) {
      return { error: result.error || 'فشل تسجيل الدخول' }
    }

    // Security: Only allow internal redirects
    const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
    const safeRedirect = isValidRedirect ? redirectTo : '/dashboard'

    // Redirect to intended destination
    redirect(safeRedirect)
  } catch (error: any) {
    // If it's a redirect error, let it propagate
    if (error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Login action error:', error)
    return { error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى' }
  }
}
