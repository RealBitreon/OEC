'use client'

import Link from 'next/link'
import type { Question } from '@/lib/store/types'
import Icons from '@/components/icons'

interface QuestionsPreviewProps {
  questions: Question[]
}

export default function QuestionsPreview({ questions }: QuestionsPreviewProps) {
  // Show first 6 questions
  const displayQuestions = questions.slice(0, 6)

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'جغرافيا': 'bg-blue-500',
      'تاريخ': 'bg-amber-500',
      'تراث': 'bg-purple-500',
      'ثقافة': 'bg-green-500',
      'اقتصاد': 'bg-red-500',
      'علوم': 'bg-cyan-500',
    }
    return colors[category || ''] || 'bg-primary'
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'mcq': 'اختيار من متعدد',
      'true_false': 'صح أو خطأ',
      'fill_blank': 'أكمل الفراغ',
      'essay': 'مقالي',
    }
    return types[type] || type
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'mcq': '📝',
      'true_false': '✓✗',
      'fill_blank': '___',
      'essay': '📄',
    }
    return icons[type] || '❓'
  }

  if (displayQuestions.length === 0) {
    return (
      <section className="py-24 bg-neutral-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-primary mb-4">بنك الأسئلة التدريبية</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              تعرّف على نوعية الأسئلة التي ستواجهها في المسابقة
            </p>
          </div>

          <div className="bg-white rounded-card shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.book className="w-10 h-10 " />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">
              لا توجد أسئلة متاحة حالياً
            </h3>
            <p className="text-neutral-600">
              سيتم إضافة الأسئلة التدريبية قريباً
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-primary mb-4">بنك الأسئلة التدريبية</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            تعرّف على نوعية الأسئلة التي ستواجهها في المسابقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayQuestions.map((question, index) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="card group cursor-pointer block hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with Category and Difficulty */}
              <div className="flex items-center justify-between mb-4">
                {question.category && (
                  <span className={`${getCategoryColor(question.category)} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>
                    {question.category}
                  </span>
                )}
                {question.difficulty && (
                  <span className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full font-medium">
                    {question.difficulty}
                  </span>
                )}
              </div>

              {/* Question Type Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  <span>{getTypeIcon(question.type)}</span>
                  <span>{getTypeLabel(question.type)}</span>
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-neutral-800 mb-4 leading-relaxed min-h-[60px] line-clamp-3">
                {question.questionText}
              </h3>

              {/* Source Reference */}
              {question.sourceRef && (
                <div className="flex items-center gap-2 text-neutral-500 text-xs mb-4 pb-4 border-b border-neutral-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>
                    المجلد {question.sourceRef.volume} - ص{question.sourceRef.page}
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <span className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-button transition-all duration-300 group-hover:scale-105">
                عرض السؤال
              </span>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/questions"
            className="inline-block bg-white hover:bg-neutral-50 text-primary border-2 border-primary font-bold px-10 py-4 rounded-button transition-all duration-300 hover:scale-105 shadow-md"
          >
            عرض جميع الأسئلة ({questions.length})
          </Link>
        </div>
      </div>
    </section>
  )
}
