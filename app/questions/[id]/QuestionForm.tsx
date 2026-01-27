'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuestionFormProps {
  question: {
    id: string
    type: 'mcq' | 'true_false' | 'text'
    questionText: string
    options?: string[]
    sourceRef: {
      volume: string
      page: string
      lineFrom: string
      lineTo: string
    }
  }
}

export default function QuestionForm({ question }: QuestionFormProps) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [studentName, setStudentName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!answer.trim()) {
      setError('الرجاء اختيار أو كتابة إجابة')
      return
    }

    if (!studentName.trim()) {
      setError('الرجاء إدخال اسمك')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/training/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
          studentName: studentName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('فشل إرسال الإجابة')
      }

      const result = await response.json()
      
      // Show result and allow continuing
      if (result.isCorrect) {
        alert('إجابة صحيحة! 🎉')
      } else {
        alert('إجابة خاطئة. حاول مرة أخرى!')
      }
      
      // Reset form
      setAnswer('')
      setStudentName('')
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الإجابة. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Text */}
      <div className="bg-white rounded-card shadow-sm p-6 border-r-4 border-primary">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-4">
          {question.questionText}
        </h2>
        
        {/* Source Reference */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded p-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>
            <strong>المصدر:</strong> المجلد {question.sourceRef.volume} - صفحة {question.sourceRef.page} - 
            السطر {question.sourceRef.lineFrom} إلى {question.sourceRef.lineTo}
          </span>
        </div>
      </div>

      {/* Answer Input */}
      <div className="bg-white rounded-card shadow-sm p-6">
        {/* Student Name Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-neutral-800 mb-3">
            اسمك:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="أدخل اسمك الكامل"
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
            required
          />
        </div>

        <label className="block text-lg font-semibold text-neutral-800 mb-4">
          إجابتك:
        </label>

        {question.type === 'mcq' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  answer === option
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-neutral-800">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-3">
            {['صح', 'خطأ'].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  answer === option
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-neutral-800 text-lg font-medium">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'text' && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-card p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !answer.trim() || !studentName.trim()}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-button transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإجابة'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/questions')}
          className="px-6 py-4 border-2 border-neutral-300 text-neutral-700 font-bold rounded-button hover:bg-neutral-50 transition-all duration-200"
        >
          رجوع
        </button>
      </div>
    </form>
  )
}
