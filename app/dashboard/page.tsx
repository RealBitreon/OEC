'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icons from '@/components/icons'
import Footer from '@/components/Footer'
import { config } from '@/lib/config/site'

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

interface Question {
  id: string
  question_text: string
  type: string
  category?: string
  difficulty?: string
  is_training: boolean
  status: string
  created_at: string
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
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCompetitions: 0,
    activeCompetitions: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    pendingReviews: 0,
    totalWinners: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'competitions' | 'questions' | 'training'>('overview')
  const [competitionTab, setCompetitionTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [questionTab, setQuestionTab] = useState<'all' | 'competition' | 'training'>('all')

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  async function checkAuthAndFetchData() {
    try {
      setLoading(true)
      
      const sessionResponse = await fetch('/api/session')
      if (!sessionResponse.ok) {
        router.push('/login')
        return
      }

      const sessionData = await sessionResponse.json()
      
      const allowedRoles = ['CEO', 'LRC_MANAGER']
      if (!allowedRoles.includes(sessionData.user.role)) {
        router.push('/unauthorized')
        return
      }

      setProfile(sessionData.user)

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

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredCompetitions = competitions.filter(comp => {
    if (competitionTab === 'all') return true
    return comp.status === competitionTab
  })

  const filteredQuestions = questions.filter(q => {
    if (questionTab === 'all') return true
    if (questionTab === 'training') return q.is_training
    return !q.is_training
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600">جاري التحميل...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      {/* Custom Header for Dashboard */}
      <header className="fixed right-0 left-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">م</span>
              </div>
              <div className="hidden md:block">
                <div className="text-lg font-bold text-primary">{config.site.title}</div>
                <div className="text-xs text-neutral-600">{config.school.shortName}</div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-neutral-800">{profile.username}</p>
                <p className="text-xs text-neutral-600">
                  {profile.role === 'CEO' ? 'المدير التنفيذي' : 'مشرف مركز مصادر التعلم'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-2 mb-8 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeSection === 'overview'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icons.home className="w-5 h-5 inline-block ml-2" />
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveSection('competitions')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeSection === 'competitions'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icons.trophy className="w-5 h-5 inline-block ml-2" />
              المسابقات
            </button>
            <button
              onClick={() => setActiveSection('questions')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeSection === 'questions'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icons.help className="w-5 h-5 inline-block ml-2" />
              بنك الأسئلة
            </button>
            <button
              onClick={() => setActiveSection('training')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeSection === 'training'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icons.book className="w-5 h-5 inline-block ml-2" />
              أسئلة التدريب
            </button>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-neutral-800 mb-2">لوحة إدارة المسابقات</h1>
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
                <button
                  onClick={() => setActiveSection('competitions')}
                  className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
                >
                  <Icons.trophy className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-bold mb-1">إدارة المسابقات</h3>
                  <p className="text-white/80 text-sm">عرض وإدارة جميع المسابقات</p>
                </button>

                <button
                  onClick={() => setActiveSection('questions')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
                >
                  <Icons.help className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-bold mb-1">بنك الأسئلة</h3>
                  <p className="text-white/80 text-sm">إدارة أسئلة المسابقات</p>
                </button>

                <button
                  onClick={() => setActiveSection('training')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-right"
                >
                  <Icons.book className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-bold mb-1">أسئلة التدريب</h3>
                  <p className="text-white/80 text-sm">إدارة أسئلة التدريب</p>
                </button>

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
          )}

          {/* Competitions Section */}
          {activeSection === 'competitions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">إدارة المسابقات</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompetitionTab('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      competitionTab === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    الكل ({competitions.length})
                  </button>
                  <button
                    onClick={() => setCompetitionTab('active')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      competitionTab === 'active'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    نشطة ({competitions.filter(c => c.status === 'active').length})
                  </button>
                  <button
                    onClick={() => setCompetitionTab('draft')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      competitionTab === 'draft'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    مسودات ({competitions.filter(c => c.status === 'draft').length})
                  </button>
                  <button
                    onClick={() => setCompetitionTab('archived')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      competitionTab === 'archived'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    مؤرشفة ({competitions.filter(c => c.status === 'archived').length})
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
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
                              href={`/competition/${competition.slug}`}
                              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                              title="معاينة المسابقة"
                            >
                              <Icons.eye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/competition/${competition.slug}/wheel`}
                              className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              title="عجلة السحب"
                            >
                              <Icons.target className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions Bank Section */}
          {activeSection === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">بنك الأسئلة</h2>
                <Link
                  href="/questions"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Icons.eye className="w-5 h-5" />
                  <span>عرض جميع الأسئلة</span>
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                  <Icons.help className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-800 mb-2">بنك الأسئلة</h3>
                  <p className="text-neutral-600 mb-6">
                    يمكنك عرض وإدارة جميع أسئلة المسابقات من خلال صفحة الأسئلة
                  </p>
                  <Link
                    href="/questions"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all"
                  >
                    <Icons.arrow className="w-5 h-5" />
                    انتقل إلى صفحة الأسئلة
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Training Questions Section */}
          {activeSection === 'training' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">أسئلة التدريب</h2>
                <Link
                  href="/questions?filter=training"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Icons.eye className="w-5 h-5" />
                  <span>عرض أسئلة التدريب</span>
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                  <Icons.book className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-800 mb-2">أسئلة التدريب</h3>
                  <p className="text-neutral-600 mb-6">
                    يمكن للطلاب التدرب على هذه الأسئلة قبل المشاركة في المسابقات الفعلية
                  </p>
                  <Link
                    href="/questions?filter=training"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Icons.arrow className="w-5 h-5" />
                    انتقل إلى أسئلة التدريب
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
