'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Question } from '@/lib/store/types'
import Icons from '@/components/icons'

interface QuestionsFilterProps {
  questions: Question[]
}

export default function QuestionsFilter({ questions }: QuestionsFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('الكل')
  const [selectedType, setSelectedType] = useState<string>('الكل')

  // Get unique categories, difficulties, and types
  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category).filter(Boolean))
    return ['الكل', ...Array.from(cats)]
  }, [questions])

  const difficulties = ['الكل', 'سهل', 'متوسط', 'صعب']
  
  const types = [
    { value: 'الكل', label: 'الكل' },
    { value: 'mcq', label: 'اختيار من متعدد' },
    { value: 'true_false', label: 'صح أو خطأ' },
    { value: 'fill_blank', label: 'أكمل الفراغ' },
    { value: 'essay', label: 'مقالي' },
  ]

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const categoryMatch = selectedCategory === 'الكل' || q.category === selectedCategory
      const difficultyMatch = selectedDifficulty === 'الكل' || q.difficulty === selectedDifficulty
      const typeMatch = selectedType === 'الكل' || q.type === selectedType
      return categoryMatch && difficultyMatch && typeMatch
    })
  }, [questions, selectedCategory, selectedDifficulty, selectedType])

  const getTypeLabel = (type: string) => {
    const typeObj = types.find(t => t.value === type)
    return typeObj?.label || type
  }

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

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-card shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-neutral-800 mb-4">تصفية الأسئلة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              التصنيف
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              مستوى الصعوبة
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              نوع السؤال
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            عرض <span className="font-bold text-primary">{filteredQuestions.length}</span> من أصل {questions.length} سؤال
          </p>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.search className="w-10 h-10 " />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            لا توجد أسئلة مطابقة
          </h2>
          <p className="text-neutral-600 mb-4">
            جرب تغيير معايير التصفية
          </p>
          <button
            onClick={() => {
              setSelectedCategory('الكل')
              setSelectedDifficulty('الكل')
              setSelectedType('الكل')
            }}
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-button transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
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
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-neutral-800 line-clamp-2">
                        {question.questionText}
                      </h3>
                    </div>

                    {/* Question Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {/* Category Badge */}
                      {question.category && (
                        <span className={`${getCategoryColor(question.category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {question.category}
                        </span>
                      )}
                      
                      {/* Difficulty Badge */}
                      {question.difficulty && (
                        <span className="bg-neutral-100 text-neutral-700 text-xs font-medium px-3 py-1 rounded-full">
                          {question.difficulty}
                        </span>
                      )}
                      
                      {/* Type Badge */}
                      <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                        {getTypeLabel(question.type)}
                      </span>
                      
                      {/* Source Reference */}
                      <span className="text-neutral-500 text-xs">
                        •
                      </span>
                      <span className="text-neutral-600 text-xs">
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
  )
}
