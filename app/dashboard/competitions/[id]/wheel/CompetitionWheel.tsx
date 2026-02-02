'use client'

import { useRouter } from 'next/navigation'
import { Competition, User } from '@/app/dashboard/core/types'
import WheelManagement from '@/app/dashboard/components/sections/WheelManagement'

interface CompetitionWheelProps {
  competition: Competition
  profile: User
}

export default function CompetitionWheel({ competition, profile }: CompetitionWheelProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/dashboard/competitions/${competition.id}`)}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <span>→</span>
        <span>العودة إلى المسابقة</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">عجلة الحظ</h1>
        <p className="text-neutral-600 mt-1">{competition.title}</p>
      </div>

      {/* Wheel Component */}
      <WheelManagement profile={profile} competitionId={competition.id} />
    </div>
  )
}
