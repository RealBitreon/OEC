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
      {/* Modern Gradient Background with Mesh Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f4438] via-[#1a5f4f] to-[#2d7a67]">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c4f542]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#2d7a67]/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c4f542]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Mesh Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 right-6 z-20 inline-flex items-center gap-2 text-white hover:text-[#c4f542] transition-all duration-300 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-white/20 border border-white/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-semibold">العودة للرئيسية</span>
      </Link>

      {/* Content */}
      <div className="relative w-full max-w-md z-10 animate-scale-in">
        {/* Floating Decorative Elements */}
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#c4f542]/20 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#c4f542]/15 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>

        {/* Main Card with Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500">
          {/* Header Section */}
          <div className="relative p-10 text-center overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a5f4f]/5 to-transparent"></div>
            
            <div className="relative z-10">
              {/* Logo/Icon Container */}
              <div className="w-24 h-24 bg-gradient-to-br from-[#1a5f4f] to-[#2d7a67] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 bg-[#c4f542]/20 rounded-3xl blur-xl"></div>
                <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl font-bold text-[#1a5f4f] mb-3 tracking-tight">
                تسجيل الدخول
              </h1>
              <p className="text-neutral-600 text-lg font-medium">
                مرحباً بعودتك! سجل دخولك للمتابعة
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>

          {/* Form Container */}
          <div className="p-10">
            <LoginForm redirectTo={safeRedirect} />

            {/* Divider with Text */}
            <div className="mt-10 mb-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500 font-medium">أو</span>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-neutral-600 mb-4 flex items-center justify-center gap-2 flex-wrap">
                <span>ليس لديك حساب؟</span>
                <a 
                  href="/signup" 
                  className="text-[#1a5f4f] hover:text-[#2d7a67] font-bold transition-all duration-200 hover:underline decoration-2 underline-offset-4 inline-flex items-center gap-1.5 group"
                >
                  <span>إنشاء حساب جديد</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-white/90 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3.5 inline-block shadow-lg border border-white/20">
            بتسجيل الدخول، أنت توافق على{' '}
            <a href="/terms" className="text-[#c4f542] hover:text-[#d4ff6b] font-semibold hover:underline underline-offset-2 transition-colors">
              الشروط والأحكام
            </a>
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-[#c4f542] rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#c4f542] rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-1/3 right-5 w-1.5 h-1.5 bg-[#c4f542] rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
      </div>
    </div>
  )
}
