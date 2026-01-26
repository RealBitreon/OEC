'use client'

import { useState } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, Question } from '@/lib/store/types'
import { createQuestion, updateQuestion, deleteQuestion } from '../actions'

interface QuestionsTabProps {
  session: SessionPayload
  competitions: Competition[]
  questions: Question[]
  setQuestions: (questions: Question[]) => void
}

export default function QuestionsTab({ session, competitions, questions, setQuestions }: QuestionsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const activeCompetition = competitions.find(c => c.status === 'active')
  const displayCompetitionId = selectedCompetition || activeCompetition?.id || ''
  const filteredQuestions = questions.filter(q => q.competitionId === displayCompetitionId)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const type = formData.get('type') as 'text' | 'true_false' | 'mcq'
    
    const data: any = {
      competitionId: displayCompetitionId,
      type,
      title: formData.get('title') as string,
      body: formData.get('body') as string,
      correctAnswer: formData.get('correctAnswer') as string
    }

    if (type === 'mcq') {
      data.options = [
        formData.get('option1'),
        formData.get('option2'),
        formData.get('option3'),
        formData.get('option4')
      ].filter(Boolean)
    }

    if (type === 'true_false') {
      data.correctAnswer = formData.get('correctAnswer') === 'true'
    }

    try {
      const result = await createQuestion(data)
      if (result.success) {
        setQuestions(result.questions!)
        setShowCreateModal(false)
        showToast('تم إنشاء السؤال بنجاح', 'success')
        e.currentTarget.reset()
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الإنشاء', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setLoading(true)
    try {
      const result = await updateQuestion(id, { isActive: !isActive })
      if (result.success) {
        setQuestions(result.questions!)
        showToast('تم التحديث بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا السؤال؟')) return

    setLoading(true)
    try {
      const result = await deleteQuestion(id)
      if (result.success) {
        setQuestions(result.questions!)
        showToast('تم الحذف بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الحذف', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!displayCompetitionId) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقة نشطة</h3>
        <p className="text-neutral-600">قم بإنشاء مسابقة أولاً</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">الأسئلة</h1>
          <p className="text-neutral-600">إدارة أسئلة المسابقة</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg transition-all"
        >
          + إضافة سؤال
        </button>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد أسئلة بعد</h3>
          <p className="text-neutral-600 mb-4">ابدأ بإضافة أول سؤال</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg transition-all"
          >
            إضافة سؤال
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-primary">#{idx + 1}</span>
                    <h3 className="text-lg font-bold text-neutral-900">{q.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      q.type === 'text' ? 'bg-blue-100 text-blue-700' :
                      q.type === 'true_false' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {q.type === 'text' ? 'نصي' : q.type === 'true_false' ? 'صح/خطأ' : 'اختيار متعدد'}
                    </span>
                    {!q.isActive && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-neutral-100 text-neutral-600">
                        غير نشط
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-700 mb-2">{q.body}</p>
                  {q.options && (
                    <div className="text-sm text-neutral-600 space-y-1">
                      {q.options.map((opt, i) => (
                        <div key={i}>• {opt}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(q.id, q.isActive)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                      q.isActive ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {q.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">إضافة سؤال جديد</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">نوع السؤال</label>
                <select
                  name="type"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  onChange={(e) => {
                    const form = e.currentTarget.form
                    if (form) {
                      const mcqOptions = form.querySelector('#mcq-options')
                      const tfOptions = form.querySelector('#tf-options')
                      const textAnswer = form.querySelector('#text-answer')
                      
                      if (mcqOptions && tfOptions && textAnswer) {
                        mcqOptions.classList.add('hidden')
                        tfOptions.classList.add('hidden')
                        textAnswer.classList.add('hidden')
                        
                        if (e.target.value === 'mcq') mcqOptions.classList.remove('hidden')
                        else if (e.target.value === 'true_false') tfOptions.classList.remove('hidden')
                        else textAnswer.classList.remove('hidden')
                      }
                    }
                  }}
                >
                  <option value="text">نصي</option>
                  <option value="true_false">صح/خطأ</option>
                  <option value="mcq">اختيار متعدد</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">عنوان السؤال</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="ما هو..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">نص السؤال</label>
                <textarea
                  name="body"
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="اكتب السؤال بالتفصيل..."
                />
              </div>

              <div id="mcq-options" className="hidden space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">الخيارات</label>
                <input type="text" name="option1" placeholder="الخيار 1" className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none" />
                <input type="text" name="option2" placeholder="الخيار 2" className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none" />
                <input type="text" name="option3" placeholder="الخيار 3" className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none" />
                <input type="text" name="option4" placeholder="الخيار 4" className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none" />
              </div>

              <div id="tf-options" className="hidden">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">الإجابة الصحيحة</label>
                <select name="correctAnswer" className="w-full px-4 py-3 rounded-lg border border-neutral-200 outline-none">
                  <option value="true">صح</option>
                  <option value="false">خطأ</option>
                </select>
              </div>

              <div id="text-answer">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">الإجابة الصحيحة</label>
                <input
                  type="text"
                  name="correctAnswer"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="الإجابة النموذجية"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة السؤال'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold z-50`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
