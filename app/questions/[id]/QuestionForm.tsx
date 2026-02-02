'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { applyCustomValidation } from '@/lib/utils/form-validation'
import { useToast } from '@/components/ui/Toast'

interface QuestionFormProps {
  question: {
    id: string
    type: 'mcq' | 'true_false' | 'text' | 'fill_blank' | 'essay'
    questionText: string
    options?: string[]
    correctAnswer?: string
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
  const { showToast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [answer, setAnswer] = useState('')
  const [studentName, setStudentName] = useState('')
  const [grade, setGrade] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [evidence, setEvidence] = useState({
    volume: '',
    page: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ isCorrect: boolean; message: string } | null>(null)

  // Apply custom validation messages with toast
  useEffect(() => {
    if (formRef.current) {
      applyCustomValidation(formRef.current, (message, type) => {
        showToast(message, type)
      })
    }
  }, [showToast])

  // Cheat code: Expose correct answer in console
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).abrkadabra = async () => {
        console.clear()
        console.log('%c🎩✨ ABRACADABRA! ✨🎩', 'font-size: 24px; font-weight: bold; color: #8b5cf6; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        console.log('%cالإجابة الصحيحة:', 'font-size: 18px; font-weight: bold; color: #10b981; margin-top: 10px;')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        
        console.log(`\n%c📌 السؤال:`, 'font-weight: bold; color: #3b82f6; font-size: 14px;')
        console.log(`%c${question.questionText}`, 'color: #6b7280; font-size: 13px; margin-right: 10px;')
        
        if (question.correctAnswer) {
          console.log(`\n%c✅ الإجابة الصحيحة: ${question.correctAnswer}`, 'color: #10b981; font-weight: bold; font-size: 14px; background: #d1fae5; padding: 4px 8px; border-radius: 4px;')
        } else {
          console.log(`\n%c⚠️ الإجابة الصحيحة غير متاحة في الواجهة الأمامية`, 'color: #f59e0b; font-weight: bold; font-size: 14px;')
        }
        
        console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        console.log('%c💡 نصيحة: استخدم هذه المعلومات بحكمة!', 'font-style: italic; color: #f59e0b; font-size: 12px;')
        console.log('%c💡 تذكر: يجب عليك تقديم الدليل من المصدر (المجلد، الصفحة، السطر)', 'font-style: italic; color: #f59e0b; font-size: 12px;')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).abrkadabra
      }
    }
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!answer.trim()) {
      showToast('الرجاء اختيار أو كتابة إجابة', 'warning')
      return
    }

    if (!studentName.trim()) {
      showToast('الرجاء إدخال اسمك', 'warning')
      return
    }

    if (!grade.trim()) {
      showToast('الرجاء إدخال الصف', 'warning')
      return
    }

    if (!classNumber.trim()) {
      showToast('الرجاء إدخال الفصل', 'warning')
      return
    }

    if (!evidence.volume.trim() || !evidence.page.trim()) {
      showToast('الرجاء إدخال الدليل كاملاً (المجلد والصفحة)', 'warning')
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
          grade: grade.trim(),
          classNumber: classNumber.trim(),
          evidence: `المجلد ${evidence.volume} - الصفحة ${evidence.page}`,
        }),
      })

      if (!response.ok) {
        throw new Error('فشل إرسال الإجابة')
      }

      const data = await response.json()
      
      // Show result with custom messages
      if (data.isCorrect) {
        const successMessages = [
          '🎉 ممتاز! إجابة صحيحة!',
          '✨ رائع! أحسنت!',
          '🌟 عظيم! استمر في التميز!',
          '🏆 إجابة مثالية!',
          '💫 أنت على الطريق الصحيح!'
        ]
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]
        setResult({
          isCorrect: true,
          message: `${randomMessage}\n\nاسمك الآن في قائمة المرشحين للسحب! 🎯\nبالتوفيق في السحب! 🍀`
        })
      } else {
        setResult({
          isCorrect: false,
          message: 'لا بأس، الأخطاء جزء من التعلم! 💪\nحاول مرة أخرى وستنجح بإذن الله.'
        })
      }
      
      // Reset only answer and evidence, keep name and class
      setAnswer('')
      setEvidence({ volume: '', page: '' })
    } catch (err) {
      showToast('حدث خطأ أثناء إرسال الإجابة. حاول مرة أخرى.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswer('')
    setEvidence({ volume: '', page: '' })
    setError('')
  }

  // Show result modal
  if (result) {
    return (
      <div className="bg-white rounded-card shadow-sm p-8 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          result.isCorrect ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          <span className="text-6xl">{result.isCorrect ? '🎉' : '💪'}</span>
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${
          result.isCorrect ? 'text-green-700' : 'text-amber-700'
        }`}>
          {result.isCorrect ? 'إجابة صحيحة!' : 'حاول مرة أخرى'}
        </h2>
        
        <p className="text-xl text-neutral-700 mb-8 whitespace-pre-line leading-relaxed">
          {result.message}
        </p>

        <div className="flex gap-4 justify-center">
          {!result.isCorrect && (
            <button
              onClick={handleRetry}
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-button transition-all duration-200"
            >
              حاول مرة أخرى
            </button>
          )}
          <button
            onClick={() => router.push('/questions')}
            className={`px-8 py-4 font-bold rounded-button transition-all duration-200 ${
              result.isCorrect 
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {result.isCorrect ? 'العودة إلى الأسئلة' : 'رجوع'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Question Text */}
      <div className="bg-white rounded-card shadow-sm p-6 border-r-4 border-primary">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-4">
          {question.questionText}
        </h2>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-card shadow-sm p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">معلومات الطالب</h3>
        
        {/* Student Name Input */}
        <div className="mb-4">
          <label className="block text-base font-semibold text-neutral-800 mb-2">
            الاسم الكامل *
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

        {/* Grade and Class */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-neutral-800 mb-2">
              الصف *
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="مثال: 10"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-neutral-800 mb-2">
              الفصل *
            </label>
            <input
              type="text"
              value={classNumber}
              onChange={(e) => setClassNumber(e.target.value)}
              placeholder="مثال: 15"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Answer Input */}
      <div className="bg-white rounded-card shadow-sm p-6">

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

        {question.type === 'fill_blank' && (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="أكمل الفراغ..."
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none text-lg"
          />
        )}

        {question.type === 'essay' && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="اكتب إجابتك المقالية هنا... (يُفضل أن تكون شاملة ومفصلة)"
            rows={8}
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
          />
        )}
      </div>

      {/* Evidence Input */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-card shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">الدليل من المصدر *</h3>
            <p className="text-sm text-amber-700">
              يجب تحديد موقع الإجابة في الموسوعة العُمانية بدقة (المجلد والصفحة فقط). سيقوم المعلم بمراجعة إجابتك والدليل المقدم وتصحيحها يدوياً.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              المجلد *
            </label>
            <input
              type="text"
              value={evidence.volume}
              onChange={(e) => setEvidence({ ...evidence, volume: e.target.value })}
              placeholder="رقم المجلد"
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              الصفحة *
            </label>
            <input
              type="text"
              value={evidence.page}
              onChange={(e) => setEvidence({ ...evidence, page: e.target.value })}
              placeholder="رقم الصفحة"
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
              required
            />
          </div>
        </div>
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
          disabled={isSubmitting}
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
