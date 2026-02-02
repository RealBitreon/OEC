'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icons from '@/components/icons'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Competition {
  id: string
  title: string
  slug: string
  status: string
  start_at: string
  end_at: string
  wheel_at: string
  created_at: string
  winner_count: number
  max_attempts: number
}

interface Stats {
  totalCompetitions: number
  activeCompetitions: number
  totalSubmissions: number
  totalUsers: number
  pendingReviews: number
  totalWinners: number
}

interface Profile {
  username: string
  email: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    pendingReviews: 0,
    totalWinners: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all')

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  async function checkAuthAndFetchData() {
    try {
      setLoading(true)
      
      // Check session
      const sessionResponse = await fetch('/api/session')
      if (!sessionResponse.ok) {
        router.push('/login')
        return
      }

      const sessionData = await sessionResponse.json()
      
      // Check if user is CEO or LRC_MANAGER
      if (sessionData.user.role !== 'CEO' && sessionData.user.role !== 'LRC_MANAGER') {
        router.push('/unauthorized')
        return
      }

      setProfile(sessionData.user)

      // Fetch competitions and stats
      const [compsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/competitions'),
        fetch('/api/admin/stats')
      ])

      if (compsResponse.ok) {
        const compsData = await compsResponse.json()
        setCompetitions(compsData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const filteredCompetitions = competitions.filter(comp => {
    if (activeTab === 'all') return true
    return comp.status === activeTab
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700 border-green-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      archived: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200'
    }
    const labels = {
      active: 'نشطة',
      draft: 'مسودة',
      archived: 'مؤرشفة',
      completed: 'مكتملة'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges] || badges.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">لوحة إدارة المسابقات</h1>
              <p className="text-neutral-600 mt-1">
                مرحباً {profile.username} - {profile.role === 'CEO' ? 'المدير التنفيذي' : 'مشرف مركز مصادر التعلم'}
              </p>
            </div>
            <Link
              href="/admin/competitions/create"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Icons.plus className="w-5 h-5" />
              <span>إنشاء مسابقة جديدة</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-primary/10 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icons.trophy className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.totalCompetitions}</p>
            <p className="text-sm text-neutral-600">إجمالي المسابقات</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icons.check className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.activeCompetitions}</p>
            <p className="text-sm text-neutral-600">مسابقات نشطة</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icons.file className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.totalSubmissions}</p>
            <p className="text-sm text-neutral-600">إجمالي المشاركات</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icons.user className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.totalUsers}</p>
            <p className="text-sm text-neutral-600">المستخدمون</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Icons.clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.pendingReviews}</p>
            <p className="text-sm text-neutral-600">بانتظار المراجعة</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-secondary/20 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.trophy className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-800">{stats.totalWinners}</p>
            <p className="text-sm text-neutral-600">الفائزون</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/competitions"
            className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <Icons.trophy className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">إدارة المسابقات</h3>
            <p className="text-white/80 text-sm">إنشاء وتعديل المسابقات</p>
          </Link>

          <Link
            href="/admin/submissions"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <Icons.file className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">مراجعة المشاركات</h3>
            <p className="text-white/80 text-sm">مراجعة وتقييم الإجابات</p>
          </Link>

          <Link
            href="/admin/questions"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <Icons.help className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">بنك الأسئلة</h3>
            <p className="text-white/80 text-sm">إضافة وإدارة الأسئلة</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <Icons.user className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">إدارة المستخدمين</h3>
            <p className="text-white/80 text-sm">عرض وإدارة الحسابات</p>
          </Link>
        </div>

        {/* Competitions List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">المسابقات</h2>
            
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                الكل ({competitions.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                نشطة ({competitions.filter(c => c.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'draft'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                مسودات ({competitions.filter(c => c.status === 'draft').length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'archived'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                مؤرشفة ({competitions.filter(c => c.status === 'archived').length})
              </button>
            </div>
          </div>

          {filteredCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <Icons.file className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">لا توجد مسابقات</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCompetitions.map((competition) => (
                <div
                  key={competition.id}
                  className="border-2 border-neutral-100 rounded-xl p-6 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-neutral-800">{competition.title}</h3>
                        {getStatusBadge(competition.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-neutral-500">تاريخ البدء</p>
                          <p className="font-semibold text-neutral-700">
                            {new Date(competition.start_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">تاريخ الانتهاء</p>
                          <p className="font-semibold text-neutral-700">
                            {new Date(competition.end_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">عدد الفائزين</p>
                          <p className="font-semibold text-neutral-700">{competition.winner_count}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">المحاولات المسموحة</p>
                          <p className="font-semibold text-neutral-700">{competition.max_attempts}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mr-4">
                      <Link
                        href={`/admin/competitions/${competition.id}/edit`}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Icons.edit className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/api/competition/${competition.id}/stats`}
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                        title="الإحصائيات"
                      >
                        <Icons.chart className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/competition/${competition.slug}`}
                        className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                        title="معاينة"
                      >
                        <Icons.eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-semibold transition-colors"
          >
            العودة للرئيسية
          </Link>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}
