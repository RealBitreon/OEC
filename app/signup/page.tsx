import { redirect } from 'next/navigation'
import { createUser } from '@/lib/auth/store'
import { setSessionCookie, getSession } from '@/lib/auth/session'
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
    
    if (!username || !password) {
      throw new Error('جميع الحقول مطلوبة')
    }
    
    try {
      const user = await createUser(username.trim(), password, code || undefined)
      
      await setSessionCookie({
        username: user.username,
        role: user.role,
        iat: Date.now()
      })
      
      redirect('/dashboard')
    } catch (error) {
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
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-neutral-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
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
                رمز الدور (اختياري)
              </label>
              <input
                type="text"
                id="code"
                name="code"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="اتركه فارغاً للطالب"
              />
              <p className="text-xs text-neutral-500 mt-1">
                استخدم الرمز الخاص إذا كنت مديراً
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
