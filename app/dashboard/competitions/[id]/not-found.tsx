import Link from 'next/link'
import { Icons } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
        <Icons.cross className="w-16 h-16 mb-4 block" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">المسابقة غير موجودة</h1>
        <p className="text-neutral-600 mb-6">
          المسابقة المطلوبة غير موجودة في قاعدة البيانات
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  )
}
