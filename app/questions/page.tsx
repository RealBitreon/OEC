import Link from 'next/link'
import { questionsRepo } from '@/lib/repos'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function QuestionsPage() {
  // Fetch training questions - no authentication required
  const trainingQuestions = await questionsRepo.listTraining()

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              أسئلة التدريب
            </h1>
            <p className="text-neutral-600 text-base md:text-lg mb-4">
              تدرّب على الأسئلة لتحسين مهاراتك في البحث والتوثيق
            </p>
            
            {/* Important Notice */}
            <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">ملاحظة هامة</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    في المسابقة الفعلية، سيُطلب منك تحديد <strong>رقم المجلد</strong> و<strong>رقم الصفحة</strong> و<strong>رقم السطر</strong> من الموسوعة العُمانية كجزء من إجابتك.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-card p-6 mb-8 text-white">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{trainingQuestions.length}</div>
                <div className="text-white/80 text-sm">إجمالي الأسئلة التدريبية</div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {trainingQuestions.length === 0 ? (
            <div className="bg-white rounded-card shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                لا توجد أسئلة تدريبية حالياً
              </h2>
              <p className="text-neutral-600">
                سيتم إضافة أسئلة تدريبية قريباً
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingQuestions.map((question, index) => {
                return (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="block bg-white rounded-card shadow-sm hover:shadow-md transition-all duration-200 p-6 border-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-start gap-4">
                      {/* Question Number */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-neutral-100 text-neutral-700">
                          {index + 1}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-800 line-clamp-2">
                            {question.questionText}
                          </h3>
                        </div>

                        {/* Question Type Badge */}
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <span className="px-2 py-1 bg-neutral-100 rounded text-xs font-medium">
                            {question.type === 'mcq' && 'اختيار من متعدد'}
                            {question.type === 'true_false' && 'صح أو خطأ'}
                            {question.type === 'text' && 'إجابة نصية'}
                          </span>
                          <span>•</span>
                          <span>
                            المجلد {question.sourceRef.volume} - ص{question.sourceRef.page}
                          </span>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 text-neutral-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
