import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import Icons from '@/components/icons'
import { createClient } from '@/lib/supabase/server'

export default async function CompetitionQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  
  // Get competition by ID
  const { data: competition, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !competition) {
    console.error('[QUESTIONS] Competition not found for id:', id, error)
    notFound()
  }
  
  console.log('[QUESTIONS] Found competition:', competition.id, competition.title)
  
  // Get questions for this competition
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('competition_id', competition.id)
    .order('order_index', { ascending: true })
  
  console.log('[QUESTIONS] Found questions:', questions?.length || 0)

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <BackButton fallbackUrl={`/competition/${competition.id}`} label="العودة للمسابقة" />
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Icons.help className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">أسئلة المسابقة</h1>
                  <p className="text-white/90 text-lg">{competition.title}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Icons.help className="w-5 h-5" />
                    <span className="font-semibold">عدد الأسئلة: {questions?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.info className="w-5 h-5" />
                    <span className="text-sm">معاينة فقط - للمشاركة الفعلية اضغط "ابدأ المشاركة"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {questions && questions.length > 0 ? (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div 
                    key={question.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Question Header */}
                    <div className="bg-gradient-to-l from-primary/5 to-transparent p-6 border-b border-neutral-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-neutral-900 mb-2">
                            {question.question_text}
                          </h3>
                          {question.question_image_url && (
                            <div className="mt-4">
                              <img 
                                src={question.question_image_url} 
                                alt={`صورة السؤال ${index + 1}`}
                                className="max-w-full h-auto rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {/* Answer Input Preview */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            الإجابة:
                          </label>
                          <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4 text-neutral-400">
                            سيتم الإجابة هنا عند المشاركة الفعلية...
                          </div>
                        </div>

                        {/* Evidence Input Preview */}
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            الدليل من الموسوعة العُمانية:
                          </label>
                          <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4 text-neutral-400">
                            سيتم إضافة الدليل هنا عند المشاركة الفعلية...
                          </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                          <div className="flex items-start gap-3">
                            <Icons.info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-1">ملاحظة مهمة:</p>
                              <p>يجب تقديم دليل من الموسوعة العُمانية لكل إجابة. الدليل يمكن أن يكون رابط، رقم صفحة، أو نص من الموسوعة.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.help className="w-10 h-10 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">لا توجد أسئلة</h2>
                <p className="text-neutral-600">
                  لم يتم إضافة أسئلة لهذه المسابقة بعد.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {questions && questions.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Icons.info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-neutral-900">هل أنت مستعد للمشاركة؟</p>
                      <p className="text-sm text-neutral-600">اضغط على "ابدأ المشاركة الآن" للإجابة على الأسئلة وتقديم الأدلة</p>
                    </div>
                  </div>
                  <Link
                    href={`/competition/${competition.id}/participate`}
                    className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  >
                    ابدأ المشاركة الآن
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
