'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Icons from '@/components/icons'
import Link from 'next/link'

interface Question {
  id: string
  competition_id: string | null
  is_training: boolean
  type: string
  category: string
  difficulty: string
  question_text: string
  options: any
  correct_answer: string
  volume: string
  page: string
  line_from: string
  line_to: string
  is_active: boolean
  created_at: string
  status: string
}

interface Competition {
  id: string
  title: string
  slug: string
  status: string
  start_at: string
  end_at: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'overview'
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (section === 'question-bank') {
      fetchQuestions()
    } else if (section === 'training') {
      fetchTrainingQuestions()
    }
  }, [section])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/questions/all')
      if (!response.ok) throw new Error('Failed to fetch questions')
      
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainingQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/questions/training')
      if (!response.ok) throw new Error('Failed to fetch training questions')
      
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">لوحة التحكم</h1>
          <p className="text-neutral-600">إدارة المسابقات والأسئلة</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-card shadow-sm mb-6">
          <div className="flex border-b border-neutral-200 overflow-x-auto">
            <Link
              href="/dashboard?section=overview"
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                section === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              نظرة عامة
            </Link>
            <Link
              href="/dashboard?section=question-bank"
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                section === 'question-bank'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              بنك الأسئلة
            </Link>
            <Link
              href="/dashboard?section=training"
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                section === 'training'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              الأسئلة التدريبية
            </Link>
            <Link
              href="/dashboard/competitions"
              className="px-6 py-4 font-medium text-neutral-600 hover:text-neutral-900 whitespace-nowrap"
            >
              المسابقات
            </Link>
          </div>
        </div>

        {/* Content */}
        {section === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-card shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-800">إجمالي الأسئلة</h3>
                <Icons.book className="w-8 h-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">-</p>
            </div>
            <div className="bg-white rounded-card shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-800">المسابقات النشطة</h3>
                <Icons.trophy className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-amber-500">-</p>
            </div>
            <div className="bg-white rounded-card shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-800">الأسئلة التدريبية</h3>
                <Icons.target className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-500">-</p>
            </div>
          </div>
        )}

        {(section === 'question-bank' || section === 'training') && (
          <div>
            {loading ? (
              <div className="bg-white rounded-card shadow-sm p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-600">جاري تحميل الأسئلة...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.warning className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">حدث خطأ</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => section === 'question-bank' ? fetchQuestions() : fetchTrainingQuestions()}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-button transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-card shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.book className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                  لا توجد أسئلة متاحة
                </h2>
                <p className="text-neutral-600">
                  {section === 'training' ? 'لا توجد أسئلة تدريبية حالياً' : 'لا توجد أسئلة في بنك الأسئلة'}
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-card shadow-sm p-4 mb-6">
                  <p className="text-neutral-600">
                    عرض <span className="font-bold text-primary">{questions.length}</span> سؤال
                  </p>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-card shadow-sm p-6 border-2 border-transparent hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-neutral-100 text-neutral-700">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                            {question.question_text}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {question.category && (
                              <span className={`${getCategoryColor(question.category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                                {question.category}
                              </span>
                            )}
                            
                            {question.difficulty && (
                              <span className="bg-neutral-100 text-neutral-700 text-xs font-medium px-3 py-1 rounded-full">
                                {question.difficulty}
                              </span>
                            )}
                            
                            <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                              {getTypeLabel(question.type)}
                            </span>

                            {question.is_training && (
                              <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                                تدريبي
                              </span>
                            )}

                            {!question.is_training && question.competition_id && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
                                مسابقة
                              </span>
                            )}
                            
                            {question.volume && question.page && (
                              <>
                                <span className="text-neutral-500 text-xs">•</span>
                                <span className="text-neutral-600 text-xs">
                                  المجلد {question.volume} - ص{question.page}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
