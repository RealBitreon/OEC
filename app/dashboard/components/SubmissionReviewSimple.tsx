'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  first_name?: string
  father_name?: string
  family_name?: string
  grade?: string
  answers: Record<string, string>
  proofs?: Record<string, string>
  submitted_at: string
  competition?: {
    id: string
    title: string
  }
}

interface Props {
  submission: Submission
  questions?: any[]
  onComplete: () => void
}

export function SubmissionReviewSimple({ submission, questions, onComplete }: Props) {
  const { showToast } = useToast()
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null)
  const [saving, setSaving] = useState(false)
  
  const handleFinalize = async () => {
    if (!decision) {
      showToast('يجب اختيار قرار (قبول أو رفض)', 'error')
      return
    }
    
    if (!confirm(`هل أنت متأكد من ${decision === 'accepted' ? 'قبول' : 'رفض'} هذه الإجابة؟`)) {
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}/review-final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corrections: {}, // No per-question in simple mode
          finalDecision: decision
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'فشل حفظ القرار')
      }
      
      showToast(decision === 'accepted' ? 'تم قبول الإجابة ✓' : 'تم رفض الإجابة', 'success')
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
  
  return (
    <div className="space-y-6">
      {/* Submission Details */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">معلومات المشارك</h3>
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
      
      {/* Answers Display (Read-only) */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">الإجابات</h3>
        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => {
              const studentAnswer = submission.answers[question.id]
              const studentProof = submission.proofs?.[question.id]
              
              return (
                <div key={question.id} className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 mb-3">{question.question_text}</p>
                      
                      {studentProof && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                          <div className="text-xs font-bold text-amber-900 mb-1">📖 دليل الطالب:</div>
                          <div className="text-sm text-amber-800">{studentProof}</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="text-xs font-bold text-green-700 mb-1">✓ الإجابة الصحيحة</div>
                          <div className="text-sm font-semibold text-green-900">{question.correct_answer}</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="text-xs font-bold text-blue-700 mb-1">📝 إجابة الطالب</div>
                          <div className="text-sm font-semibold text-blue-900">{studentAnswer || 'لم يجب'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-neutral-600 py-4">
            لا توجد أسئلة لعرضها
          </div>
        )}
      </div>
      
      {/* Decision Buttons */}
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">القرار النهائي</h3>
        <p className="text-sm text-neutral-600 mb-4">
          في الوضع البسيط، يتم قبول أو رفض الإجابة بالكامل. المقبولون سيدخلون السحب.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDecision('accepted')}
            className={`p-6 rounded-lg border-2 transition-all ${
              decision === 'accepted'
                ? 'border-green-500 bg-green-50'
                : 'border-neutral-300 hover:border-green-300'
            }`}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className="font-bold text-lg text-neutral-900">قبول</div>
            <div className="text-sm text-neutral-600 mt-1">مؤهل للسحب</div>
          </button>
          
          <button
            onClick={() => setDecision('rejected')}
            className={`p-6 rounded-lg border-2 transition-all ${
              decision === 'rejected'
                ? 'border-red-500 bg-red-50'
                : 'border-neutral-300 hover:border-red-300'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="font-bold text-lg text-neutral-900">رفض</div>
            <div className="text-sm text-neutral-600 mt-1">غير مؤهل</div>
          </button>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleFinalize}
          disabled={!decision || saving}
          variant="primary"
          className="flex-1 py-3 text-lg font-bold"
        >
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ القرار'}
        </Button>
      </div>
    </div>
  )
}
