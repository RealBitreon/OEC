'use client'

import { useEffect, useState } from 'react'
import { User, Question, Competition } from '../../core/types'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, duplicateQuestion, moveToTraining, type QuestionFormData } from '../../actions/questions'
import { getCompetitions } from '../../actions/competitions'

interface QuestionsManagementProps {
  profile: User
}

export default function QuestionsManagement({ profile }: QuestionsManagementProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [filters, setFilters] = useState<{
    competition_id: string
    type: string
    is_training: string
    search: string
  }>({
    competition_id: '',
    type: '',
    is_training: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      // Convert string is_training to boolean for API
      const apiFilters = {
        ...filters,
        is_training: filters.is_training === 'true' ? true : filters.is_training === 'false' ? false : undefined
      }
      
      const [questionsData, competitionsData] = await Promise.all([
        getQuestions(apiFilters),
        getCompetitions()
      ])
      setQuestions(questionsData.questions)
      setCompetitions(competitionsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingQuestion(null)
    setShowForm(true)
  }

  const handleUseTemplate = (template: Partial<Question>) => {
    // Pass template without id so it creates new question
    const { id, created_at, updated_at, ...templateData } = template as any
    setEditingQuestion(templateData as Question)
    setShowTemplates(false)
    setShowForm(true)
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا السؤال؟')) return
    
    try {
      await deleteQuestion(id)
      await loadData()
    } catch (error: any) {
      alert(error?.message || 'فشل حذف السؤال')
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
    if (!confirm('هل تريد نقل هذا السؤال إلى التدريب؟')) return
    
    try {
      await moveToTraining(id)
      await loadData()
    } catch (error: any) {
      alert(error?.message || 'فشل نقل السؤال')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة الأسئلة</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (showTemplates) {
    return (
      <QuestionTemplates
        competitions={competitions}
        onUseTemplate={handleUseTemplate}
        onClose={() => setShowTemplates(false)}
      />
    )
  }

  if (showForm) {
    return (
      <QuestionForm
        question={editingQuestion}
        competitions={competitions}
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
        <h1 className="text-3xl font-bold text-neutral-900">إدارة الأسئلة</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ⚡ أسئلة جاهزة
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + إضافة سؤال
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">المسابقة</label>
            <select
              value={filters.competition_id}
              onChange={e => setFilters({ ...filters, competition_id: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {competitions.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.title}</option>
              ))}
            </select>
          </div>

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
            <label className="block text-sm font-medium text-neutral-700 mb-2">التصنيف</label>
            <select
              value={filters.is_training}
              onChange={e => setFilters({ ...filters, is_training: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              <option value="false">مسابقة</option>
              <option value="true">تدريب</option>
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
          <span className="text-4xl mb-4 block">❓</span>
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
                    {question.is_training && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        تدريب
                      </span>
                    )}
                    {!question.correct_answer && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        بدون إجابة صحيحة
                      </span>
                    )}
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
                {!question.is_training && (
                  <button
                    onClick={() => handleMoveToTraining(question.id)}
                    className="px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    نقل للتدريب
                  </button>
                )}
                <button
                  onClick={() => handleDelete(question.id)}
                  className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionForm({ question, competitions, onClose }: { 
  question: Question | null
  competitions: Competition[]
  onClose: () => void 
}) {
  const [formData, setFormData] = useState<QuestionFormData>({
    competition_id: question?.competition_id || null,
    is_training: question?.is_training || false,
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
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Only update if question has an id property (not from template)
      if (question && question.id) {
        await updateQuestion(question.id, formData)
      } else {
        await createQuestion(formData)
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
          {question ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        </h1>
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 space-y-6">
        {/* Competition & Training */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              المسابقة
            </label>
            <select
              value={formData.competition_id || ''}
              onChange={e => {
                const value = e.target.value
                setFormData({ 
                  ...formData, 
                  competition_id: value && value !== 'undefined' ? value : null 
                })
              }}
              disabled={formData.is_training}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100"
            >
              <option value="">اختر مسابقة</option>
              {competitions.filter(c => c.status !== 'archived').map(comp => (
                <option key={comp.id} value={comp.id}>{comp.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_training}
                onChange={e => setFormData({ 
                  ...formData, 
                  is_training: e.target.checked,
                  competition_id: e.target.checked ? null : formData.competition_id
                })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-neutral-900">سؤال تدريبي</span>
            </label>
            <p className="text-xs text-neutral-600 mt-1">الأسئلة التدريبية لا تنتمي لمسابقة محددة</p>
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
              <div className="text-2xl mb-2">📝</div>
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
              <div className="text-2xl mb-2">💬</div>
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

function QuestionTemplates({ competitions, onUseTemplate, onClose }: {
  competitions: Competition[]
  onUseTemplate: (template: Partial<Question>) => void
  onClose: () => void
}) {
  const templates = [
    {
      id: 'geography-mcq',
      category: 'جغرافيا',
      icon: '🗺️',
      type: 'mcq' as const,
      question_text: 'ما هي عاصمة سلطنة عمان؟',
      options: ['مسقط', 'صلالة', 'نزوى', 'صحار'],
      correct_answer: 'مسقط',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'history-mcq',
      category: 'تاريخ',
      icon: '📜',
      type: 'mcq' as const,
      question_text: 'في أي عام تم توحيد عمان الحديثة؟',
      options: ['1970', '1971', '1980', '1990'],
      correct_answer: '1970',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'culture-mcq',
      category: 'ثقافة',
      icon: '🎭',
      type: 'mcq' as const,
      question_text: 'ما هو الزي التقليدي للرجال في عمان؟',
      options: ['الدشداشة', 'الثوب', 'الجلابية', 'القفطان'],
      correct_answer: 'الدشداشة',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'nature-mcq',
      category: 'طبيعة',
      icon: '🌴',
      type: 'mcq' as const,
      question_text: 'ما هو الحيوان الوطني لسلطنة عمان؟',
      options: ['المها العربي', 'الصقر', 'الجمل', 'الغزال'],
      correct_answer: 'المها العربي',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'economy-mcq',
      category: 'اقتصاد',
      icon: '💰',
      type: 'mcq' as const,
      question_text: 'ما هي العملة الرسمية لسلطنة عمان؟',
      options: ['الريال العماني', 'الدرهم', 'الدينار', 'الريال السعودي'],
      correct_answer: 'الريال العماني',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'landmarks-mcq',
      category: 'معالم',
      icon: '🕌',
      type: 'mcq' as const,
      question_text: 'ما هو أكبر مسجد في سلطنة عمان؟',
      options: ['جامع السلطان قابوس الأكبر', 'جامع الزواوي', 'جامع الروضة', 'جامع السلطان'],
      correct_answer: 'جامع السلطان قابوس الأكبر',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'true-false-1',
      category: 'صح/خطأ',
      icon: '✓✗',
      type: 'true_false' as const,
      question_text: 'تقع سلطنة عمان في جنوب شرق شبه الجزيرة العربية',
      correct_answer: 'true',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'true-false-2',
      category: 'صح/خطأ',
      icon: '✓✗',
      type: 'true_false' as const,
      question_text: 'صلالة هي عاصمة سلطنة عمان',
      correct_answer: 'false',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'text-1',
      category: 'نص',
      icon: '💬',
      type: 'text' as const,
      question_text: 'اذكر ثلاثة من محافظات سلطنة عمان',
      correct_answer: 'مسقط، ظفار، الباطنة',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    },
    {
      id: 'text-2',
      category: 'نص',
      icon: '💬',
      type: 'text' as const,
      question_text: 'ما معنى كلمة "المها" في اللغة العربية؟',
      correct_answer: 'نوع من الظباء البيضاء',
      volume: '1',
      page: '1',
      line_from: '1',
      line_to: '1'
    }
  ]

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const categories = ['all', 'جغرافيا', 'تاريخ', 'ثقافة', 'طبيعة', 'اقتصاد', 'معالم', 'صح/خطأ', 'نص']

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">⚡ أسئلة جاهزة</h1>
          <p className="text-neutral-600 mt-1">اختر قالب سؤال جاهز وعدّله حسب احتياجك</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{template.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${template.type === 'mcq' ? 'bg-blue-100 text-blue-700' : ''}
                    ${template.type === 'true_false' ? 'bg-green-100 text-green-700' : ''}
                    ${template.type === 'text' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {getTypeLabel(template.type)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                    {template.category}
                  </span>
                </div>
                <p className="text-neutral-900 font-medium mb-3">{template.question_text}</p>
                
                {template.type === 'mcq' && template.options && (
                  <div className="space-y-1 mb-3">
                    {template.options.map((opt, idx) => (
                      <div 
                        key={idx}
                        className={`text-sm px-3 py-1 rounded ${
                          opt === template.correct_answer 
                            ? 'bg-green-50 text-green-700 font-medium' 
                            : 'text-neutral-600'
                        }`}
                      >
                        {opt} {opt === template.correct_answer && '✓'}
                      </div>
                    ))}
                  </div>
                )}
                
                {template.type === 'true_false' && (
                  <div className="text-sm text-neutral-600 mb-3">
                    الإجابة: <span className="font-medium text-green-700">
                      {template.correct_answer === 'true' ? 'صح ✓' : 'خطأ ✗'}
                    </span>
                  </div>
                )}
                
                {template.type === 'text' && (
                  <div className="text-sm text-neutral-600 mb-3">
                    إجابة نموذجية: <span className="font-medium">{template.correct_answer}</span>
                  </div>
                )}
                
                <button
                  onClick={() => onUseTemplate({
                    type: template.type,
                    question_text: template.question_text,
                    options: template.options,
                    correct_answer: template.correct_answer,
                    volume: template.volume,
                    page: template.page,
                    line_from: template.line_from,
                    line_to: template.line_to,
                    is_training: false
                  } as any)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  استخدام هذا القالب
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد قوالب</h2>
          <p className="text-neutral-600">جرب فئة أخرى</p>
        </div>
      )}
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
