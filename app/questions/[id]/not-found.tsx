import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function QuestionNotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">❌</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            السؤال غير موجود
          </h1>
          <p className="text-neutral-600 text-lg mb-8">
            عذراً، السؤال الذي تبحث عنه غير موجود أو غير متاح للتدريب.
          </p>
          <Link
            href="/questions"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-button transition-all duration-200"
          >
            العودة إلى قائمة الأسئلة
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
