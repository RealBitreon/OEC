'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuestionFormProps {
  question: {
    id: string
    type: 'mcq' | 'true_false' | 'text' | 'fill_blank' | 'essay'
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
  const [grade, setGrade] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [evidence, setEvidence] = useState({
    volume: '',
    page: '',
    line: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ isCorrect: boolean; message: string } | null>(null)

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

    if (!grade.trim()) {
      setError('الرجاء إدخال الصف')
      return
    }

    if (!classNumber.trim()) {
      setError('الرجاء إدخال الفصل')
      return
    }

    if (!evidence.volume.trim() || !evidence.page.trim() || !evidence.line.trim()) {
      setError('الرجاء إدخال الدليل كاملاً (المجلد، الصفحة، السطر)')
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
          evidence: `المجلد ${evidence.volume} - الصفحة ${evidence.page} - السطر ${evidence.line}`,
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
          message: `${randomMessage}\n\nاسمك الآن في عجلة الحظ! 🎡\nبالتوفيق في السحب! 🍀`
        })
      } else {
        setResult({
          isCorrect: false,
          message: 'لا بأس، الأخطاء جزء من التعلم! 💪\nحاول مرة أخرى وستنجح بإذن الله.'
        })
      }
      
      // Reset only answer and evidence, keep name and class
      setAnswer('')
      setEvidence({ volume: '', page: '', line: '' })
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الإجابة. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswer('')
    setEvidence({ volume: '', page: '', line: '' })
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
              يجب تحديد موقع الإجابة في الموسوعة العُمانية بدقة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-2">
              السطر *
            </label>
            <input
              type="text"
              value={evidence.line}
              onChange={(e) => setEvidence({ ...evidence, line: e.target.value })}
              placeholder="رقم السطر"
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
