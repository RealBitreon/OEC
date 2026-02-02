'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-32">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">لا يوجد اتصال بالإنترنت</h2>
            <p className="text-gray-600 mb-6">
              يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.
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
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-right">
            <p className="text-sm text-blue-800">
              <strong>نصيحة:</strong> تأكد من اتصالك بشبكة Wi-Fi أو بيانات الهاتف المحمول.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
