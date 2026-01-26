'use client'

import type { SessionPayload } from '@/lib/auth/types'
import Link from 'next/link'

interface SettingsTabProps {
  session: SessionPayload
}

export default function SettingsTab({ session }: SettingsTabProps) {
  const getRoleLabel = () => {
    switch (session.role) {
      case 'ceo': return 'CEO'
      case 'lrc_manager': return 'مسؤول LRC'
      case 'student': return 'طالب'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">الإعدادات</h1>
        <p className="text-neutral-600">إعدادات الحساب والنظام</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">معلومات الحساب</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">اسم المستخدم</label>
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-neutral-900 font-medium">
              {session.username}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">الدور</label>
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-neutral-900 font-medium">
              {getRoleLabel()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">الإجراءات</h3>
        <div className="space-y-3">
          <Link
            href="/logout"
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            تسجيل الخروج
          </Link>
          <Link
            href="/"
            className="block w-full text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-3 rounded-lg transition-all"
          >
            العودة للموقع الرئيسي
          </Link>
        </div>
      </div>
    </div>
  )
}
