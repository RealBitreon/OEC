'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  type: 'text' | 'true_false' | 'mcq'
  title: string
  body: string
  difficulty?: 'easy' | 'medium' | 'hard'
  isTraining: boolean
  isActive: boolean
}

interface Props {
  questions: Question[]
}

export default function QuestionsIndexClient({ questions }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.body.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || q.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [questions, searchTerm, typeFilter])

  const getTypeBadge = (type: string) => {
    const badges = {
      true_false: { label: 'صح/خطأ', color: 'bg-blue-100 text-blue-700' },
      mcq: { label: 'اختيار متعدد', color: 'bg-purple-100 text-purple-700' },
      text: { label: 'نص', color: 'bg-green-100 text-green-700' },
    }
    return badges[type as keyof typeof badges] || badges.text
  }

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null
    const badges = {
      easy: { label: 'سهل', color: 'bg-green-100 text-green-700' },
      medium: { label: 'متوسط', color: 'bg-yellow-100 text-yellow-700' },
      hard: { label: 'صعب', color: 'bg-red-100 text-red-700' },
    }
    return badges[difficulty as keyof typeof badges]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-l from-primary to-primary-dark text-white py-16">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              الأسئلة التدريبية
            </h1>
            <p className="text-xl text-white/90 mb-2">
              تدرّب على الأسئلة بدون ضغط المسابقة
            </p>
            <p className="text-white/80">
              هذه الأسئلة لا تؤثر على المسابقة أو عجلة الحظ
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  البحث
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث في الأسئلة..."
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  نوع السؤال
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="true_false">صح/خطأ</option>
                  <option value="mcq">اختيار متعدد</option>
                  <option value="text">نص</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                لا توجد أسئلة تدريبية حالياً
              </h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm || typeFilter !== 'all'
                  ? 'جرّب تغيير معايير البحث'
                  : 'سيتم إضافة أسئلة تدريبية قريباً'}
              </p>
              <Link
                href="/"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-button transition-all"
              >
                العودة للرئيسية
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const typeBadge = getTypeBadge(question.type)
                const difficultyBadge = getDifficultyBadge(question.difficulty)

                return (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl shadow-card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                          {difficultyBadge && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyBadge.color}`}>
                              {difficultyBadge.label}
                            </span>
                          )}
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                            تدريبي
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">
                          {question.title}
                        </h3>
                        <p className="text-neutral-600 line-clamp-2">
                          {question.body}
                        </p>
                      </div>
                      <Link
                        href={`/questions/${question.id}`}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-button transition-all hover:scale-105 shadow-button whitespace-nowrap"
                      >
                        جرّب السؤال
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Results Count */}
          {filteredQuestions.length > 0 && (
            <div className="text-center mt-8 text-neutral-600">
              عرض {filteredQuestions.length} من {questions.length} سؤال
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
