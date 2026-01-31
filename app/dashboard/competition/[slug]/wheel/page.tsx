import { BackButton } from '@/components'

export default async function CompetitionWheelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <BackButton fallbackUrl={`/dashboard/competition/${slug}`} label="العودة للمسابقة" />
      </div>
      
      <h1 className="text-4xl font-bold text-primary mb-4">عجلة السحب: {slug}</h1>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎡</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">قريباً</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          صفحة عجلة السحب للمسابقة قيد التطوير. سيتم إضافتها قريباً.
        </p>
      </div>
    </div>
  )
}
