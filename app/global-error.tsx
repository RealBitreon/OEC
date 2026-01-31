'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Don't log NEXT_REDIRECT errors - they're expected behavior
    if (error.message?.includes('NEXT_REDIRECT')) {
      return
    }
    console.error('Global error:', error)
  }, [error])

  // If this is a redirect error, don't show error UI
  if (error.message?.includes('NEXT_REDIRECT')) {
    return null
  }

  return (
    <html dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
              <p className="text-gray-600 mb-6">
                عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                إعادة المحاولة
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-right">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs text-left overflow-auto">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
