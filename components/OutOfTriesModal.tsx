'use client'

import React, { useState } from 'react'
import Icons from '@/components/icons'

interface OutOfTriesModalProps {
  maxAttempts: number
  competitionId?: string
  onClose?: () => void
  onSuccess?: () => void
}

export default function OutOfTriesModal({ maxAttempts, competitionId, onClose, onSuccess }: OutOfTriesModalProps) {
  const [resetCode, setResetCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmitCode = async () => {
    if (!resetCode.trim()) {
      setError('الرجاء إدخال الكود')
      return
    }

    if (!competitionId) {
      setError('معرف المسابقة غير موجود')
      return
    }

    // Client-side validation first
    if (resetCode.trim() !== '12311') {
      setError('❌ كود غير صحيح - يرجى التحقق من الكود مع المعلم')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get device fingerprint
      const { getOrCreateFingerprint } = await import('@/lib/utils/device-fingerprint')
      const deviceFingerprint = getOrCreateFingerprint()

      const response = await fetch('/api/attempts/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          competitionId,
          deviceFingerprint,
          resetCode: resetCode.trim() 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 1500)
        } else {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        setError(data.error || 'كود غير صحيح - يرجى التحقق من الكود مع المعلم')
      }
    } catch (err) {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-5xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              انتهت المحاولات المتاحة
            </h2>
            <p className="text-white/95 text-lg">
              لقد استخدمت جميع المحاولات ({maxAttempts} محاولات)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info Box */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Icons.info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  هل تريد المحاولة مرة أخرى؟
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  إذا كنت في <span className="font-bold">مركز مصادر التعلم (LRC)</span> أو <span className="font-bold">معمل الحاسب</span> في المدرسة، 
                  يمكنك طلب المعلم للحضور وإدخال الكود السري لإعادة تعيين المحاولات
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              خطوات إعادة تعيين المحاولات:
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <p className="text-neutral-700 pt-1 leading-relaxed">
                  اطلب من <span className="font-bold text-primary">المعلم في مركز مصادر التعلم (LRC)</span> أو <span className="font-bold text-primary">معمل الحاسب</span> الحضور
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <p className="text-neutral-700 pt-1 leading-relaxed">
                  سيقوم المعلم بإدخال <span className="font-bold text-primary">الكود السري</span> لإعادة تعيين محاولاتك
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <p className="text-neutral-700 pt-1 leading-relaxed">
                  بعد إدخال الكود، ستتمكن من المحاولة مرة أخرى
                </p>
              </div>
            </div>
          </div>

          {/* Code Input Section */}
          {success ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3 animate-bounce">✅</div>
              <p className="text-green-800 font-bold text-lg mb-1">تم إعادة تعيين المحاولات بنجاح!</p>
              <p className="text-green-700">جاري تحديث الصفحة...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-base font-bold text-neutral-800 mb-3 block flex items-center gap-2">
                  <Icons.key className="w-5 h-5 text-amber-600" />
                  كود إعادة التعيين (للمعلم فقط):
                </span>
                <input
                  type="password"
                  value={resetCode}
                  onChange={(e) => {
                    setResetCode(e.target.value)
                    setError('')
                  }}
                  placeholder="يُدخله المعلم فقط"
                  className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-center text-xl font-mono tracking-wider"
                  disabled={isSubmitting}
                  maxLength={10}
                />
              </label>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center animate-shake">
                  <p className="text-red-700 font-semibold flex items-center justify-center gap-2">
                    <span className="text-xl">❌</span>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting || !resetCode.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icons.clock className="w-5 h-5 animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  '✓ تأكيد الكود'
                )}
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2 border-t-2 border-neutral-100">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🏠 العودة للصفحة الرئيسية
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full border-2 border-neutral-300 text-neutral-700 font-semibold py-3 px-6 rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
