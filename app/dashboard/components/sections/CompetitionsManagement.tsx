'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icons from '@/components/icons'
import { User } from '../../core/types'

interface CompetitionsManagementProps {
  profile: User
}

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

export default function CompetitionsManagement({ profile }: CompetitionsManagementProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all')

  useEffect(() => {
    fetchCompetitions()
  }, [])

  async function fetchCompetitions() {
    try {
      const response = await fetch('/api/admin/competitions')
      if (response.ok) {
        const data = await response.json()
        setCompetitions(data)
      }
    } catch (error) {
      console.error('Error fetching competitions:', error)
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
    }
    const labels = {
      active: 'نشطة',
      draft: 'مسودة',
      archived: 'مؤرشفة',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges] || badges.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">إدارة المسابقات</h2>
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
  )
}
