'use client'

import { useRouter } from 'next/navigation'
import { Competition, User } from '@/app/dashboard/core/types'
import SubmissionsReview from '@/app/dashboard/components/sections/SubmissionsReview'

interface CompetitionSubmissionsProps {
  competition: Competition
  profile: User
}

export default function CompetitionSubmissions({ competition, profile }: CompetitionSubmissionsProps) {
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
        <h1 className="text-3xl font-bold text-neutral-900">إجابات الطلاب</h1>
        <p className="text-neutral-600 mt-1">{competition.title}</p>
      </div>

      {/* Submissions Component */}
      <SubmissionsReview profile={profile} competitionId={competition.id} />
    </div>
  )
}
