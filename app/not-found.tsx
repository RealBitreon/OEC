import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">الصفحة غير موجودة</h2>
          <p className="text-neutral-600 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
          <BackButton 
            fallbackUrl="/"
            label="العودة للرئيسية"
            variant="primary"
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}
