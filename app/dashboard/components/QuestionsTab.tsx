'use client'

import { useState } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, Question } from '@/lib/store/types'
import { createQuestion, updateQuestion, deleteQuestion } from '../actions'
import QuestionFormModal from './QuestionFormModal'

interface QuestionsTabProps {
  session: SessionPayload
  competitions: Competition[]
  questions: Question[]
  setQuestions: (questions: Question[]) => void
}

export default function QuestionsTab({ session, competitions, questions, setQuestions }: QuestionsTabProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
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

  const handleSubmit = async (data: any, isDraft: boolean) => {
    setLoading(true)
    try {
      if (editingQuestion) {
        // Update existing question
        const result = await updateQuestion(editingQuestion.id, {
          ...data,
          isActive: !isDraft
        })
        if (result.success) {
          setQuestions(result.questions!)
          showToast('تم تحديث السؤال بنجاح', 'success')
        } else {
          showToast(result.error || 'حدث خطأ', 'error')
        }
      } else {
        // Create new question
        const result = await createQuestion({
          ...data,
          isActive: !isDraft
        })
        if (result.success) {
          setQuestions(result.questions!)
          showToast('تم إنشاء السؤال بنجاح', 'success')
        } else {
          showToast(result.error || 'حدث خطأ', 'error')
        }
      }
      setShowModal(false)
      setEditingQuestion(null)
    } catch (error) {
      showToast('حدث خطأ في الحفظ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setShowModal(true)
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل تريد حذف السؤال "${title}"؟\n\nسيتم حذف السؤال ولن يظهر للطلاب.`)) return

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
          onClick={() => {
            setEditingQuestion(null)
            setShowModal(true)
          }}
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
            onClick={() => {
              setEditingQuestion(null)
              setShowModal(true)
            }}
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
                    {q.isActive ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                        منشور
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-neutral-100 text-neutral-600">
                        مسودة
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-700 mb-2">{q.body}</p>
                  {q.sourceRef && (q.sourceRef.volume || q.sourceRef.page) && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block mb-2">
                      📖 {q.sourceRef.volume} | ص {q.sourceRef.page}
                      {q.sourceRef.lineFrom > 0 && ` | س ${q.sourceRef.lineFrom}-${q.sourceRef.lineTo}`}
                    </div>
                  )}
                  {q.options && (
                    <div className="text-sm text-neutral-600 space-y-1">
                      {q.options.map((opt, i) => (
                        <div key={i} className={i === q.correctAnswer ? 'font-semibold text-green-600' : ''}>
                          • {opt} {i === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(q)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleToggleActive(q.id, q.isActive)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                      q.isActive ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {q.isActive ? 'إخفاء' : 'نشر'}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.title)}
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

      {/* Question Form Modal */}
      {showModal && (
        <QuestionFormModal
          onClose={() => {
            setShowModal(false)
            setEditingQuestion(null)
          }}
          onSubmit={handleSubmit}
          competitionId={displayCompetitionId}
          editingQuestion={editingQuestion}
        />
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
