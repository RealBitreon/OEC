'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateFingerprint } from '@/lib/utils/device-fingerprint'
import Icons from '@/components/icons'

interface Question {
  id: string
  type: 'mcq' | 'true_false' | 'text'
  question_text: string
  options?: string[]
  correct_answer: string
  source_ref?: {
    volume: string
    page: string
    lineFrom: string
    lineTo: string
  }
}

interface Competition {
  id: string
  title: string
  slug: string
}

interface Props {
  competition: Competition
  questions: Question[]
}

export default function ParticipationForm({ competition, questions }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'questions' | 'complete'>('info')
  const [firstName, setFirstName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [evidences, setEvidences] = useState<Record<string, { volume: string; page: string; line: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; correctCount: number; totalQuestions: number } | null>(null)
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const [attemptInfo, setAttemptInfo] = useState<{ canAttempt: boolean; remainingAttempts: number; maxAttempts: number } | null>(null)
  const [checkingAttempts, setCheckingAttempts] = useState(true)

  // Check attempts on mount
  useEffect(() => {
    const checkAttempts = async () => {
      try {
        const deviceFingerprint = getOrCreateFingerprint()
        const response = await fetch('/api/attempts/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            competitionId: competition.id,
            deviceFingerprint,
          }),
        })

        const data = await response.json()
        setAttemptInfo(data)

        if (!data.canAttempt) {
          alert(`لقد استنفدت جميع المحاولات المتاحة (${data.maxAttempts} محاولات). سيتم إعادتك للصفحة الرئيسية.`)
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking attempts:', error)
      } finally {
        setCheckingAttempts(false)
      }
    }

    checkAttempts()
  }, [competition.id, router])

  // Cheat code: Expose correct answers in console
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).abrkadabra = () => {
        console.clear()
        console.log('%c🎩✨ ABRACADABRA! ✨🎩', 'font-size: 24px; font-weight: bold; color: #8b5cf6; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        console.log('%cالإجابات الصحيحة مع الأدلة:', 'font-size: 18px; font-weight: bold; color: #10b981; margin-top: 10px;')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        
        questions.forEach((q, index) => {
          console.log(`\n%c📌 السؤال ${index + 1}:`, 'font-weight: bold; color: #3b82f6; font-size: 14px;')
          console.log(`%c${q.question_text}`, 'color: #6b7280; font-size: 13px; margin-right: 10px;')
          console.log(`%c✅ الإجابة الصحيحة: ${q.correct_answer}`, 'color: #10b981; font-weight: bold; font-size: 14px; background: #d1fae5; padding: 4px 8px; border-radius: 4px;')
          
          if (q.source_ref) {
            console.log(`%c📚 الدليل من المصدر:`, 'color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 4px;')
            console.log(`%c   المجلد: ${q.source_ref.volume} | الصفحة: ${q.source_ref.page} | السطر: ${q.source_ref.lineFrom}-${q.source_ref.lineTo}`, 'color: #d97706; font-size: 12px; background: #fef3c7; padding: 4px 8px; border-radius: 4px;')
          }
        })
        
        console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
        console.log('%c💡 نصيحة: استخدم هذه المعلومات بحكمة!', 'font-style: italic; color: #f59e0b; font-size: 12px;')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #8b5cf6;')
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).abrkadabra
      }
    }
  }, [questions])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleStartQuestions = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !fatherName.trim() || !familyName.trim()) {
      alert('يرجى إدخال الاسم الثلاثي كاملاً')
      return
    }
    if (!gradeLevel.trim()) {
      alert('يرجى إدخال الصف')
      return
    }
    if (!classNumber.trim()) {
      alert('يرجى إدخال الفصل')
      return
    }
    setStep('questions')
  }

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer })
  }

  const handleEvidence = (questionId: string, field: 'volume' | 'page' | 'line', value: string) => {
    setEvidences({
      ...evidences,
      [questionId]: {
        ...evidences[questionId],
        [field]: value
      }
    })
  }

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      alert('يرجى اختيار إجابة')
      return
    }
    const evidence = evidences[currentQuestion.id]
    if (!evidence || !evidence.volume.trim() || !evidence.page.trim() || !evidence.line.trim()) {
      alert('يرجى إدخال الدليل كاملاً (المجلد، الصفحة، السطر)')
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      // Increment attempt count
      const deviceFingerprint = getOrCreateFingerprint()
      const incrementResponse = await fetch('/api/attempts/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition.id,
          deviceFingerprint,
          userId: null, // Can be set if user is logged in
        }),
      })

      if (!incrementResponse.ok) {
        const errorData = await incrementResponse.json()
        throw new Error(errorData.error || 'فشل تسجيل المحاولة')
      }

      // Calculate score
      let correctCount = 0
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++
        }
      })

      const participantName = `${firstName} ${fatherName} ${familyName}`

      // Format evidences
      const formattedEvidences: Record<string, string> = {}
      Object.keys(evidences).forEach(qId => {
        const ev = evidences[qId]
        formattedEvidences[qId] = `المجلد ${ev.volume} - الصفحة ${ev.page} - السطر ${ev.line}`
      })

      const response = await fetch('/api/competition/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition_id: competition.id,
          participant_name: participantName,
          first_name: firstName,
          father_name: fatherName,
          family_name: familyName,
          grade: `${gradeLevel}-${classNumber}`,
          answers,
          proofs: formattedEvidences,
          score: correctCount,
          total_questions: questions.length
        })
      })

      if (!response.ok) {
        throw new Error('فشل إرسال الإجابات')
      }

      setResult({
        success: true,
        correctCount,
        totalQuestions: questions.length
      })
      setStep('complete')
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إرسال الإجابات')
    } finally {
      setSubmitting(false)
    }
  }

  // Step 1: Participant Info
  if (step === 'info') {
    if (checkingAttempts) {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icons.clock className="w-10 h-10 " />
          </div>
          <p className="text-lg text-neutral-600">جاري التحقق من المحاولات...</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {attemptInfo && attemptInfo.remainingAttempts < attemptInfo.maxAttempts && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Icons.warning className="w-6 h-6 " />
              <div>
                <p className="font-bold text-amber-900 mb-1">تنبيه: محاولات محدودة</p>
                <p className="text-sm text-amber-800">
                  لديك <span className="font-bold">{attemptInfo.remainingAttempts}</span> محاولة متبقية من أصل {attemptInfo.maxAttempts}.
                  تأكد من إجاباتك قبل الإرسال!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.user className="w-10 h-10 " />
          </div>
          <h2 className="text-2xl font-bold text-center text-neutral-800 mb-2">معلومات المشارك</h2>
          <p className="text-center text-neutral-600">
            عدد الأسئلة: {questions.length} سؤال
          </p>
        </div>

        <form onSubmit={handleStartQuestions} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-neutral-800 mb-3">
              الاسم الثلاثي *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="الاسم الأول"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                required
              />
              <input
                type="text"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
                placeholder="اسم الأب"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                required
              />
              <input
                type="text"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="القبيلة/العائلة"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-neutral-800 mb-3">
              الصف والفصل *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                placeholder="الصف (مثال: 10)"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                required
              />
              <input
                type="text"
                value={classNumber}
                onChange={e => setClassNumber(e.target.value)}
                placeholder="الفصل (مثال: 15)"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-button transition-all duration-200"
          >
            ابدأ الإجابة على الأسئلة
          </button>
        </form>
      </div>
    )
  }

  // Step 2: Questions
  if (step === 'questions') {
    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowAllQuestions(!showAllQuestions)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAllQuestions ? 'إخفاء' : 'عرض'} جميع الأسئلة
              </button>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* All Questions Preview */}
        {showAllQuestions && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">جميع الأسئلة</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 border-2 border-neutral-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-neutral-800 font-medium">{q.question_text}</p>
                      {answers[q.id] && (
                        <p className="text-sm text-green-600 mt-2">✓ تمت الإجابة</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              {currentQuestion.type === 'mcq' ? 'اختيار من متعدد' : 
               currentQuestion.type === 'true_false' ? 'صح/خطأ' : 'نص'}
            </span>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* MCQ Options */}
          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-right px-6 py-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary bg-primary/5 font-semibold'
                      : 'border-neutral-200 hover:border-primary/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* True/False Options */}
          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => handleAnswer('true')}
                className={`px-6 py-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === 'true'
                    ? 'border-green-600 bg-green-50 font-semibold'
                    : 'border-neutral-200 hover:border-green-300'
                }`}
              >
                ✓ صح
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('false')}
                className={`px-6 py-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === 'false'
                    ? 'border-red-600 bg-red-50 font-semibold'
                    : 'border-neutral-200 hover:border-red-300'
                }`}
              >
                ✗ خطأ
              </button>
            </div>
          )}

          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <div className="mb-8">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={e => handleAnswer(e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Evidence Field */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-neutral-800 mb-3">
              الدليل من المصدر * <span className="text-sm text-neutral-600">(مطلوب)</span>
            </label>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    المجلد *
                  </label>
                  <input
                    type="text"
                    value={evidences[currentQuestion.id]?.volume || ''}
                    onChange={e => handleEvidence(currentQuestion.id, 'volume', e.target.value)}
                    placeholder="رقم المجلد"
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    الصفحة *
                  </label>
                  <input
                    type="text"
                    value={evidences[currentQuestion.id]?.page || ''}
                    onChange={e => handleEvidence(currentQuestion.id, 'page', e.target.value)}
                    placeholder="رقم الصفحة"
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    السطر *
                  </label>
                  <input
                    type="text"
                    value={evidences[currentQuestion.id]?.line || ''}
                    onChange={e => handleEvidence(currentQuestion.id, 'line', e.target.value)}
                    placeholder="رقم السطر"
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-amber-700 mt-3">
                ⚠️ يجب تحديد موقع الإجابة في الموسوعة العُمانية بدقة
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-all"
              >
                السابق
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? 'جاري الإرسال...' : 
               currentQuestionIndex < questions.length - 1 ? 'التالي' : 'إرسال الإجابات'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Complete
  if (step === 'complete' && result) {
    const allCorrect = result.correctCount === result.totalQuestions
    const someCorrect = result.correctCount > 0 && result.correctCount < result.totalQuestions
    const noneCorrect = result.correctCount === 0

    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          allCorrect ? 'bg-green-100' : someCorrect ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <span className="text-6xl">
            {allCorrect ? '🎉' : someCorrect ? '💪' : '🌟'}
          </span>
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${
          allCorrect ? 'text-green-700' : someCorrect ? 'text-amber-700' : 'text-blue-700'
        }`}>
          {allCorrect ? 'ممتاز! إجابات صحيحة!' : 
           someCorrect ? 'أحسنت! لديك إجابات صحيحة' : 
           'شكراً لمشاركتك!'}
        </h2>
        
        <p className="text-xl text-neutral-700 mb-6 leading-relaxed">
          {allCorrect ? (
            <>
              🌟 رائع! أجبت على جميع الأسئلة بشكل صحيح!<br/>
              ✨ اسمك الآن في عجلة الحظ! 🎡<br/>
              🍀 بالتوفيق في السحب على الجوائز!
            </>
          ) : someCorrect ? (
            <>
              أجبت على {result.correctCount} من {result.totalQuestions} أسئلة بشكل صحيح<br/>
              اسمك في عجلة الحظ! 🎡<br/>
              بالتوفيق! 🍀
            </>
          ) : (
            <>
              لا بأس، الأخطاء جزء من التعلم! 💪<br/>
              يمكنك المحاولة مرة أخرى<br/>
              استمر في التعلم وستنجح بإذن الله! 📚
            </>
          )}
        </p>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-6 mb-6">
          <div className="mb-3"><Icons.target className="w-12 h-12" /></div>
          <p className="text-lg font-bold text-neutral-800">
            النتيجة: {result.correctCount} / {result.totalQuestions}
          </p>
        </div>

        <p className="text-sm text-neutral-500 mb-8">
          {!allCorrect && 'يمكنك إعادة المحاولة مرة واحدة فقط'}
        </p>
        
        <div className="flex gap-4 justify-center">
          {!allCorrect && (
            <button
              onClick={() => {
                setStep('questions')
                setCurrentQuestionIndex(0)
                setAnswers({})
                setEvidences({})
              }}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all duration-200"
            >
              حاول مرة أخرى
            </button>
          )}
          <button
            onClick={() => router.push(`/competition/${competition.slug}`)}
            className={`px-8 py-3 font-bold rounded-lg transition-all duration-200 ${
              allCorrect 
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            العودة للمسابقة
          </button>
        </div>
      </div>
    )
  }

  return null
}
