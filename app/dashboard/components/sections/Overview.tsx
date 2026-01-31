'use client'

// ============================================
// OVERVIEW SECTION
// ============================================

import { useEffect, useState } from 'react'
import { User } from '../../core/types'
import { getOverviewStats } from '../../actions/overview'
import { Icons } from '@/components/icons'

interface OverviewProps {
  profile: User
}

interface Stats {
  totalCompetitions: number
  totalQuestions: number
  totalSubmissions: number
  activeCompetition: {
    id: string
    title: string
    slug: string
    totalQuestions: number
    totalSubmissions: number
    pendingSubmissions: number
    approvedSubmissions: number
    startAt: string
    endAt: string
  } | null
  recentSubmissions: Array<{
    id: string
    participantName: string
    competitionId: string
    submittedAt: string
    status: string
  }>
}

export default function Overview({ profile }: OverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const fetchStats = async () => {
      try {
        const data = await getOverviewStats()
        if (mounted) {
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchStats()
    
    return () => {
      mounted = false
    }
  }, [])



  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">نظرة عامة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">نظرة عامة</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          مرحباً {profile.username}، هذه لوحة التحكم الخاصة بك
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Competition */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Icons.trophy className="w-6 h-6 " />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">المسابقة النشطة</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.activeCompetition ? '1' : '0'}
              </p>
            </div>
          </div>
          {stats?.activeCompetition && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
              {stats.activeCompetition.title}
            </p>
          )}
        </div>

        {/* Total Questions */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Icons.question className="w-6 h-6 " />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">إجمالي الأسئلة</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.totalQuestions || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Icons.file className="w-6 h-6 " />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">إجمالي الإجابات</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.totalSubmissions || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Competitions */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Icons.trophy className="w-6 h-6 " />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">إجمالي المسابقات</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.totalCompetitions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      {stats?.recentSubmissions && stats.recentSubmissions.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            الإجابات الأخيرة
          </h2>
          <div className="space-y-3">
            {stats.recentSubmissions.map(submission => (
              <div
                key={submission.id}
                className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{submission.participantName}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{submission.status}</p>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(submission.submittedAt).toLocaleString('ar-SA')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
