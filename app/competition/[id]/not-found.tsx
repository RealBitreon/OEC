import Link from 'next/link'
import { Trophy, ArrowLeft, Home } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CompetitionNotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-neutral-900 mb-4" dir="rtl" lang="ar">
              المسابقة غير موجودة
            </h1>
            
            <p className="text-neutral-600 mb-8 text-lg" dir="rtl" lang="ar">
              عذراً، لم نتمكن من العثور على المسابقة المطلوبة. قد تكون المسابقة قد انتهت أو تم إزالتها.
            </p>
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-button transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
