import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import Icons from '@/components/icons'
import { createClient } from '@/lib/supabase/server'

interface Competition {
  id: string
  title: string
  slug: string
  description: string
  status: string
  start_at: string
  end_at: string
  wheel_at: string
  max_attempts: number
  winner_count: number
  rules: any
}

export default async function CompetitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const supabase = await createClient()
  
  // Fetch competition details
  const { data: competition, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !competition) {
    notFound()
  }

  // Fetch questions count for this competition
  const { count: questionsCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', competition.id)

  // Fetch submissions count
  const { count: submissionsCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('competition_id', competition.id)

  const isActive = competition.status === 'active'
  const startDate = new Date(competition.start_at)
  const endDate = new Date(competition.end_at)
  const wheelDate = competition.wheel_at ? new Date(competition.wheel_at) : null
  const now = new Date()
  
  const hasStarted = now >= startDate
  const hasEnded = now >= endDate
  const canParticipate = isActive && hasStarted && !hasEnded

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <BackButton fallbackUrl="/" label="العودة للرئيسية" />
            </div>

            {/* Competition Header */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Icons.trophy className="w-10 h-10" />
                    <h1 className="text-3xl md:text-4xl font-bold">{competition.title}</h1>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {competition.description}
                  </p>
                </div>
                
                {isActive && (
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold whitespace-nowrap mr-4">
                    نشطة الآن
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Icons.help className="w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold">{questionsCount || 0}</p>
                  <p className="text-sm text-white/80">سؤال</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Icons.users className="w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold">{submissionsCount || 0}</p>
                  <p className="text-sm text-white/80">مشارك</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Icons.award className="w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold">{competition.winner_count}</p>
                  <p className="text-sm text-white/80">فائز</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Icons.refresh className="w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold">{competition.max_attempts}</p>
                  <p className="text-sm text-white/80">محاولة</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Timeline */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Icons.calendar className="w-6 h-6 text-primary" />
                    الجدول الزمني
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasStarted ? 'bg-green-100' : 'bg-neutral-100'}`}>
                        <Icons.play className={`w-6 h-6 ${hasStarted ? 'text-green-600' : 'text-neutral-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-800">بداية المسابقة</p>
                        <p className="text-neutral-600">{startDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-neutral-500">{startDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {hasStarted && <Icons.check className="w-6 h-6 text-green-600" />}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasEnded ? 'bg-red-100' : 'bg-neutral-100'}`}>
                        <Icons.clock className={`w-6 h-6 ${hasEnded ? 'text-red-600' : 'text-neutral-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-800">نهاية المسابقة</p>
                        <p className="text-neutral-600">{endDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-neutral-500">{endDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {hasEnded && <Icons.check className="w-6 h-6 text-red-600" />}
                    </div>

                    {wheelDate && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                          <Icons.target className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-800">السحب على الجوائز</p>
                          <p className="text-neutral-600">{wheelDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-sm text-neutral-500">{wheelDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rules */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Icons.info className="w-6 h-6 text-primary" />
                    قواعد المسابقة
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Icons.check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-neutral-700">عدد الأسئلة: <strong>{questionsCount || 0} سؤال</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icons.check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-neutral-700">عدد المحاولات المسموحة: <strong>{competition.max_attempts} محاولات</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icons.check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-neutral-700">عدد الفائزين: <strong>{competition.winner_count} فائز</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icons.check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-neutral-700">يجب تقديم دليل من الموسوعة العُمانية لكل إجابة</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icons.check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-neutral-700">سيتم مراجعة الإجابات من قبل معلم مركز مصادر التعلم</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Participation Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">المشاركة</h3>
                  
                  {canParticipate ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <Icons.check className="w-8 h-8 text-green-600 mb-2" />
                        <p className="text-green-800 font-semibold">المسابقة مفتوحة الآن!</p>
                        <p className="text-sm text-green-700 mt-1">يمكنك المشاركة والإجابة على الأسئلة</p>
                      </div>
                      
                      <Link
                        href={`/competition/${competition.slug}/participate`}
                        className="block w-full bg-primary hover:bg-primary-dark text-white text-center font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        ابدأ المشاركة الآن
                      </Link>
                      
                      <Link
                        href={`/competition/${competition.slug}/questions`}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        <Icons.eye className="w-5 h-5 inline-block ml-2" />
                        معاينة الأسئلة
                      </Link>
                    </div>
                  ) : !hasStarted ? (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                      <Icons.clock className="w-8 h-8 text-amber-600 mb-2" />
                      <p className="text-amber-800 font-semibold">لم تبدأ بعد</p>
                      <p className="text-sm text-amber-700 mt-1">المسابقة ستبدأ قريباً</p>
                    </div>
                  ) : hasEnded ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <Icons.close className="w-8 h-8 text-red-600 mb-2" />
                      <p className="text-red-800 font-semibold">انتهت المسابقة</p>
                      <p className="text-sm text-red-700 mt-1">لا يمكن المشاركة الآن</p>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4">
                      <Icons.info className="w-8 h-8 text-neutral-600 mb-2" />
                      <p className="text-neutral-800 font-semibold">غير متاحة</p>
                      <p className="text-sm text-neutral-700 mt-1">المسابقة غير نشطة حالياً</p>
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">روابط سريعة</h3>
                  
                  <div className="space-y-3">
                    <Link
                      href="/questions"
                      className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Icons.book className="w-5 h-5 text-primary" />
                      <span className="font-medium text-neutral-700">تدرب على الأسئلة</span>
                    </Link>
                    
                    <Link
                      href="/rules"
                      className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Icons.info className="w-5 h-5 text-primary" />
                      <span className="font-medium text-neutral-700">قواعد المسابقة</span>
                    </Link>
                    
                    <Link
                      href="/wheel"
                      className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Icons.target className="w-5 h-5 text-primary" />
                      <span className="font-medium text-neutral-700">عجلة الحظ</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
