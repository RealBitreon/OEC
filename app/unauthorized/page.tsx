'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-32">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
            <p className="text-gray-600 mb-6">
              عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى تسجيل الدخول أولاً.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              تسجيل الدخول
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
