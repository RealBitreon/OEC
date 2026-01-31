import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import Icons from '@/components/icons'

export default async function CompetitionQuestionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton fallbackUrl={`/competition/${slug}`} label="العودة للمسابقة" />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">أسئلة المسابقة: {slug}</h1>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.file className="w-10 h-10 " />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">قريباً</h2>
            <p className="text-neutral-600">
              صفحة أسئلة المسابقة قيد التطوير. سيتم إضافتها قريباً.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
