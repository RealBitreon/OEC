'use client'

import React from 'react'
import Icons from '@/components/icons'

interface OutOfTriesModalProps {
  maxAttempts: number
  onClose?: () => void
}

export default function OutOfTriesModal({ maxAttempts, onClose }: OutOfTriesModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header with gradient - smaller */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            انتهت المحاولات المتاحة
          </h2>
          <p className="text-white/90">
            لقد استخدمت جميع المحاولات ({maxAttempts} محاولات)
          </p>
        </div>

        {/* Content - compact */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Icons.info className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  هل تريد المحاولة مرة أخرى؟
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  إذا كنت في <span className="font-bold">مركز مصادر التعلم (LRC)</span>، 
                  يمكنك طلب إعادة تعيين المحاولات من معلمك
                </p>
              </div>
            </div>
          </div>

          {/* Instructions - compact */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <span className="text-xl">📋</span>
              خطوات إعادة تعيين المحاولات:
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-lg text-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  1
                </div>
                <p className="text-neutral-700 pt-0.5">
                  اذهب إلى <span className="font-bold text-primary">معلمك في مركز مصادر التعلم (LRC)</span>
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-lg text-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  2
                </div>
                <p className="text-neutral-700 pt-0.5">
                  اطلب منه <span className="font-bold text-primary">كود إعادة تعيين المحاولات</span>
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-lg text-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  3
                </div>
                <p className="text-neutral-700 pt-0.5">
                  أدخل الكود في الصفحة السابقة وحاول مرة أخرى
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              العودة للصفحة الرئيسية
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full border-2 border-neutral-300 text-neutral-700 font-semibold py-2 px-6 rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
