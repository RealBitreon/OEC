'use client'

import { User } from '../../core/types'

export default function SubmissionsReview({ profile }: { profile: User }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">مراجعة الإجابات</h1>
      <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
        <span className="text-4xl mb-4 block">📝</span>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">مراجعة الإجابات</h2>
        <p className="text-neutral-600">سيتم تفعيل هذا القسم قريباً</p>
      </div>
    </div>
  )
}
