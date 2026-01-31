'use client'

import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'
import { User, Question, Competition } from '../../core/types'
import { 
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  duplicateQuestion, 
  moveToTraining,
  moveToLibrary,
  getLibraryQuestions,
  type QuestionFormData 
} from '../../actions/questions'
import { getCompetitions } from '../../actions/competitions'
import { Modal } from '@/components/ui/Modal'

interface QuestionsManagementProps {
  profile: User
  mode?: 'training' | 'bank'
}

export default function QuestionsManagement({ profile, mode = 'training' }: QuestionsManagementProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDestinationModal, setShowDestinationModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; question: Question | null }>({ 
    isOpen: false, 
    question: null 
  })
  const [deleting, setDeleting] = useState(false)
  
  const [filters, setFilters] = useState<{
    type: string
    search: string
  }>({
    type: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [mode, filters])

  const loadData = async () => {
    try {
      let questionsData: Question[]
      
      if (mode === 'bank') {
        // Library: DRAFT questions with competition_id = NULL and is_training = false
        const result = await getQuestions({ 
          is_training: false,
          search: filters.search,
          type: filters.type
        })
        questionsData = result.questions.filter(q => q.competition_id === null && q.status === 'DRAFT')
      } else {
        // Training: PUBLISHED questions with is_training = true and competition_id = NULL
        const result = await getQuestions({ 
          is_training: true,
          search: filters.search,
          type: filters.type
        })
        questionsData = result.questions.filter(q => q.competition_id === null && q.status === 'PUBLISHED')
      }
      
      const competitionsData = await getCompetitions()
      
      setQuestions(questionsData)
      setCompetitions(competitionsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingQuestion(null)
    setShowDestinationModal(true)
  }

  const handleDestinationSelected = (destination: 'library' | 'training') => {
    setShowDestinationModal(false)
    setShowForm(true)
    // Set a temporary question with the destination
    setEditingQuestion({
      id: '',
      competition_id: null,
      is_training: destination === 'training',
      status: destination === 'training' ? 'PUBLISHED' : 'DRAFT',
      type: 'mcq',
      question_text: '',
      options: null,
      correct_answer: null,
      volume: '',
      page: '',
      line_from: '',
      line_to: '',
      is_active: true,
      created_at: new Date().toISOString()
    })
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setShowForm(true)
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
    } catch (error: any) {
      alert(error?.message || 'فشل حذف السؤال')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateQuestion(id)
      await loadData()
    } catch (error: any) {
      alert(error?.message || 'فشل نسخ السؤال')
    }
  }

  const handleMoveToTraining = async (id: string) => {
    if (!confirm('هل تريد نشر هذا السؤال كسؤال تدريبي؟')) return
    
    try {
      await moveToTraining(id)
      await loadData()
    } catch (error: any) {
      alert(error?.message || 'فشل نقل السؤال')
    }
  }

  const handleMoveToLibrary = async (id: string) => {
    if (!confirm('هل تريد نقل هذا السؤال إلى المكتبة؟')) return
    
    try {
      await moveToLibrary(id)
      await loadData()
    } catch (error: any) {
      alert(error?.message || 'فشل نقل السؤال')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {mode === 'bank' ? 'مكتبة الأسئلة' : 'الأسئلة التدريبية'}
        </h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <QuestionForm
        question={editingQuestion}
        competitions={competitions}
        mode={mode}
        onClose={() => {
          setShowForm(false)
          setEditingQuestion(null)
          loadData()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            {mode === 'bank' ? 'مكتبة الأسئلة' : 'الأسئلة التدريبية'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {mode === 'bank' 
              ? 'أسئلة محفوظة كمسودات - لن تظهر للطلاب حتى يتم نشرها'
              : 'أسئلة منشورة للتدريب - متاحة لجميع الطلاب'
            }
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + إضافة سؤال
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">
              {mode === 'bank' ? 'مكتبة الأسئلة (مسودات)' : 'الأسئلة التدريبية'}
            </h3>
            <p className="text-sm text-blue-700">
              {mode === 'bank'
                ? 'الأسئلة المحفوظة هنا لن تُضاف تلقائياً لأي مسابقة. يمكنك نشرها كأسئلة تدريبية أو إضافتها للمسابقات لاحقاً.'
                : 'الأسئلة المنشورة هنا متاحة لجميع الطلاب للتدريب. لإضافة أسئلة لمسابقة معينة، استخدم صفحة إدارة المسابقة.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">النوع</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="mcq">اختيار من متعدد</option>
              <option value="true_false">صح/خطأ</option>
              <option value="text">نص</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">بحث</label>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder="ابحث في الأسئلة..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <Icons.question className="w-10 h-10 mb-4 block" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد أسئلة</h2>
          <p className="text-neutral-600 mb-6">ابدأ بإضافة سؤال جديد</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            إضافة سؤال
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map(question => (
            <div
              key={question.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${question.type === 'mcq' ? 'bg-blue-100 text-blue-700' : ''}
                      ${question.type === 'true_false' ? 'bg-green-100 text-green-700' : ''}
                      ${question.type === 'text' ? 'bg-purple-100 text-purple-700' : ''}
                    `}>
                      {getTypeLabel(question.type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      question.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {question.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
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

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleEdit(question)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDuplicate(question.id)}
                  className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  نسخ
                </button>
                {mode === 'bank' && (
                  <button
                    onClick={() => handleMoveToTraining(question.id)}
                    className="px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    نشر للتدريب
                  </button>
                )}
                {mode === 'training' && (
                  <button
                    onClick={() => handleMoveToLibrary(question.id)}
                    className="px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    نقل للمكتبة
                  </button>
                )}
                <button
                  onClick={() => handleDelete(question)}
                  className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Destination Modal */}
      <Modal
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        title="أين تريد حفظ السؤال؟"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700 mb-4">
            اختر وجهة السؤال الجديد:
          </p>
          
          <button
            onClick={() => handleDestinationSelected('library')}
            className="w-full p-4 border-2 border-neutral-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-right"
          >
            <div className="flex items-start gap-3">
              <Icons.book className="w-6 h-6 " />
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">حفظ في المكتبة (مسودة)</h3>
                <p className="text-sm text-neutral-600">
                  السؤال سيُحفظ كمسودة ولن يظهر للطلاب. يمكنك نشره لاحقاً.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDestinationSelected('training')}
            className="w-full p-4 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-right"
          >
            <div className="flex items-start gap-3">
              <Icons.check className="w-6 h-6 " />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">نشر كسؤال تدريبي (افتراضي)</h3>
                <p className="text-sm text-blue-700">
                  السؤال سيُنشر فوراً ويكون متاحاً لجميع الطلاب للتدريب.
                </p>
              </div>
            </div>
          </button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-yellow-800">
              ⚠️ لن يتم إضافة السؤال تلقائياً لأي مسابقة. لإضافة أسئلة لمسابقة، استخدم صفحة إدارة المسابقة.
            </p>
          </div>
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
            هل أنت متأكد من حذف هذا السؤال؟
          </p>
          {deleteModal.question && (
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-900 font-medium">
                {deleteModal.question.question_text}
              </p>
            </div>
          )}
          <p className="text-sm text-red-600">
            ⚠️ هذا الإجراء لا يمكن التراجع عنه
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

function QuestionForm({ question, competitions, mode = 'training', onClose }: { 
  question: Question | null
  competitions: Competition[]
  mode?: 'training' | 'bank'
  onClose: () => void 
}) {
  const isEditing = question && question.id !== ''
  
  // FIXED: Add localStorage persistence to prevent data loss
  const DRAFT_KEY = `draft:question:${isEditing ? question.id : 'new'}`
  
  const [formData, setFormData] = useState<QuestionFormData>(() => {
    // Try to restore from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved draft:', e)
        }
      }
    }
    
    // Otherwise use initial data
    return {
      competition_id: null, // Always null - enforced
      is_training: question?.is_training ?? true,
      status: question?.status ?? 'PUBLISHED',
      type: question?.type || 'mcq',
      question_text: question?.question_text || '',
      options: question?.options || ['', '', '', ''],
      correct_answer: question?.correct_answer || null,
      source_ref: {
        volume: question?.volume || '',
        page: question?.page || '',
        lineFrom: question?.line_from || '',
        lineTo: question?.line_to || '',
      }
    }
  })
  const [saving, setSaving] = useState(false)

  // FIXED: Auto-save draft to localStorage on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    }
  }, [formData, DRAFT_KEY])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditing) {
        await updateQuestion(question.id, formData)
      } else {
        await createQuestion(formData)
      }
      
      // FIXED: Clear draft from localStorage after successful save
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY)
      }
      
      onClose()
    } catch (error: any) {
      alert(error?.message || 'فشل حفظ السؤال')
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), '']
    })
  }

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])]
    newOptions.splice(index, 1)
    setFormData({ ...formData, options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">
          {isEditing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        </h1>
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 space-y-6">
        {/* Info Banner */}
        <div className={`border rounded-lg p-4 ${
          formData.is_training 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{formData.is_training ? '✅' : '📚'}</span>
            <div>
              <h3 className={`font-bold mb-1 ${
                formData.is_training ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {formData.is_training ? 'سؤال تدريبي' : 'مسودة في المكتبة'}
              </h3>
              <p className={`text-sm ${
                formData.is_training ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {formData.is_training
                  ? 'هذا السؤال سيكون متاحاً لجميع الطلاب للتدريب. لن يُضاف تلقائياً لأي مسابقة.'
                  : 'هذا السؤال محفوظ كمسودة ولن يظهر للطلاب حتى يتم نشره.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            نوع السؤال *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'mcq', options: ['', '', '', ''] })}
              className={`p-4 border-2 rounded-lg transition-colors ${
                formData.type === 'mcq'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <div className="mb-2"><Icons.file className="w-6 h-6" /></div>
              <div className="font-medium">اختيار من متعدد</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'true_false', options: null })}
              className={`p-4 border-2 rounded-lg transition-colors ${
                formData.type === 'true_false'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <div className="text-2xl mb-2">✓✗</div>
              <div className="font-medium">صح/خطأ</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'text', options: null })}
              className={`p-4 border-2 rounded-lg transition-colors ${
                formData.type === 'text'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <div className="mb-2"><Icons.message className="w-6 h-6" /></div>
              <div className="font-medium">نص</div>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            نص السؤال *
          </label>
          <textarea
            required
            value={formData.question_text}
            onChange={e => setFormData({ ...formData, question_text: e.target.value })}
            rows={4}
            placeholder="مثال: ما معنى كلمة 'المها' في الموسوعة العمانية؟"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* MCQ Options */}
        {formData.type === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              الخيارات *
            </label>
            <div className="space-y-3">
              {(formData.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={option}
                    onChange={e => updateOption(index, e.target.value)}
                    placeholder={`الخيار ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {(formData.options?.length || 0) > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                + إضافة خيار
              </button>
            </div>
          </div>
        )}

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            الإجابة الصحيحة
          </label>
          {formData.type === 'mcq' && (
            <select
              value={formData.correct_answer || ''}
              onChange={e => setFormData({ ...formData, correct_answer: e.target.value || null })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">تحديد لاحقاً</option>
              {(formData.options || []).filter(o => o.trim()).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          )}
          {formData.type === 'true_false' && (
            <select
              value={formData.correct_answer || ''}
              onChange={e => setFormData({ ...formData, correct_answer: e.target.value || null })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">تحديد لاحقاً</option>
              <option value="true">صح</option>
              <option value="false">خطأ</option>
            </select>
          )}
          {formData.type === 'text' && (
            <input
              type="text"
              value={formData.correct_answer || ''}
              onChange={e => setFormData({ ...formData, correct_answer: e.target.value || null })}
              placeholder="الإجابة النموذجية أو الكلمات المفتاحية"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
          <p className="text-xs text-neutral-600 mt-1">يمكن تحديد الإجابة الصحيحة لاحقاً</p>
        </div>

        {/* Source Reference */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">الدليل من المصدر *</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                المجلد *
              </label>
              <input
                type="text"
                required
                value={formData.source_ref.volume}
                onChange={e => setFormData({ 
                  ...formData, 
                  source_ref: { ...formData.source_ref, volume: e.target.value }
                })}
                placeholder="1"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                الصفحة *
              </label>
              <input
                type="text"
                required
                value={formData.source_ref.page}
                onChange={e => setFormData({ 
                  ...formData, 
                  source_ref: { ...formData.source_ref, page: e.target.value }
                })}
                placeholder="42"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                السطر من *
              </label>
              <input
                type="text"
                required
                value={formData.source_ref.lineFrom}
                onChange={e => setFormData({ 
                  ...formData, 
                  source_ref: { ...formData.source_ref, lineFrom: e.target.value }
                })}
                placeholder="5"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                السطر إلى *
              </label>
              <input
                type="text"
                required
                value={formData.source_ref.lineTo}
                onChange={e => setFormData({ 
                  ...formData, 
                  source_ref: { ...formData.source_ref, lineTo: e.target.value }
                })}
                placeholder="8"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-neutral-600 mt-2">
            هذه الحقول إلزامية لمنع استخدام الذكاء الاصطناعي
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mcq: 'اختيار من متعدد',
    true_false: 'صح/خطأ',
    text: 'نص',
  }
  return labels[type] || type
}
