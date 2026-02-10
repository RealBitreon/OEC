'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  grade?: string
  answers: Record<string, string>
  proofs?: Record<string, string>
  score: number
  total_questions: number
  submitted_at: string
  is_winner?: boolean | null
  competition?: {
    id: string
    title: string
    rules?: {
      require_all_correct?: boolean  // If true, all answers must be correct (no per-question marking)
    }
  }
}

interface Question {
  id: string
  question_text: string
  correct_answer: string
  type?: string
  options?: string[]
  volume?: string
  page?: string
  line_from?: string
  line_to?: string
}

interface QuestionReview {
  isCorrect: boolean
  notes?: string
}

interface Props {
  submission: Submission
  questions: Question[]
  onComplete: () => void
  onUnsavedChanges: (hasChanges: boolean) => void
}

export function CurrentSubmissionTab({ submission, questions, onComplete, onUnsavedChanges }: Props) {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Record<string, QuestionReview>>({})
  const [finalDecision, setFinalDecision] = useState<'accepted' | 'rejected' | null>(null)
  const [saving, setSaving] = useState(false)

  // Check if competition requires all answers to be correct
  const requireAllCorrect = submission.competition?.rules?.require_all_correct === true

  // Initialize reviews from submission answers
  useEffect(() => {
    const initialReviews: Record<string, QuestionReview> = {}
    questions.forEach(q => {
      const studentAnswer = submission.answers[q.id]
      initialReviews[q.id] = {
        isCorrect: studentAnswer === q.correct_answer,
        notes: ''
      }
    })
    setReviews(initialReviews)
  }, [submission, questions])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = Object.keys(reviews).length > 0 || finalDecision !== null
    onUnsavedChanges(hasChanges && !saving)
  }, [reviews, finalDecision, saving, onUnsavedChanges])

  const handleMarkQuestion = (questionId: string, isCorrect: boolean) => {
    setReviews(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], isCorrect }
    }))
  }

  const handleSave = async () => {
    if (!finalDecision) {
      showToast('يجب اختيار قرار نهائي (فائز أو خاسر)', 'error')
      return
    }

    if (!confirm(`هل أنت متأكد من تحديد الطالب كـ ${finalDecision === 'accepted' ? 'فائز' : 'خاسر'}؟`)) {
      return
    }

    setSaving(true)
    try {
      // Save review
      const response = await fetch(`/api/submissions/${submission.id}/review-final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corrections: reviews,
          finalDecision
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل حفظ التصحيح')
      }

      // Mark as winner/loser
      const markResponse = await fetch('/api/submissions/mark-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          isWinner: finalDecision === 'accepted'
        })
      })

      if (!markResponse.ok) {
        const error = await markResponse.json()
        throw new Error(error.error || 'فشل تحديث الحالة')
      }

      showToast(
        finalDecision === 'accepted' ? 'تم تحديد الطالب كفائز 🎉' : 'تم تحديد الطالب كخاسر',
        'success'
      )
      onComplete()
    } catch (error: any) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const correctCount = Object.values(reviews).filter(r => r.isCorrect).length
  const wrongCount = Object.values(reviews).filter(r => !r.isCorrect).length
  const pendingCount = questions.length - Object.keys(reviews).length

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-neutral-900">معلومات المشارك</h3>
          {submission.is_winner === true && <Badge variant="success">🏆 فائز</Badge>}
          {submission.is_winner === false && <Badge variant="danger">خاسر</Badge>}
          {submission.is_winner === null && <Badge variant="info">قيد المراجعة</Badge>}
        </div>
        <div className="space-y-2 text-neutral-700">
          <div><span className="font-medium">الاسم:</span> {submission.participant_name}</div>
          {submission.participant_email && (
            <div><span className="font-medium">البريد:</span> {submission.participant_email}</div>
          )}
          {submission.grade && (
            <div><span className="font-medium">الصف:</span> {submission.grade}</div>
          )}
          <div><span className="font-medium">تاريخ التقديم:</span> {formatDate(submission.submitted_at)}</div>
          {submission.competition && (
            <div><span className="font-medium">المسابقة:</span> {submission.competition.title}</div>
          )}
        </div>
      </div>

      {/* Review Progress - Only show if per-question correction is enabled */}
      {!requireAllCorrect && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-bold text-sm text-blue-900 mb-3">تقدم المراجعة</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{correctCount}</div>
              <div className="text-xs text-neutral-600">صحيحة</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{wrongCount}</div>
              <div className="text-xs text-neutral-600">خاطئة</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-neutral-700">{pendingCount}</div>
              <div className="text-xs text-neutral-600">معلقة</div>
            </div>
          </div>
        </div>
      )}

      {/* Info for "all correct" mode */}
      {requireAllCorrect && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h4 className="font-bold text-sm text-amber-900 mb-2">📋 وضع "جميع الإجابات صحيحة"</h4>
          <p className="text-sm text-amber-800">
            هذه المسابقة تتطلب أن تكون جميع الإجابات صحيحة للفوز. راجع جميع الإجابات ثم حدد القرار النهائي (فائز/خاسر).
          </p>
        </div>
      )}

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-neutral-900">مراجعة الإجابات</h3>
        {questions.map((question, index) => {
          const studentAnswer = submission.answers[question.id]
          const studentProof = submission.proofs?.[question.id]
          const review = reviews[question.id]
          const missingAnswer = !studentAnswer || studentAnswer.trim() === ''
          const missingProof = !studentProof || studentProof.trim() === ''

          return (
            <div key={question.id} className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 mb-3">{question.question_text}</p>

                  {/* Warnings */}
                  {(missingAnswer || missingProof) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="text-sm font-bold text-red-900 mb-1">⚠️ بيانات ناقصة</div>
                      <div className="text-sm text-red-700">
                        {missingAnswer && missingProof && 'الإجابة والدليل غير موجودين'}
                        {missingAnswer && !missingProof && 'الإجابة غير موجودة'}
                        {!missingAnswer && missingProof && 'الدليل غير موجود'}
                      </div>
                    </div>
                  )}

                  {/* Student Proof */}
                  {studentProof && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <div className="text-sm font-bold text-amber-900 mb-2">📖 دليل الطالب:</div>
                      <div className="text-base text-amber-800 font-semibold">{studentProof}</div>
                    </div>
                  )}

                  {/* Question Source */}
                  {(question.volume || question.page || (question.line_from && question.line_to)) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="text-xs font-bold text-blue-700 mb-1">📍 الموقع في المصدر:</div>
                      <div className="text-sm text-blue-700 flex flex-wrap items-center gap-3">
                        {question.volume && <span>📚 المجلد: {question.volume}</span>}
                        {question.page && <span>📄 الصفحة: {question.page}</span>}
                        {question.line_from && question.line_to && (
                          <span>📝 السطور: {question.line_from}-{question.line_to}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Answers Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-bold text-green-700 mb-2">✓ الإجابة الصحيحة</div>
                      <div className="text-base text-green-900 font-semibold">
                        {question.correct_answer || 'غير محددة'}
                      </div>
                    </div>
                    <div className={`border rounded-lg p-4 ${
                      missingAnswer ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`text-sm font-bold mb-2 ${
                        missingAnswer ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        📝 إجابة الطالب
                      </div>
                      <div className={`text-base font-semibold ${
                        missingAnswer ? 'text-red-900' : 'text-blue-900'
                      }`}>
                        {studentAnswer || 'لم يجب'}
                      </div>
                    </div>
                  </div>

                  {/* Review Decision - Only show if competition doesn't require all correct */}
                  {!requireAllCorrect && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkQuestion(question.id, true)}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 font-bold transition-all ${
                          review?.isCorrect
                            ? 'border-green-500 bg-green-100 text-green-900'
                            : 'border-neutral-300 text-neutral-600 hover:border-green-300'
                        }`}
                      >
                        ✓ صحيحة
                      </button>
                      <button
                        onClick={() => handleMarkQuestion(question.id, false)}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 font-bold transition-all ${
                          review && !review.isCorrect
                            ? 'border-red-500 bg-red-100 text-red-900'
                            : 'border-neutral-300 text-neutral-600 hover:border-red-300'
                        }`}
                      >
                        ✗ خاطئة
                      </button>
                    </div>
                  )}

                  {/* Info message when all answers must be correct */}
                  {requireAllCorrect && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        ℹ️ هذه المسابقة تتطلب جميع الإجابات صحيحة. سيتم تحديد الفائز/الخاسر بناءً على جميع الإجابات.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Final Decision */}
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">القرار النهائي</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setFinalDecision('accepted')}
            className={`p-6 rounded-lg border-2 transition-all ${
              finalDecision === 'accepted'
                ? 'border-green-500 bg-green-50'
                : 'border-neutral-300 hover:border-green-300'
            }`}
          >
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-bold text-lg text-neutral-900">فائز</div>
            <div className="text-sm text-neutral-600 mt-1">مؤهل للسحب</div>
          </button>

          <button
            onClick={() => setFinalDecision('rejected')}
            className={`p-6 rounded-lg border-2 transition-all ${
              finalDecision === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-neutral-300 hover:border-red-300'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="font-bold text-lg text-neutral-900">خاسر</div>
            <div className="text-sm text-neutral-600 mt-1">غير مؤهل</div>
          </button>
        </div>

        <Button
          onClick={handleSave}
          disabled={!finalDecision || saving}
          variant="primary"
          className="w-full py-3 text-lg font-bold"
        >
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ القرار النهائي'}
        </Button>
      </div>
    </div>
  )
}
