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
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-5xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            انتهت المحاولات المتاحة
          </h2>
          <p className="text-white/90 text-lg">
            لقد استخدمت جميع المحاولات ({maxAttempts} محاولات)
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Icons.info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  هل تريد المحاولة مرة أخرى؟
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  إذا كنت في <span className="font-bold">مركز مصادر التعلم (LRC)</span>، 
                  يمكنك طلب إعادة تعيين المحاولات من معلمك
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
              <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <p className="text-neutral-700 pt-1">
                  اذهب إلى <span className="font-bold text-primary">معلمك في مركز مصادر التعلم (LRC)</span>
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <p className="text-neutral-700 pt-1">
                  اطلب منه <span className="font-bold text-primary">كود إعادة تعيين المحاولات</span>
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <p className="text-neutral-700 pt-1">
                  أدخل الكود في الصفحة السابقة وحاول مرة أخرى
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Code Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👨‍🏫</span>
              <h4 className="text-lg font-bold text-purple-900">
                للمعلم فقط
              </h4>
            </div>
            <p className="text-purple-800 text-sm leading-relaxed">
              كود إعادة التعيين الخاص بمركز مصادر التعلم هو: 
              <span className="font-mono font-bold text-purple-900 bg-white px-3 py-1 rounded-lg mx-2 inline-block">
                12311
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              العودة للصفحة الرئيسية
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
