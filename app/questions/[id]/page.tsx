import { notFound } from 'next/navigation'
import Link from 'next/link'
import { questionsRepo } from '@/lib/repos'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import QuestionForm from './QuestionForm'

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch the question - no authentication required
  const question = await questionsRepo.getById(id)
  
  if (!question || !question.isTraining) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              href="/questions"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>العودة إلى قائمة الأسئلة</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                سؤال تدريبي
              </h1>
              <span className="px-3 py-1 bg-secondary/20 text-secondary-dark rounded-full text-sm font-medium">
                {question.type === 'mcq' && 'اختيار من متعدد'}
                {question.type === 'true_false' && 'صح أو خطأ'}
                {question.type === 'text' && 'إجابة نصية'}
              </span>
            </div>
            <p className="text-neutral-600 mb-3">
              اقرأ السؤال بعناية وارجع إلى المصدر المذكور للإجابة بشكل صحيح
            </p>
            
            {/* Important Notice */}
            <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">ملاحظة هامة للمسابقة الفعلية</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    في المسابقة الفعلية، سيُطلب منك تحديد <strong>رقم المجلد</strong> و<strong>رقم الصفحة</strong> و<strong>رقم السطر</strong> من الموسوعة العُمانية كجزء من إجابتك. تأكد من الرجوع إلى المصدر الأصلي وتوثيق إجابتك بدقة.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Form */}
          <QuestionForm question={question} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
