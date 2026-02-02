'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icons from '@/components/icons'
import { User } from '../../core/types'

interface OverviewProps {
  profile: User
}

interface Stats {
  totalCompetitions: number
  activeCompetitions: number
  totalSubmissions: number
  totalUsers: number
  pendingReviews: number
  totalWinners: number
}

export default function Overview({ profile }: OverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    pendingReviews: 0,
    totalWinners: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-neutral-800 mb-2">نظرة عامة</h2>
        <p className="text-neutral-600">
          مرحباً {profile.username} - {profile.role === 'CEO' ? 'المدير التنفيذي' : 'مشرف مركز مصادر التعلم'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-primary/10 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
            <Icons.trophy className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.totalCompetitions}</p>
          <p className="text-sm text-neutral-600">إجمالي المسابقات</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Icons.check className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.activeCompetitions}</p>
          <p className="text-sm text-neutral-600">مسابقات نشطة</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Icons.file className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.totalSubmissions}</p>
          <p className="text-sm text-neutral-600">إجمالي المشاركات</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Icons.user className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.totalUsers}</p>
          <p className="text-sm text-neutral-600">المستخدمون</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
            <Icons.clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.pendingReviews}</p>
          <p className="text-sm text-neutral-600">بانتظار المراجعة</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-secondary/20 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mb-3">
            <Icons.trophy className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-800">{stats.totalWinners}</p>
          <p className="text-sm text-neutral-600">الفائزون</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard?section=competitions"
          className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
        >
          <Icons.trophy className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">إدارة المسابقات</h3>
          <p className="text-white/80 text-sm">عرض وإدارة جميع المسابقات</p>
        </Link>

        <Link
          href="/dashboard?section=question-bank"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
        >
          <Icons.help className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">بنك الأسئلة</h3>
          <p className="text-white/80 text-sm">إدارة أسئلة المسابقات</p>
        </Link>

        <Link
          href="/dashboard?section=training-questions"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
        >
          <Icons.book className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">أسئلة التدريب</h3>
          <p className="text-white/80 text-sm">إدارة أسئلة التدريب</p>
        </Link>

        <Link
          href="/admin/simulator"
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
        >
          <Icons.settings className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">محاكي العجلة</h3>
          <p className="text-white/80 text-sm">اختبار نظام السحب</p>
        </Link>
      </div>
    </div>
  )
}
