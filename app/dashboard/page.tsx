import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Icons from '@/components/icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get active competition
  const { data: activeCompetition } = await supabase
    .from('competitions')
    .select('*')
    .eq('status', 'active')
    .single()

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-l from-primary via-primary-dark to-primary-light rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.user className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">مرحباً، {profile.username}</h1>
              <p className="text-white/80">لوحة التحكم الخاصة بك</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white/70 text-sm">الدور</p>
              <p className="text-white font-bold">{profile.role === 'admin' ? 'مدير' : profile.role === 'supervisor' ? 'مشرف' : 'مستخدم'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white/70 text-sm">البريد الإلكتروني</p>
              <p className="text-white font-bold">{profile.email || 'غير محدد'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">الإجراءات السريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Active Competition */}
            {activeCompetition && (
              <Link
                href={`/competition/${activeCompetition.slug}/participate`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-primary/20 hover:border-primary"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icons.trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">المسابقة النشطة</h3>
                <p className="text-neutral-600 mb-4">{activeCompetition.title}</p>
                <div className="flex items-center text-primary font-semibold">
                  <span>شارك الآن</span>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            )}

            {/* Training Questions */}
            <Link
              href="/questions"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-primary"
            >
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Icons.file className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">أسئلة التدريب</h3>
              <p className="text-neutral-600 mb-4">تدرب على الأسئلة وحسّن مهاراتك</p>
              <div className="flex items-center text-primary font-semibold">
                <span>ابدأ التدريب</span>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>

            {/* Wheel */}
            <Link
              href="/wheel"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-primary"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Icons.trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">عجلة السحب</h3>
              <p className="text-neutral-600 mb-4">شاهد نتائج السحب والفائزين</p>
              <div className="flex items-center text-primary font-semibold">
                <span>عرض النتائج</span>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>

            {/* Rules */}
            <Link
              href="/rules"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-primary"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icons.file className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">قواعد المسابقة</h3>
              <p className="text-neutral-600 mb-4">اقرأ القواعد والشروط</p>
              <div className="flex items-center text-primary font-semibold">
                <span>اقرأ المزيد</span>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>

            {/* Guide */}
            <Link
              href="/guide"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-primary"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Icons.help className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">دليل الاستخدام</h3>
              <p className="text-neutral-600 mb-4">تعلم كيفية استخدام المنصة</p>
              <div className="flex items-center text-primary font-semibold">
                <span>عرض الدليل</span>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>

            {/* Admin Panel - Only for admins */}
            {profile.role === 'admin' && (
              <Link
                href="/admin/simulator"
                className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-white"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Icons.settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">لوحة الإدارة</h3>
                <p className="text-white/80 mb-4">إدارة المسابقات والمستخدمين</p>
                <div className="flex items-center font-semibold">
                  <span>فتح لوحة الإدارة</span>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">إعدادات الحساب</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-semibold transition-colors text-center"
            >
              العودة للرئيسية
            </Link>
            <form action="/api/logout" method="POST" className="flex-1">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                تسجيل الخروج
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
