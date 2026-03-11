import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import Icons from '@/components/icons'
import { createClient } from '@/lib/supabase/server'

export default async function CompetitionWheelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  
  // Try to fetch competition by ID first, then by slug
  let competition = null
  let error = null
  
  // First attempt: Try as UUID
  const { data: compById, error: errorById } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  
  if (compById) {
    competition = compById
  } else {
    // Second attempt: Try as slug
    const { data: compBySlug, error: errorBySlug } = await supabase
      .from('competitions')
      .select('*')
      .eq('slug', id)
      .maybeSingle()
    
    if (compBySlug) {
      competition = compBySlug
    } else {
      error = errorById || errorBySlug
    }
  }
  
  if (error || !competition) {
    console.error('[WHEEL] Competition not found for id/slug:', id, error)
    notFound()
  }
  
  console.log('[WHEEL] Found competition:', competition.id, competition.title)
  
  // Get winners for this competition
  const { data: winners } = await supabase
    .from('winners')
    .select(`
      *,
      submission:submissions(
        user:users(display_name, username)
      )
    `)
    .eq('competition_id', competition.id)
    .order('created_at', { ascending: false })
  
  const wheelDate = competition.wheel_at ? new Date(competition.wheel_at) : null
  const now = new Date()
  const hasDrawn = winners && winners.length > 0
  const isDrawTime = wheelDate && now >= wheelDate

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <BackButton fallbackUrl={`/competition/${encodeURIComponent(competition.id)}`} label="العودة للمسابقة" />
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce-subtle">
                    <span className="text-4xl">🎡</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">عجلة الحظ</h1>
                    <p className="text-white/90 text-lg">{competition.title}</p>
                  </div>
                </div>
                
                {wheelDate && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <Icons.calendar className="w-6 h-6" />
                        <div>
                          <p className="text-sm text-white/80">موعد السحب</p>
                          <p className="font-bold text-lg">
                            {wheelDate.toLocaleDateString('ar-SA', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icons.award className="w-6 h-6" />
                        <div>
                          <p className="text-sm text-white/80">عدد الفائزين</p>
                          <p className="font-bold text-lg">{competition.winner_count} فائز</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Winners Section */}
            {hasDrawn ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icons.trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">الفائزون</h2>
                      <p className="text-neutral-600">تم إجراء السحب بنجاح</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {winners.map((winner, index) => (
                      <div 
                        key={winner.id}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icons.trophy className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">فائز</span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-1">
                              {winner.submission?.user?.display_name || 'مشارك'}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              @{winner.submission?.user?.username || 'user'}
                            </p>
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-neutral-500">
                                تم السحب في: {new Date(winner.created_at).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Congratulations Message */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-8 text-center">
                  <span className="text-6xl mb-4 block">🎉</span>
                  <h3 className="text-2xl font-bold mb-2">مبروك للفائزين!</h3>
                  <p className="text-white/90">
                    تهانينا الحارة لجميع الفائزين في هذه المسابقة
                  </p>
                </div>
              </div>
            ) : isDrawTime ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                  <Icons.clock className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">حان وقت السحب!</h2>
                <p className="text-lg text-neutral-600 mb-8">
                  موعد السحب قد حان. سيتم إجراء السحب قريباً من قبل الإدارة.
                </p>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <Icons.info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="text-right">
                      <p className="font-semibold text-purple-900 mb-2">معلومة:</p>
                      <p className="text-purple-800">
                        سيتم الإعلان عن الفائزين فور إجراء السحب. تابع هذه الصفحة للحصول على النتائج.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : wheelDate ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.calendar className="w-12 h-12 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">السحب قريباً</h2>
                <p className="text-lg text-neutral-600 mb-8">
                  لم يحن موعد السحب بعد. عد في الموعد المحدد لمشاهدة النتائج.
                </p>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8 max-w-2xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Icons.calendar className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                      <p className="text-sm text-amber-700 mb-1">التاريخ</p>
                      <p className="font-bold text-amber-900">
                        {wheelDate.toLocaleDateString('ar-SA', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                    <div>
                      <Icons.clock className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                      <p className="text-sm text-amber-700 mb-1">الوقت</p>
                      <p className="font-bold text-amber-900">
                        {wheelDate.toLocaleTimeString('ar-SA', { 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/competition/${encodeURIComponent(competition.id)}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
                  >
                    <Icons.arrowRight className="w-5 h-5" />
                    <span>العودة لصفحة المسابقة</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.info className="w-12 h-12 text-neutral-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">لم يتم تحديد موعد السحب</h2>
                <p className="text-lg text-neutral-600">
                  سيتم الإعلان عن موعد السحب قريباً.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
