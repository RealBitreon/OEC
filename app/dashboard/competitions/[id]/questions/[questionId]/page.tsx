'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Question, Competition } from '@/app/dashboard/core/types'
import { getQuestions, updateQuestion, type QuestionFormData } from '@/app/dashboard/actions/questions'
import { getCompetitions } from '@/app/dashboard/actions/competitions'
import { Icons } from '@/components/icons'

export default function EditQuestionPage({ params }: { params: Promise<{ id: string; questionId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [competitionId, setCompetitionId] = useState<string>('')
  const [questionId, setQuestionId] = useState<string>('')
  const [question, setQuestion] = useState<Question | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<QuestionFormData>({
    competition_id: null,
    is_training: false,
    type: 'mcq',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: null,
    status: 'DRAFT',
    source_ref: {
      volume: '',
      page: '',
      lineFrom: '',
      lineTo: '',
    }
  })

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setCompetitionId(resolvedParams.id)
      setQuestionId(resolvedParams.questionId)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (questionId) {
      loadData()
    }
  }, [questionId])

  const loadData = async () => {
    try {
      const [questionsResult, competitionsData] = await Promise.all([
        getQuestions({}),
        getCompetitions()
      ])
      
      const foundQuestion = questionsResult.questions.find(q => q.id === questionId)
      
      if (foundQuestion) {
        setQuestion(foundQuestion)
        setFormData({
          competition_id: foundQuestion.competition_id || null,
          is_training: foundQuestion.is_training ?? false,
          type: foundQuestion.type || 'mcq',
          question_text: foundQuestion.question_text || '',
          options: foundQuestion.options || ['', '', '', ''],
          correct_answer: foundQuestion.correct_answer || null,
          status: foundQuestion.status || 'DRAFT',
          source_ref: {
            volume: foundQuestion.volume || '',
            page: foundQuestion.page || '',
            lineFrom: foundQuestion.line_from || '',
            lineTo: foundQuestion.line_to || '',
          }
        })
      }
      
      setCompetitions(competitionsData)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question) return
    
    setSaving(true)
    try {
      await updateQuestion(question.id, formData)
      router.push(`/dashboard/competitions/${competitionId}/questions`)
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

  if (loading || !competitionId) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Icons.cross className="w-10 h-10 mb-4 block" />
          <h2 className="text-xl font-bold text-red-900 mb-2">السؤال غير موجود</h2>
          <button
            onClick={() => router.push(`/dashboard/competitions/${competitionId}/questions`)}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            العودة إلى الأسئلة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(`/dashboard/competitions/${competitionId}/questions`)}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <span>→</span>
        <span>العودة إلى أسئلة المسابقة</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">تعديل السؤال</h1>
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

        {/* Note about Evidence */}
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">ملاحظة عن الدليل</h3>
                <p className="text-sm text-blue-700">
                  سيُطلب من الطلاب تقديم الدليل من المصدر (المجلد، الصفحة، السطر) عند الإجابة على هذا السؤال.
                  ستقوم أنت بمراجعة إجاباتهم وتصحيحها يدوياً من خلال صفحة مراجعة الإجابات.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/competitions/${competitionId}/questions`)}
            className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
