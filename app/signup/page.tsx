import { redirect } from 'next/navigation'
import { createUser } from '@/lib/auth/store'
import { setSessionCookie, getSession } from '@/lib/auth/session'
import { checkRateLimit, getProgressiveDelay } from '@/lib/auth/rateLimit'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function SignupPage() {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  async function handleSignup(formData: FormData) {
    'use server'
    
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const code = formData.get('code') as string
    const honeypot = formData.get('website') as string
    
    // Honeypot check (bot trap)
    if (honeypot) {
      throw new Error('Invalid submission')
    }
    
    if (!username || !password || !code) {
      throw new Error('جميع الحقول مطلوبة')
    }
    
    // Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const identifier = `${ip}:${username}`
    
    const rateLimit = checkRateLimit(identifier)
    if (!rateLimit.allowed) {
      throw new Error(`تم تجاوز عدد المحاولات. حاول مرة أخرى بعد ${rateLimit.retryAfter} ثانية`)
    }
    
    try {
      const user = await createUser(username.trim(), password, code.trim())
      
      await setSessionCookie({
        username: user.username,
        role: user.role,
        iat: Date.now()
      })
      
      redirect('/dashboard')
    } catch (error: any) {
      // Progressive delay on failed attempts
      const attempts = 1 // Could track this better
      const delay = getProgressiveDelay(attempts)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">م</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              إنشاء حساب جديد
            </h1>
            <p className="text-neutral-600">
              انضم إلى مسابقة الموسوعة العُمانية
            </p>
          </div>

          {/* Form */}
          <form action={handleSignup} className="space-y-5">
            {/* Honeypot field (hidden from users, visible to bots) */}
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              style={{ position: 'absolute', left: '-9999px' }}
              aria-hidden="true"
            />
            
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                minLength={3}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="6 أحرف على الأقل"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-neutral-700 mb-2">
                رمز الدور <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                minLength={12}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right font-mono"
                placeholder="أدخل رمز الدور (12 حرفاً على الأقل)"
                autoComplete="off"
              />
              <p className="text-xs text-neutral-500 mt-1">
                رمز الدور مطلوب للتسجيل. احصل عليه من المشرف.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-button"
            >
              إنشاء الحساب
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <span>←</span>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
