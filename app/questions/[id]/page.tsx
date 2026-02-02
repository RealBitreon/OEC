import { notFound } from 'next/navigation'
import { questionsRepo } from '@/lib/repos'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
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
            <BackButton 
              fallbackUrl="/questions"
              label="العودة إلى قائمة الأسئلة"
            />
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
                {question.type === 'fill_blank' && 'أكمل الفراغ'}
                {question.type === 'essay' && 'مقالي'}
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
                  <h3 className="font-bold text-amber-900 mb-1">ملاحظة هامة</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    يجب تحديد <strong>الدليل من المصدر</strong> بدقة: <strong>المجلد</strong> و<strong>الصفحة</strong> من الموسوعة العُمانية. الإجابات الصحيحة تدخلك في السحب للفوز بالجوائز!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Form */}
          <QuestionForm question={{
            ...question,
            correctAnswer: question.correctAnswer
          }} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
