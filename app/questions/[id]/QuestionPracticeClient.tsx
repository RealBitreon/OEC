'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header, Footer } from '@/components'

interface Question {
  id: string
  type: 'text' | 'true_false' | 'mcq'
  title: string
  body: string
  options?: string[]
  correctAnswer: any
  explanation?: string
  difficulty?: string
  sourceRef?: {
    volume: string
    page: string
    lineFrom: number
    lineTo: number
  }
}

interface Props {
  question: Question
  isLoggedIn: boolean
  username?: string
}

export default function QuestionPracticeClient({ question, isLoggedIn, username }: Props) {
  const [answer, setAnswer] = useState<any>('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Evaluate answer
    let correct = false
    if (question.type === 'true_false' || question.type === 'mcq') {
      correct = answer === question.correctAnswer
    } else if (question.type === 'text') {
      // For text, check if answer matches any variant
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer]
      correct = correctAnswers.some(
        (ca: string) => ca.trim().toLowerCase() === answer.trim().toLowerCase()
      )
    }

    setIsCorrect(correct)
    setSubmitted(true)

    // Save submission if logged in
    if (isLoggedIn && username) {
      try {
        await fetch('/api/training-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question.id,
            answer,
            isCorrect: correct,
          }),
        })
      } catch (error) {
        console.error('Failed to save training submission:', error)
      }
    }

    setLoading(false)
  }

  const resetQuestion = () => {
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      true_false: { label: 'صح/خطأ', color: 'bg-blue-100 text-blue-700' },
      mcq: { label: 'اختيار متعدد', color: 'bg-purple-100 text-purple-700' },
      text: { label: 'نص', color: 'bg-green-100 text-green-700' },
    }
    return badges[type as keyof typeof badges] || badges.text
  }

  const typeBadge = getTypeBadge(question.type)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        {/* Header */}
        <section className="bg-gradient-to-l from-primary to-primary-dark text-white py-12">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeBadge.color}`}>
                {typeBadge.label}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                سؤال تدريبي
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {question.title}
            </h1>
            <p className="text-white/80">
              لا يؤثر على المسابقة أو عجلة الحظ
            </p>
          </div>
        </div>
      </section>

      {/* Question Content */}
      <section className="section-container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-card p-8 mb-6">
            {/* Question Body */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">السؤال:</h2>
              <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {question.body}
              </p>
            </div>

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

            {/* Answer Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                {question.type === 'true_false' && (
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setAnswer(true)}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-right font-semibold text-lg ${
                        answer === true
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-neutral-200 hover:border-primary/50 text-neutral-700'
                      }`}
                    >
                      ✓ صح
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswer(false)}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-right font-semibold text-lg ${
                        answer === false
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-neutral-200 hover:border-primary/50 text-neutral-700'
                      }`}
                    >
                      ✗ خطأ
                    </button>
                  </div>
                )}

                {question.type === 'mcq' && question.options && (
                  <div className="space-y-3 mb-6">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAnswer(option)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                          answer === option
                            ? 'border-primary bg-primary/5 text-primary font-semibold'
                            : 'border-neutral-200 hover:border-primary/50 text-neutral-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      إجابتك:
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="اكتب إجابتك هنا..."
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!answer || loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-button transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-button"
                >
                  {loading ? 'جاري التحقق...' : 'تحقق من الإجابة'}
                </button>
              </form>
            ) : (
              <div>
                {/* Result */}
                <div
                  className={`p-6 rounded-xl mb-6 ${
                    isCorrect
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{isCorrect ? '✅' : '❌'}</span>
                    <h3 className="text-2xl font-bold">
                      {isCorrect ? 'إجابة صحيحة!' : 'إجابة غير صحيحة'}
                    </h3>
                  </div>
                  {!isCorrect && (
                    <div className="mt-4">
                      <p className="font-semibold text-neutral-800 mb-2">الإجابة الصحيحة:</p>
                      <p className="text-neutral-700">
                        {question.type === 'true_false'
                          ? question.correctAnswer
                            ? 'صح'
                            : 'خطأ'
                          : Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.join(' أو ')
                          : question.correctAnswer}
                      </p>
                    </div>
                  )}
                  {question.explanation && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="font-semibold text-neutral-800 mb-2">الشرح:</p>
                      <p className="text-neutral-700">{question.explanation}</p>
                    </div>
                  )}
                  {question.type === 'text' && !isCorrect && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        💡 قيّم نفسك: هل إجابتك قريبة من الإجابة النموذجية؟
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={resetQuestion}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-4 rounded-button transition-all"
                  >
                    حاول مرة أخرى
                  </button>
                  <Link
                    href="/questions"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-button transition-all text-center"
                  >
                    سؤال آخر
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 justify-center">
            <Link
              href="/questions"
              className="text-neutral-600 hover:text-primary font-medium transition-colors"
            >
              ← العودة لقائمة الأسئلة
            </Link>
            {isLoggedIn && (
              <>
                <span className="text-neutral-300">|</span>
                <Link
                  href="/dashboard"
                  className="text-neutral-600 hover:text-primary font-medium transition-colors"
                >
                  لوحة التحكم
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  )
}
