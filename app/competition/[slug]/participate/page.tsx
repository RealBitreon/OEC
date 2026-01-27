import { redirect } from 'next/navigation'
import { getSupabaseSession } from '@/lib/auth/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function CompetitionParticipatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4">المشاركة في: {slug}</h1>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-neutral-800 mb-3">
                  اسمك الكامل:
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-neutral-800 mb-3">
                  البريد الإلكتروني (اختياري):
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-button transition-all duration-200"
              >
                تسجيل المشاركة
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
