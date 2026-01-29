import { createClient } from '@/lib/supabase/server'
import QuestionsFilter from './QuestionsFilter'
import type { Question } from '@/lib/store/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'

export default async function QuestionsPage() {
  const supabase = await createClient()
  
  // Fetch training questions (is_training = true and is_active = true)
  // Note: Supabase uses snake_case for column names
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('is_training', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Handle error case
  if (error) {
    return (
      <main className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <BackButton fallbackUrl="/" label="العودة للرئيسية" />
          </div>
          <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              حدث خطأ في تحميل الأسئلة
            </h2>
            <p className="text-red-600 mb-4">
              {error.message || 'يرجى المحاولة مرة أخرى لاحقاً'}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Transform snake_case to camelCase
  const questionsData: Question[] = (questions || []).map((q: any) => ({
    id: q.id,
    competitionId: q.competition_id,
    isTraining: q.is_training,
    type: q.type,
    category: q.category,
    difficulty: q.difficulty,
    questionText: q.question_text,
    options: q.options,
    correctAnswer: q.correct_answer,
    sourceRef: q.source_ref || {
      volume: '',
      page: '',
      lineFrom: '',
      lineTo: ''
    },
    isActive: q.is_active,
    createdAt: q.created_at,
    updatedAt: q.updated_at
  }))

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton fallbackUrl="/" label="العودة للرئيسية" />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">بنك الأسئلة التدريبية</h1>
          <p className="text-neutral-600">
            تصفح واختبر معلوماتك من خلال مجموعة متنوعة من الأسئلة التدريبية
          </p>
        </div>

        {questionsData.length === 0 ? (
          <div className="bg-white rounded-card shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              لا توجد أسئلة متاحة حالياً
            </h2>
            <p className="text-neutral-600">
              سيتم إضافة الأسئلة التدريبية قريباً
            </p>
          </div>
        ) : (
          <QuestionsFilter questions={questionsData} />
        )}
      </div>
      <Footer />
    </main>
  )
}
