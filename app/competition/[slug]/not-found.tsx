import Link from 'next/link'

export default function CompetitionNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            المسابقة غير موجودة
          </h1>
          <p className="text-gray-600 mb-6">
            عذراً، لم نتمكن من العثور على المسابقة المطلوبة
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
