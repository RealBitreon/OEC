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
  const [corrections, setCorrections] = useState<Record<string, { isCorrect: boolean; notes?: string }>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  
  const toggleCorrection = (questionId: string, isCorrect: boolean) => {
    setCorrections(prev => ({
      ...prev,
      [questionId]: {
        isCorrect,
        notes: notes[questionId] || ''
      }
    }))
  }
  
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
          corrections: corrections,
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
      
      {/* Answers Display with Interactive Correction */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">الإجابات - مراجعة تفصيلية</h3>
        <p className="text-sm text-neutral-600 mb-4">
          قم بمراجعة كل إجابة وحدد ما إذا كانت صحيحة أم خاطئة. يمكنك إضافة ملاحظات لكل سؤال.
        </p>
        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => {
              const studentAnswer = submission.answers[question.id]
              const studentProof = submission.proofs?.[question.id]
              const correction = corrections[question.id]
              const isMarkedCorrect = correction?.isCorrect === true
              const isMarkedIncorrect = correction?.isCorrect === false
              
              return (
                <div 
                  key={question.id} 
                  className={`rounded-lg p-4 border-2 transition-all ${
                    isMarkedCorrect 
                      ? 'bg-green-50 border-green-300' 
                      : isMarkedIncorrect 
                      ? 'bg-red-50 border-red-300'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isMarkedCorrect 
                        ? 'bg-green-500 text-white' 
                        : isMarkedIncorrect 
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isMarkedCorrect ? '✓' : isMarkedIncorrect ? '✗' : index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 mb-3">{question.question_text}</p>
                      
                      {studentProof && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                          <div className="text-xs font-bold text-amber-900 mb-1">📖 دليل الطالب:</div>
                          <div className="text-sm text-amber-800 whitespace-pre-wrap">{studentProof}</div>
                        </div>
                      )}
                      
                      {/* Side-by-side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">✓</span>
                            <div className="text-xs font-bold text-green-700">الإجابة الصحيحة</div>
                          </div>
                          <div className="text-base font-bold text-green-900 bg-white rounded p-2 border border-green-200">
                            {question.correct_answer}
                          </div>
                        </div>
                        <div className={`border-2 rounded-lg p-4 ${
                          isMarkedCorrect 
                            ? 'bg-green-100 border-green-400' 
                            : isMarkedIncorrect 
                            ? 'bg-red-100 border-red-400'
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📝</span>
                            <div className={`text-xs font-bold ${
                              isMarkedCorrect 
                                ? 'text-green-700' 
                                : isMarkedIncorrect 
                                ? 'text-red-700'
                                : 'text-blue-700'
                            }`}>
                              إجابة الطالب
                            </div>
                          </div>
                          <div className={`text-base font-bold rounded p-2 border ${
                            isMarkedCorrect 
                              ? 'bg-white text-green-900 border-green-300' 
                              : isMarkedIncorrect 
                              ? 'bg-white text-red-900 border-red-300'
                              : 'bg-white text-blue-900 border-blue-200'
                          }`}>
                            {studentAnswer || 'لم يجب'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Correction buttons */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => toggleCorrection(question.id, true)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                            isMarkedCorrect
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {isMarkedCorrect ? '✓ صحيحة' : 'تحديد كصحيحة'}
                        </button>
                        <button
                          onClick={() => toggleCorrection(question.id, false)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                            isMarkedIncorrect
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-white border-2 border-red-300 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {isMarkedIncorrect ? '✗ خاطئة' : 'تحديد كخاطئة'}
                        </button>
                      </div>
                      
                      {/* Notes input */}
                      {correction && (
                        <div className="mt-3">
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            ملاحظات (اختياري):
                          </label>
                          <textarea
                            value={notes[question.id] || ''}
                            onChange={(e) => {
                              const newNotes = { ...notes, [question.id]: e.target.value }
                              setNotes(newNotes)
                              setCorrections(prev => ({
                                ...prev,
                                [question.id]: {
                                  ...prev[question.id],
                                  notes: e.target.value
                                }
                              }))
                            }}
                            placeholder="أضف ملاحظات للطالب..."
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                      )}
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
      
      {/* Decision Buttons with Summary */}
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4 text-neutral-900">القرار النهائي</h3>
        
        {/* Correction Summary */}
        {Object.keys(corrections).length > 0 && (
          <div className="mb-4 p-4 bg-white rounded-lg border border-neutral-200">
            <div className="text-sm font-bold text-neutral-700 mb-2">ملخص المراجعة:</div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {Object.values(corrections).filter(c => c.isCorrect).length}
                </span>
                <span className="text-neutral-700">إجابات صحيحة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {Object.values(corrections).filter(c => !c.isCorrect).length}
                </span>
                <span className="text-neutral-700">إجابات خاطئة</span>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-neutral-600 mb-4">
          اختر القرار النهائي للإجابة. المقبولون سيدخلون السحب.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDecision('accepted')}
            className={`p-6 rounded-lg border-2 transition-all ${
              decision === 'accepted'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-neutral-300 hover:border-green-300 hover:bg-green-50/50'
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
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-neutral-300 hover:border-red-300 hover:bg-red-50/50'
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
