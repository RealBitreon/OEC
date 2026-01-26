'use client'

import Link from 'next/link'

export default function QuestionsPreview() {
  const demoQuestions = [
    {
      id: '1',
      title_ar: 'ما هي عاصمة سلطنة عُمان؟',
      category: 'جغرافيا',
      difficulty: 'سهل'
    },
    {
      id: '2',
      title_ar: 'من هو مؤسس الدولة البوسعيدية؟',
      category: 'تاريخ',
      difficulty: 'متوسط'
    },
    {
      id: '3',
      title_ar: 'ما هي أهم الصناعات التقليدية في عُمان؟',
      category: 'ثقافة',
      difficulty: 'متوسط'
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'جغرافيا': 'bg-blue-500',
      'تاريخ': 'bg-amber-500',
      'تراث': 'bg-purple-500',
      'ثقافة': 'bg-green-500',
      'علوم': 'bg-red-500'
    }
    return colors[category] || 'bg-primary'
  }

  return (
    <section className="py-24 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-primary mb-4">أمثلة على الأسئلة</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            تعرّف على نوعية الأسئلة التي ستواجهها في المسابقة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {demoQuestions.map((question, index) => (
            <div
              key={question.id}
              className="card group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`${getCategoryColor(question.category)} text-white text-sm font-bold px-4 py-2 rounded-full`}>
                  {question.category}
                </span>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                  {question.difficulty}
                </span>
              </div>

              {/* Question Title */}
              <h3 className="text-lg font-bold text-neutral-800 mb-4 leading-relaxed min-h-[60px]">
                {question.title_ar}
              </h3>

              {/* Time Info */}
              <div className="flex items-center gap-2 text-neutral-600 mb-6">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-medium">5 دقائق</span>
              </div>

              {/* CTA */}
              <Link
                href="/questions"
                className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-button transition-all duration-300 group-hover:scale-105"
              >
                تصفح الأسئلة
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/questions"
            className="inline-block bg-white hover:bg-neutral-50 text-primary border-2 border-primary font-bold px-10 py-4 rounded-button transition-all duration-300 hover:scale-105 shadow-md"
          >
            عرض جميع الأسئلة
          </Link>
        </div>
      </div>
    </section>
  )
}
