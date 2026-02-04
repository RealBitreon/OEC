import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const supabase = await createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  // Get and validate redirect parameter
  const params = await searchParams
  const redirectTo = params.redirect || '/dashboard'
  
  // Security: Only allow internal redirects
  const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//')
  const safeRedirect = isValidRedirect ? redirectTo : '/dashboard'

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 right-6 z-20 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">العودة للرئيسية</span>
      </Link>

      {/* Content */}
      <div className="relative w-full max-w-md z-10">
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-bl from-emerald-400 to-green-500 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-bl from-teal-400 to-emerald-500 rounded-full opacity-20 blur-2xl"></div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-l from-emerald-500 via-green-500 to-teal-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                تسجيل الدخول
              </h1>
              <p className="text-emerald-50 text-lg">
                مرحباً بك مرة أخرى
              </p>
            </div>
            {/* Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 fill-white/80">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
              </svg>
            </div>
          </div>

          {/* Form Container */}
          <div className="p-8">
            <LoginForm redirectTo={safeRedirect} />

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500">أو</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mt-6 flex items-center justify-center gap-2">
                <a 
                  href="/signup" 
                  className="text-emerald-600 hover:text-emerald-700 font-bold transition-all duration-200 hover:underline decoration-2 underline-offset-2 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  <span>إنشاء حساب جديد</span>
                </a>
                <span>ليس لديك حساب؟</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-block shadow-sm">
            بتسجيل الدخول، أنت توافق على{' '}
            <a href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              الشروط والأحكام
            </a>
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-green-400 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/3 right-5 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-700"></div>
      </div>
    </div>
  )
}
