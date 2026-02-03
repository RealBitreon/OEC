'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateFingerprint } from '@/lib/utils/device-fingerprint'
import { applyCustomValidation } from '@/lib/utils/form-validation'
import { useToast } from '@/components/ui/Toast'
import Icons from '@/components/icons'
import OutOfTriesModal from '@/components/OutOfTriesModal'

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
  endAt: string
  wheelSpinAt?: string
  maxAttempts?: number
}

interface Props {
  competition: Competition
  questions: Question[]
}

export default function ParticipationForm({ competition, questions }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState<'info' | 'questions' | 'complete'>('info')
  const [firstName, setFirstName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [evidences, setEvidences] = useState<Record<string, { volume: string; page: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; correctCount: number; totalQuestions: number } | null>(null)
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const [attemptInfo, setAttemptInfo] = useState<{ canAttempt: boolean; remainingAttempts: number; maxAttempts: number } | null>(null)
  const [checkingAttempts, setCheckingAttempts] = useState(true)
  const [resetCode, setResetCode] = useState('')
  const [showOutOfTriesModal, setShowOutOfTriesModal] = useState(false)

  // Apply custom validation messages with toast
  useEffect(() => {
    if (formRef.current) {
      applyCustomValidation(formRef.current, (message, type) => {
        showToast(message, type)
      })
    }
  }, [step, showToast]) // Re-apply when step changes

  // Check attempts on mount
  useEffect(() => {
    const checkAttempts = async () => {
      try {
        const deviceFingerprint = getOrCreateFingerprint()
        
        console.log('[PARTICIPATION FORM] Checking attempts:', {
          competitionId: competition.id,
          fingerprint: deviceFingerprint.substring(0, 8) + '...'
        })
        
        const response = await fetch('/api/attempts/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            competitionId: competition.id,
            deviceFingerprint,
          }),
        })

        const data = await response.json()
        
        console.log('[PARTICIPATION FORM] Attempts check result:', data)
        
        setAttemptInfo(data)

        if (!data.canAttempt) {
          setShowOutOfTriesModal(true)
        }
      } catch (error) {
        console.error('[PARTICIPATION FORM] Error checking attempts:', error)
        // Don't redirect on error - let user try to participate
      } finally {
        setCheckingAttempts(false)
      }
    }

    checkAttempts()
  }, [competition.id])

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

  // Show modal if out of tries
  if (showOutOfTriesModal && attemptInfo) {
    return (
      <OutOfTriesModal 
        maxAttempts={attemptInfo.maxAttempts} 
        competitionId={competition.id}
        onSuccess={() => {
          setShowOutOfTriesModal(false)
          window.location.reload()
        }}
      />
    )
  }

  const handleStartQuestions = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate names (only Arabic/English letters and spaces, no numbers or special characters)
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/
    
    if (!firstName.trim() || !fatherName.trim() || !familyName.trim()) {
      showToast('يرجى إدخال الاسم الثلاثي كاملاً', 'error')
      return
    }
    
    if (!nameRegex.test(firstName.trim())) {
      showToast('الاسم الأول: يجب أن يحتوي على حروف عربية أو إنجليزية فقط (بدون أرقام أو رموز)', 'error')
      return
    }
    
    if (!nameRegex.test(fatherName.trim())) {
      showToast('اسم الأب: يجب أن يحتوي على حروف عربية أو إنجليزية فقط (بدون أرقام أو رموز)', 'error')
      return
    }
    
    if (!nameRegex.test(familyName.trim())) {
      showToast('اسم العائلة: يجب أن يحتوي على حروف عربية أو إنجليزية فقط (بدون أرقام أو رموز)', 'error')
      return
    }
    
    if (!gradeLevel.trim()) {
      showToast('يرجى إدخال الصف', 'error')
      return
    }
    
    if (!classNumber.trim()) {
      showToast('يرجى إدخال الفصل', 'error')
      return
    }
    
    // Validate grade and class (only numbers)
    const numberRegex = /^\d+$/
    
    if (!numberRegex.test(gradeLevel.trim())) {
      showToast('الصف: يجب أن يحتوي على أرقام فقط', 'error')
      return
    }
    
    if (!numberRegex.test(classNumber.trim())) {
      showToast('الفصل: يجب أن يحتوي على أرقام فقط', 'error')
      return
    }
    
    setStep('questions')
  }

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer })
  }

  const handleEvidence = (questionId: string, field: 'volume' | 'page', value: string) => {
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
      showToast('يرجى اختيار إجابة', 'warning')
      return
    }
    const evidence = evidences[currentQuestion.id]
    if (!evidence || !evidence.volume.trim() || !evidence.page.trim()) {
      showToast('يرجى إدخال الدليل كاملاً (المجلد والصفحة)', 'warning')
      return
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Show confirmation dialog before final submit
      if (attemptInfo && attemptInfo.remainingAttempts <= attemptInfo.maxAttempts) {
        const remainingAfterSubmit = attemptInfo.remainingAttempts - 1
        const confirmMessage = remainingAfterSubmit > 0
          ? `⚠️ تأكيد الإرسال النهائي\n\n📊 المحاولات المتبقية: ${attemptInfo.remainingAttempts} من أصل ${attemptInfo.maxAttempts}\n📉 بعد الإرسال سيتبقى: ${remainingAfterSubmit} محاولة\n\n✅ هل أنت متأكد من إرسال إجاباتك الآن؟\n\n💡 تأكد من مراجعة جميع الإجابات والأدلة قبل الإرسال`
          : `⚠️ تحذير: آخر محاولة!\n\n🚨 هذه هي محاولتك الأخيرة من أصل ${attemptInfo.maxAttempts} محاولات\n❌ بعد الإرسال لن تتمكن من المحاولة مرة أخرى\n\n✅ هل أنت متأكد تماماً من إرسال إجاباتك الآن؟\n\n💡 راجع جميع الإجابات والأدلة بعناية قبل التأكيد`
        
        if (!confirm(confirmMessage)) {
          return
        }
      }
      handleSubmit()
    }
  }

  const handleResetAttempts = async () => {
    // Validate reset code on client-side first
    if (!resetCode.trim()) {
      showToast('يرجى إدخال كود إعادة التعيين', 'error')
      return
    }

    // Client-side validation - check if code matches expected format
    if (resetCode.trim() !== '12311') {
      showToast('❌ كود غير صحيح - يرجى التحقق من الكود مع المعلم', 'error')
      return
    }

    try {
      const deviceFingerprint = getOrCreateFingerprint()
      
      // Call server-side API to verify and reset
      const response = await fetch('/api/attempts/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition.id,
          deviceFingerprint,
          resetCode: resetCode.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        showToast(data.error || 'فشل إعادة تعيين المحاولات', 'error')
        return
      }

      // Success - update state and reload
      showToast('✅ تم إعادة تعيين المحاولات بنجاح!', 'success')
      
      setAttemptInfo({
        canAttempt: true,
        remainingAttempts: data.maxAttempts,
        maxAttempts: data.maxAttempts
      })
      setResetCode('')
      setShowOutOfTriesModal(false)
      
      // Reload page after short delay
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Reset error:', error)
      showToast('حدث خطأ أثناء إعادة تعيين المحاولات', 'error')
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
        formattedEvidences[qId] = `المجلد ${ev.volume} - الصفحة ${ev.page}`
      })

      console.log('[SUBMIT] Sending submission:', {
        competition_id: competition.id,
        participant_name: participantName,
        answersCount: Object.keys(answers).length,
        proofsCount: Object.keys(formattedEvidences).length,
        score: correctCount,
        total_questions: questions.length
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
          total_questions: questions.length,
          device_fingerprint: getOrCreateFingerprint(), // Pass fingerprint for attempt tracking
        })
      })

      console.log('[SUBMIT] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[SUBMIT] Error response:', errorData)
        throw new Error(errorData.message || errorData.hint || 'فشل إرسال الإجابات')
      }

      const result = await response.json()
      console.log('[SUBMIT] Success:', result)

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

  // DISABLED: Student participation is now disabled
  // Teachers must enter answers through the dashboard
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-6xl">🚫</span>
      </div>
      <h2 className="text-3xl font-bold text-red-700 mb-4">
        المشاركة المباشرة معطلة
      </h2>
      <p className="text-xl text-neutral-700 mb-6 leading-relaxed">
        لم يعد بإمكان الطلاب إدخال الإجابات مباشرة.<br/>
        يجب على المعلم إدخال الإجابات من خلال لوحة التحكم.
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all duration-200"
      >
        العودة للصفحة الرئيسية
      </button>
    </div>
  )

  // OLD CODE - DISABLED
  if (false && step === 'info') {
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
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.user className="w-10 h-10 " />
          </div>
          <h2 className="text-2xl font-bold text-center text-neutral-800 mb-2">معلومات المشارك</h2>
          <p className="text-center text-neutral-600">
            عدد الأسئلة: {questions.length} سؤال
          </p>
        </div>

        <form ref={formRef} onSubmit={handleStartQuestions} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-semibold text-neutral-800 mb-3">
              الاسم الثلاثي * <span className="text-sm text-neutral-500">(حروف فقط، بدون أرقام)</span>
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
              الصف والفصل * <span className="text-sm text-neutral-500">(أرقام فقط)</span>
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

        {/* Reset Code Section - Prominent display when out of attempts */}
        {attemptInfo && !attemptInfo.canAttempt && (
          <div className="mt-6 pt-6 border-t-2 border-amber-200">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <Icons.key className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-900">
                  هل لديك كود إعادة تعيين من المعلم؟
                </h3>
              </div>
              
              <p className="text-amber-800 mb-4 text-sm leading-relaxed">
                إذا كنت في مركز مصادر التعلم (LRC)، يمكنك الحصول على كود من معلمك لإعادة تعيين المحاولات
              </p>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-amber-900">
                  أدخل كود إعادة التعيين
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    placeholder="أدخل الكود"
                    className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none font-mono font-bold text-center bg-white"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={handleResetAttempts}
                    disabled={!resetCode.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    ✓ تطبيق
                  </button>
                </div>
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <Icons.info className="w-4 h-4" />
                  الكود متاح فقط لدى معلم مركز مصادر التعلم (LRC)
                </p>
              </div>
            </div>
          </div>
        )}
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <p className="text-sm text-amber-700 mt-3">
                ⚠️ يجب تحديد موقع الإجابة في الموسوعة العُمانية بدقة (المجلد والصفحة فقط)
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
    
    // Format competition end date
    const endDate = new Date(competition.endAt)
    const endDateStr = endDate.toLocaleDateString('ar-SA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Check if user can retry (has remaining attempts)
    const canRetry = attemptInfo && attemptInfo.canAttempt && !allCorrect

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
              ✨ اسمك الآن في قائمة المرشحين للسحب! 🎯<br/>
              🍀 بالتوفيق في السحب على الجوائز!
            </>
          ) : someCorrect ? (
            <>
              أجبت على {result.correctCount} من {result.totalQuestions} أسئلة بشكل صحيح<br/>
              اسمك في قائمة المرشحين للسحب! 🎯<br/>
              بالتوفيق! 🍀
            </>
          ) : (
            <>
              لا بأس، الأخطاء جزء من التعلم! 💪<br/>
              {canRetry ? 'يمكنك المحاولة مرة أخرى' : 'لقد استنفدت جميع المحاولات'}<br/>
              استمر في التعلم وستنجح بإذن الله! 📚
            </>
          )}
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
          <div className="mb-3"><Icons.clock className="w-12 h-12 text-blue-600" /></div>
          <p className="text-lg font-bold text-blue-900 mb-2">
            ⏳ إجابتك قيد المراجعة
          </p>
          <p className="text-sm text-blue-700">
            سيتم مراجعة إجابتك من قبل معلم المصادر قريباً
          </p>
        </div>

        {/* Important Information Box */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6 text-right">
          <div className="flex items-start gap-3 mb-4">
            <Icons.info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">معلومات مهمة</h3>
              <div className="space-y-2 text-blue-800 text-sm leading-relaxed">
                <p>
                  📋 <strong>سيتم مراجعة الإجابة من معلم المصادر</strong> للتأكد من صحة الأدلة المقدمة
                </p>
                <p>
                  📅 <strong>آخر موعد للمسابقة:</strong> {endDateStr}
                </p>
                <p>
                  🎯 <strong>السحب على الجوائز:</strong> سيتم بعد انتهاء المسابقة
                </p>
                <p>
                  🏆 <strong>التكريم:</strong> سيتم تكريم الفائزين في الطابور إن شاء الله
                </p>
              </div>
            </div>
          </div>
        </div>

        {attemptInfo && !attemptInfo.canAttempt && !allCorrect && (
          <p className="text-sm text-amber-600 mb-6 font-semibold bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ لقد استنفدت جميع المحاولات ({attemptInfo.maxAttempts} محاولات)
          </p>
        )}
        
        <div className="flex gap-4 justify-center flex-wrap">
          {canRetry && (
            <button
              onClick={() => {
                // Reload page to check attempts again
                window.location.reload()
              }}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all duration-200"
            >
              حاول مرة أخرى
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className={`px-8 py-3 font-bold rounded-lg transition-all duration-200 ${
              allCorrect || !canRetry
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  return null
}
