import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function WheelNotFound() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-8xl mb-6">🎡</div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            المسابقة غير موجودة
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            لم نتمكن من العثور على المسابقة المطلوبة
          </p>
          <Link href="/" className="btn-primary inline-block">
            العودة للرئيسية
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
