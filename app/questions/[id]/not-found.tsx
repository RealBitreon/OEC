import Link from 'next/link'
import { Header, Footer } from '@/components'

export default function QuestionNotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-card p-12">
            <div className="text-6xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              السؤال غير موجود
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              عذراً، لم نتمكن من العثور على هذا السؤال التدريبي
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/questions"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-button transition-all hover:scale-105 shadow-button"
              >
                تصفح الأسئلة التدريبية
              </Link>
              <Link
                href="/"
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold px-8 py-4 rounded-button transition-all"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
