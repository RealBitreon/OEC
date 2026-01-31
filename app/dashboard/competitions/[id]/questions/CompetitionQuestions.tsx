'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Question } from '@/app/dashboard/core/types'
import { 
  getQuestions, 
  deleteQuestion,
  addQuestionsToCompetition,
  getLibraryQuestions
} from '@/app/dashboard/actions/questions'
import { Modal } from '@/components/ui/Modal'
import { Icons } from '@/components/icons'

interface CompetitionQuestionsProps {
  competitionId: string
  competitionTitle: string
}

export default function CompetitionQuestions({ competitionId, competitionTitle }: CompetitionQuestionsProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSource, setAddSource] = useState<'training' | 'library' | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; question: Question | null }>({ 
    isOpen: false, 
    question: null 
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [competitionId])

  const loadData = async () => {
    try {
      const result = await getQuestions({ competition_id: competitionId })
      setQuestions(result.questions || [])
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestions = async (source: 'training' | 'library') => {
    setAddSource(source)
    setSelectedQuestions(new Set())
    
    try {
      let available: Question[]
      if (source === 'training') {
        const result = await getQuestions({ is_training: true })
        available = result.questions.filter(q => q.competition_id === null && q.status === 'PUBLISHED')
      } else {
        available = await getLibraryQuestions()
      }
      setAvailableQuestions(available)
      setShowAddModal(true)
    } catch (error) {
      console.error('Failed to load questions:', error)
      alert('فشل تحميل الأسئلة')
    }
  }

  const toggleQuestionSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestions)
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId)
    } else {
      newSelection.add(questionId)
    }
    setSelectedQuestions(newSelection)
  }

  const confirmAddQuestions = async () => {
    if (selectedQuestions.size === 0) {
      alert('الرجاء اختيار سؤال واحد على الأقل')
      return
    }

    if (!confirm(`هل تريد إضافة ${selectedQuestions.size} سؤال إلى هذه المسابقة؟`)) {
      return
    }

    setAdding(true)
    try {
      await addQuestionsToCompetition(Array.from(selectedQuestions), competitionId)
      setShowAddModal(false)
      setAddSource(null)
      setSelectedQuestions(new Set())
      await loadData()
      alert(`تم إضافة ${selectedQuestions.size} سؤال بنجاح`)
    } catch (error: any) {
      alert(error?.message || 'فشل إضافة الأسئلة')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = (question: Question) => {
    setDeleteModal({ isOpen: true, question })
  }

  const confirmDelete = async () => {
    if (!deleteModal.question) return
    
    setDeleting(true)
    try {
      await deleteQuestion(deleteModal.question.id)
      setDeleteModal({ isOpen: false, question: null })
      await loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('فشل حذف السؤال')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">أسئلة المسابقة</h2>
          <p className="text-neutral-600 mt-1">{competitionTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAddQuestions('library')}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            + من المكتبة
          </button>
          <button
            onClick={() => handleAddQuestions('training')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + من التدريب
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">إضافة أسئلة للمسابقة</h3>
            <p className="text-sm text-blue-700">
              يمكنك إضافة أسئلة من المكتبة أو من الأسئلة التدريبية. سيتم نسخ الأسئلة المختارة إلى هذه المسابقة.
            </p>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <Icons.question className="w-10 h-10 mb-4 block" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد أسئلة</h2>
          <p className="text-neutral-600 mb-6">ابدأ بإضافة أسئلة لهذه المسابقة</p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => handleAddQuestions('library')}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              + من المكتبة
            </button>
            <button
              onClick={() => handleAddQuestions('training')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + من التدريب
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-neutral-400">#{index + 1}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      question.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 
                      question.type === 'true_false' ? 'bg-green-100 text-green-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {question.type === 'mcq' ? 'اختيار من متعدد' : question.type === 'true_false' ? 'صح/خطأ' : 'نص'}
                    </span>
                  </div>
                  <p className="text-neutral-900 font-medium mb-2">{question.question_text}</p>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span>📚 المجلد {question.volume}</span>
                    <span>📄 ص {question.page}</span>
                    <span>📝 س {question.line_from}-{question.line_to}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(question)}
                  className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  حذف من المسابقة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Questions Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => !adding && setShowAddModal(false)}
        title={`إضافة أسئلة من ${addSource === 'training' ? 'التدريب' : 'المكتبة'}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            اختر الأسئلة التي تريد إضافتها لهذه المسابقة:
          </p>

          {availableQuestions.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-neutral-600">
                لا توجد أسئلة متاحة في {addSource === 'training' ? 'التدريب' : 'المكتبة'}
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {availableQuestions.map(question => (
                  <div
                    key={question.id}
                    onClick={() => toggleQuestionSelection(question.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedQuestions.has(question.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            question.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 
                            question.type === 'true_false' ? 'bg-green-100 text-green-700' : 
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {question.type === 'mcq' ? 'اختيار من متعدد' : question.type === 'true_false' ? 'صح/خطأ' : 'نص'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-900 font-medium">{question.question_text}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-600 mt-1">
                          <span>📚 {question.volume}</span>
                          <span>📄 {question.page}</span>
                          <span>📝 {question.line_from}-{question.line_to}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-neutral-600">
                  تم اختيار {selectedQuestions.size} سؤال
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={adding}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmAddQuestions}
                    disabled={adding || selectedQuestions.size === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? 'جاري الإضافة...' : `إضافة ${selectedQuestions.size} سؤال`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !deleting && setDeleteModal({ isOpen: false, question: null })}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            هل أنت متأكد من حذف هذا السؤال من المسابقة؟
          </p>
          {deleteModal.question && (
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-900 font-medium">
                {deleteModal.question.question_text}
              </p>
            </div>
          )}
          <p className="text-sm text-yellow-600">
            ⚠️ سيتم حذف السؤال من المسابقة فقط. السؤال الأصلي في المكتبة/التدريب سيبقى كما هو.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
            <button
              onClick={() => setDeleteModal({ isOpen: false, question: null })}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
