import { redirect } from 'next/navigation'
import { verifyPassword } from '@/lib/auth/store'
import { setSessionCookie, getSession } from '@/lib/auth/session'
import Link from 'next/link'

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  async function handleLogin(formData: FormData) {
    'use server'
    
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    
    if (!username || !password) {
      throw new Error('جميع الحقول مطلوبة')
    }
    
    const user = await verifyPassword(username.trim(), password)
    
    if (!user) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
    
    await setSessionCookie({
      username: user.username,
      role: user.role,
      iat: Date.now()
    })
    
    redirect('/dashboard')
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
              تسجيل الدخول
            </h1>
            <p className="text-neutral-600">
              مرحباً بعودتك إلى المسابقة
            </p>
          </div>

          {/* Form */}
          <form action={handleLogin} className="space-y-5">
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
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-right"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-button"
            >
              تسجيل الدخول
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                إنشاء حساب جديد
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
