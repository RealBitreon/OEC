import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function CompetitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4">المسابقة: {slug}</h1>
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">قريباً</h2>
            <p className="text-neutral-600">
              صفحة تفاصيل المسابقة قيد التطوير. سيتم إضافتها قريباً.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
