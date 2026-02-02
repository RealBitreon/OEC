'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui'

export default function ApiErrorPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-32">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في الاتصال</h2>
            <p className="text-gray-600 mb-6">
              عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              إعادة المحاولة
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="w-full"
            >
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
