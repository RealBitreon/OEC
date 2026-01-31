'use client'

import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'
import { User } from '../../core/types'
import { getActiveCompetition, getParticipationStats, getGradingDistribution, getRecentActivity } from '../../actions/monitoring'

interface CurrentCompetitionProps {
  profile: User
}

export default function CurrentCompetition({ profile }: CurrentCompetitionProps) {
  const [competition, setCompetition] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [distribution, setDistribution] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const fetchData = async () => {
      try {
        const comp = await getActiveCompetition()
        if (mounted) {
          setCompetition(comp)
          
          if (comp) {
            const [statsData, distData, activityData] = await Promise.all([
              getParticipationStats(comp.id),
              getGradingDistribution(comp.id),
              getRecentActivity(comp.id, 10)
            ])
            if (mounted) {
              setStats(statsData)
              setDistribution(distData)
              setRecentActivity(activityData)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load competition:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (mounted) {
        fetchData()
      }
    }, 30000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const comp = await getActiveCompetition()
      setCompetition(comp)
      
      if (comp) {
        const [statsData, distData, activityData] = await Promise.all([
          getParticipationStats(comp.id),
          getGradingDistribution(comp.id),
          getRecentActivity(comp.id, 10)
        ])
        setStats(statsData)
        setDistribution(distData)
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error('Failed to load competition:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">المسابقة الحالية</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">المسابقة الحالية</h1>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.trophy className="w-10 h-10 " />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            لا توجد مسابقة نشطة حالياً
          </h2>
          <p className="text-neutral-600 mb-6">
            قم بتفعيل مسابقة من قسم إدارة المسابقات
          </p>
          <a
            href="/dashboard?section=competitions"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            إدارة المسابقات
          </a>
        </div>
      </div>
    )
  }

  const daysRemaining = Math.ceil((new Date(competition.end_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">المسابقة الحالية</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          🔄 تحديث
        </button>
      </div>

      {/* Competition Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{competition.title}</h2>
            <p className="text-blue-100">{competition.description}</p>
          </div>
          <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
            نشطة
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">تاريخ البداية</div>
            <div className="font-medium">{new Date(competition.start_at).toLocaleDateString('ar-SA')}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">تاريخ النهاية</div>
            <div className="font-medium">{new Date(competition.end_at).toLocaleDateString('ar-SA')}</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">الوقت المتبقي</div>
            <div className="font-medium">
              {daysRemaining > 0 ? `${daysRemaining} يوم` : 'انتهت'}
            </div>
          </div>
        </div>
      </div>

      {/* Participation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats?.participants || 0}</div>
          <div className="text-sm text-neutral-600">طلاب مشاركون</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats?.submissions || 0}</div>
          <div className="text-sm text-neutral-600">إجابات مقدمة</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats?.questions || 0}</div>
          <div className="text-sm text-neutral-600">أسئلة المسابقة</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats?.completionRate || 0}%</div>
          <div className="text-sm text-neutral-600">نسبة الإكمال</div>
        </div>
      </div>

      {/* Grading Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">توزيع التصحيح التلقائي</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">{distribution?.autoCorrect || 0}</div>
            <div className="text-sm text-green-700">صحيح تلقائياً</div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-2xl font-bold text-red-700 mb-1">{distribution?.autoIncorrect || 0}</div>
            <div className="text-sm text-red-700">خطأ تلقائياً</div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700 mb-1">{distribution?.needsReview || 0}</div>
            <div className="text-sm text-yellow-700">تحتاج مراجعة</div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 mb-1">{distribution?.manuallyReviewed || 0}</div>
            <div className="text-sm text-blue-700">تم تصحيحها يدوياً</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">النشاط الأخير</h2>
          <a
            href="/dashboard?section=submissions"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            عرض الكل →
          </a>
        </div>

        {recentActivity.length === 0 ? (
          <div className="p-12 text-center">
            <Icons.file className="w-10 h-10 mb-4 block" />
            <h3 className="text-lg font-bold text-neutral-900 mb-2">لا يوجد نشاط</h3>
            <p className="text-neutral-600">لم يتم تقديم أي إجابات بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {recentActivity.map((activity, index) => (
              <div key={index} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 mb-1">
                      {activity.user?.display_name || activity.user?.username || 'طالب'}
                    </div>
                    <div className="text-sm text-neutral-600 mb-2 line-clamp-1">
                      {activity.question?.question_text || 'سؤال محذوف'}
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.auto_result === 'correct' && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          ✓ صحيح
                        </span>
                      )}
                      {activity.auto_result === 'incorrect' && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          ✗ خطأ
                        </span>
                      )}
                      {!activity.final_result && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          ⏳ قيد المراجعة
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(activity.submitted_at).toLocaleString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/dashboard?section=questions"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-300 transition-colors group"
        >
          <div className="mb-3"><Icons.question className="w-8 h-8" /></div>
          <div className="font-bold text-neutral-900 mb-1 group-hover:text-blue-600">إدارة الأسئلة</div>
          <div className="text-sm text-neutral-600">إضافة وتعديل أسئلة المسابقة</div>
        </a>
        <a
          href="/dashboard?section=submissions"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-300 transition-colors group"
        >
          <div className="mb-3"><Icons.file className="w-8 h-8" /></div>
          <div className="font-bold text-neutral-900 mb-1 group-hover:text-blue-600">مراجعة الإجابات</div>
          <div className="text-sm text-neutral-600">تصحيح ومراجعة إجابات الطلاب</div>
        </a>
        <a
          href="/dashboard?section=tickets"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-300 transition-colors group"
        >
          <div className="text-3xl mb-3">🎫</div>
          <div className="font-bold text-neutral-900 mb-1 group-hover:text-blue-600">إدارة التذاكر</div>
          <div className="text-sm text-neutral-600">عرض وإدارة تذاكر الطلاب</div>
        </a>
      </div>
    </div>
  )
}
