'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Competition, User } from '@/app/dashboard/core/types'

interface CompetitionHubProps {
  competition: Competition
  profile: User
}

export default function CompetitionHub({ competition, profile }: CompetitionHubProps) {
  const router = useRouter()

  useEffect(() => {
    console.log('CompetitionHub mounted with competition:', competition.id, competition.title)
  }, [competition])

  const getStatusBadge = () => {
    const badges = {
      draft: { label: 'مسودة', className: 'bg-gray-100 text-gray-700' },
      active: { label: 'نشطة', className: 'bg-green-100 text-green-700' },
      archived: { label: 'مؤرشفة', className: 'bg-blue-100 text-blue-700' },
    }
    const badge = badges[competition.status]
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const hubCards = [
    {
      id: 'manage',
      title: 'إدارة المسابقة',
      description: 'تعديل التفاصيل، التواريخ، والقواعد',
      icon: '⚙️',
      color: 'blue',
      action: () => router.push(`/dashboard/competitions/${competition.id}/manage`)
    },
    {
      id: 'questions',
      title: 'الأسئلة',
      description: 'إضافة وإدارة أسئلة المسابقة',
      icon: '❓',
      color: 'purple',
      action: () => router.push(`/dashboard/competitions/${competition.id}/questions`)
    },
    {
      id: 'submissions',
      title: 'إجابات الطلاب',
      description: 'مراجعة وتصحيح الإجابات',
      icon: '📝',
      color: 'green',
      action: () => router.push(`/dashboard/competitions/${competition.id}/submissions`)
    },
    {
      id: 'wheel',
      title: 'عجلة الحظ',
      description: 'إدارة السحب والفائزين',
      icon: '🎡',
      color: 'yellow',
      action: () => router.push(`/dashboard/competitions/${competition.id}/wheel`)
    },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard?section=competitions')}
        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <span>←</span>
        <span>العودة إلى المسابقات</span>
      </button>

      {/* Competition Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{competition.title}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">{competition.description}</p>
          </div>
        </div>

        {/* Competition Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">تاريخ البداية</div>
            <div className="font-medium text-neutral-900 dark:text-white">
              {new Date(competition.start_at).toLocaleDateString('ar-SA')}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">تاريخ النهاية</div>
            <div className="font-medium text-neutral-900 dark:text-white">
              {new Date(competition.end_at).toLocaleDateString('ar-SA')}
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">موعد السحب</div>
            <div className="font-medium text-neutral-900 dark:text-white">
              {new Date(competition.wheel_at).toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>

        {/* Rules Summary */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm font-medium text-neutral-900 dark:text-white mb-2">قواعد الأهلية</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {competition.rules.eligibilityMode === 'all_correct' && 'جميع الإجابات صحيحة'}
            {competition.rules.eligibilityMode === 'min_correct' && 
              `الحد الأدنى ${competition.rules.minCorrectAnswers} إجابة صحيحة`}
            {competition.rules.eligibilityMode === 'per_correct' && 
              `${competition.rules.ticketsPerCorrect} تذكرة لكل إجابة صحيحة`}
          </div>
        </div>
      </div>

      {/* Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubCards.map(card => (
          <button
            key={card.id}
            onClick={card.action}
            className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-sm border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all text-right"
          >
            <div className="text-5xl mb-4">{card.icon}</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{card.title}</h2>
            <p className="text-neutral-600 dark:text-neutral-400">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
