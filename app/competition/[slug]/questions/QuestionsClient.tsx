'use client'

import { useState } from 'react'

interface Question {
  id: string
  competitionId: string
  title: string
  body: string
  type: 'text' | 'true_false' | 'mcq'
  correctAnswer?: string
  options?: string[]
  isActive: boolean
  sourceRef?: {
    volume: string
    page: string
    lineFrom: number
    lineTo: number
  }
}

interface Submission {
  id: string
  questionId: string
  studentUsername: string
  answer: string
  documentation: {
    part: string
    page: string
    lineFrom: string
    lineTo: string
    firstWord: string
    lastWord: string
  }
  autoResult: 'correct' | 'incorrect' | 'pending'
}

export default function QuestionsClient({
  questions,
  existingSubmissions,
  studentUsername,
  competitionId
}: {
  questions: Question[]
  existingSubmissions: Submission[]
  studentUsername: string
  competitionId: string
}) {
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    Object.fromEntries(existingSubmissions.map(s => [s.questionId, s]))
  )
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({})
  const [currentDocs, setCurrentDocs] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  const handleSubmit = async (question: Question) => {
    const answer = currentAnswers[question.id]
    const doc = currentDocs[question.id] || {}

    if (!answer) {
      alert('يرجى إدخال الإجابة')
      return
    }

    if (!doc.part || !doc.page) {
      alert('يرجى إدخال التوثيق كاملاً (الجزء والصفحة على الأقل)')
      return
    }

    setSubmitting({ ...submitting, [question.id]: true })

    try {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          competitionId,
          answer,
          documentation: {
            part: doc.part || '',
            page: doc.page || '',
            lineFrom: doc.lineFrom || '',
            lineTo: doc.lineTo || '',
            firstWord: doc.firstWord || '',
            lastWord: doc.lastWord || ''
          }
        })
      })

      if (response.ok) {
        const newSubmission = await response.json()
        setSubmissions({ ...submissions, [question.id]: newSubmission })
        setCurrentAnswers({ ...currentAnswers, [question.id]: '' })
        setCurrentDocs({ ...currentDocs, [question.id]: {} })
      } else {
        alert('حدث خطأ أثناء حفظ الإجابة')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('حدث خطأ أثناء حفظ الإجابة')
    } finally {
      setSubmitting({ ...submitting, [question.id]: false })
    }
  }

  const answeredCount = Object.keys(submissions).length
  const totalCount = questions.length

  const getResultBadge = (result: string) => {
    const badges = {
      correct: { text: 'صحيحة', color: 'bg-green-100 text-green-800' },
      incorrect: { text: 'خاطئة', color: 'bg-red-100 text-red-800' },
      pending: { text: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' }
    }
    return badges[result as keyof typeof badges] || badges.pending
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-lg">لا توجد أسئلة متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-8">
        <p className="text-blue-900 font-semibold text-center">
          أجبت على {answeredCount} من {totalCount} أسئلة
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => {
          const submission = submissions[question.id]
          const isAnswered = !!submission
          const isSubmittingThis = submitting[question.id]

          return (
            <div
              key={question.id}
              className={`bg-white rounded-lg shadow-lg p-6 ${
                isAnswered ? 'opacity-75 border-2 border-green-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  السؤال {index + 1}: {question.title}
                </h3>
                {isAnswered && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      getResultBadge(submission.autoResult).color
                    }`}
                  >
                    {getResultBadge(submission.autoResult).text}
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{question.body}</p>

              {/* Official Source Reference */}
              {question.sourceRef && (question.sourceRef.volume || question.sourceRef.page) && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                  <h5 className="font-bold text-amber-900 text-sm mb-1">📖 المرجع الرسمي للموسوعة:</h5>
                  <p className="text-amber-800 text-sm">
                    {question.sourceRef.volume && `المجلد: ${question.sourceRef.volume}`}
                    {question.sourceRef.page && ` | الصفحة: ${question.sourceRef.page}`}
                    {question.sourceRef.lineFrom > 0 && ` | السطر: ${question.sourceRef.lineFrom} إلى ${question.sourceRef.lineTo}`}
                  </p>
                </div>
              )}

              {isAnswered ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">إجابتك:</span> {submission.answer}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">التوثيق:</span> الجزء {submission.documentation.part} - 
                    صفحة {submission.documentation.page}
                    {submission.documentation.lineFrom && ` - سطر ${submission.documentation.lineFrom}`}
                    {submission.documentation.lineTo && ` إلى ${submission.documentation.lineTo}`}
                  </p>
                  <p className="text-green-600 font-semibold mt-3">✓ تم حفظ إجابتك</p>
                </div>
              ) : (
                <div>
                  {question.type === 'text' && (
                    <textarea
                      value={currentAnswers[question.id] || ''}
                      onChange={(e) =>
                        setCurrentAnswers({ ...currentAnswers, [question.id]: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] focus:border-blue-500 focus:outline-none"
                      placeholder="اكتب إجابتك هنا..."
                      disabled={isSubmittingThis}
                    />
                  )}

                  {question.type === 'true_false' && (
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentAnswers({ ...currentAnswers, [question.id]: 'true' })
                        }
                        className={`flex-1 py-4 rounded-lg font-semibold text-lg transition ${
                          currentAnswers[question.id] === 'true'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isSubmittingThis}
                      >
                        صح ✓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentAnswers({ ...currentAnswers, [question.id]: 'false' })
                        }
                        className={`flex-1 py-4 rounded-lg font-semibold text-lg transition ${
                          currentAnswers[question.id] === 'false'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={isSubmittingThis}
                      >
                        خطأ ✗
                      </button>
                    </div>
                  )}

                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-3 mb-4">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={currentAnswers[question.id] === option}
                            onChange={(e) =>
                              setCurrentAnswers({ ...currentAnswers, [question.id]: e.target.value })
                            }
                            className="w-5 h-5 text-blue-600"
                            disabled={isSubmittingThis}
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-amber-900 mb-3">التوثيق (إلزامي)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="الجزء / المجلد *"
                        value={currentDocs[question.id]?.part || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], part: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                        required
                      />
                      <input
                        type="text"
                        placeholder="الصفحة *"
                        value={currentDocs[question.id]?.page || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], page: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                        required
                      />
                      <input
                        type="text"
                        placeholder="السطر من"
                        value={currentDocs[question.id]?.lineFrom || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], lineFrom: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                      />
                      <input
                        type="text"
                        placeholder="السطر إلى"
                        value={currentDocs[question.id]?.lineTo || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], lineTo: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                      />
                      <input
                        type="text"
                        placeholder="أول كلمة"
                        value={currentDocs[question.id]?.firstWord || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], firstWord: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                      />
                      <input
                        type="text"
                        placeholder="آخر كلمة"
                        value={currentDocs[question.id]?.lastWord || ''}
                        onChange={(e) =>
                          setCurrentDocs({
                            ...currentDocs,
                            [question.id]: { ...currentDocs[question.id], lastWord: e.target.value }
                          })
                        }
                        className="border-2 border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        disabled={isSubmittingThis}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmit(question)}
                    disabled={isSubmittingThis}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmittingThis ? 'جاري الحفظ...' : 'حفظ الإجابة'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/dashboard"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          العودة للوحة التحكم
        </a>
      </div>
    </div>
  )
}
