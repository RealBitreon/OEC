'use client'

import { useEffect, useState, useMemo } from 'react'
import { User, Competition } from '../../core/types'
import { getCompetitions } from '../../actions/competitions'

export default function Archives({ profile }: { profile: User }) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const data = await getCompetitions()
      // Filter only archived competitions
      const archived = data.filter((c) => c.status === 'archived')
      setCompetitions(archived)
    } catch (error) {
      console.error('Failed to load archived competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCompetitions = useMemo(() => {
    let result = [...competitions]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.end_at).getTime() - new Date(b.end_at).getTime()
      } else {
        comparison = a.title.localeCompare(b.title, 'ar')
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [competitions, searchQuery, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">الإصدارات السابقة</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (selectedCompetition) {
    return (
      <CompetitionDetailsModal
        competition={selectedCompetition}
        onClose={() => setSelectedCompetition(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">الإصدارات السابقة</h1>
          <p className="text-neutral-600 mt-1">استعراض المسابقات المنتهية والأرشيف</p>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {filteredAndSortedCompetitions.length} مسابقة
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{competitions.length}</div>
          <div className="text-sm text-neutral-600">إجمالي المسابقات المؤرشفة</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 bg-blue-50">
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {competitions.filter(c => new Date(c.end_at).getFullYear() === new Date().getFullYear()).length}
          </div>
          <div className="text-sm text-blue-700">مسابقات هذا العام</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50">
          <div className="text-3xl font-bold text-green-700 mb-1">
            {competitions.filter(c => new Date(c.end_at).getFullYear() < new Date().getFullYear()).length}
          </div>
          <div className="text-sm text-green-700">الأعوام السابقة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">🔍 البحث</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مسابقة..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">الترتيب</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">📅 التاريخ</option>
                <option value="title">📝 العنوان</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? '⬆️ تصاعدي' : '⬇️ تنازلي'}
            </button>
          </div>
        </div>
      </div>

      {/* Competitions Grid */}
      {filteredAndSortedCompetitions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقات مؤرشفة</h2>
          <p className="text-neutral-600">
            {searchQuery ? 'لا توجد نتائج تطابق البحث' : 'لم يتم أرشفة أي مسابقات بعد'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCompetitions.map(competition => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              onClick={() => setSelectedCompetition(competition)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CompetitionCard({ competition, onClick }: { competition: Competition; onClick: () => void }) {
  const duration = Math.ceil(
    (new Date(competition.end_at).getTime() - new Date(competition.start_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{competition.title}</h3>
        <div className="flex items-center gap-2 text-blue-100 text-sm">
          <span>📅</span>
          <span>{new Date(competition.end_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-neutral-600 text-sm line-clamp-3">
          {competition.description || 'لا يوجد وصف'}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-900">{duration}</div>
            <div className="text-xs text-neutral-600">يوم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-xs text-neutral-600">مكتملة</div>
          </div>
        </div>

        <button className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          عرض التفاصيل
        </button>
      </div>
    </div>
  )
}

function CompetitionDetailsModal({ competition, onClose }: { competition: Competition; onClose: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{competition.title}</h1>
          <p className="text-neutral-600 mt-1">تفاصيل المسابقة المؤرشفة</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          ← العودة
        </button>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{competition.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-xs text-blue-100 mb-1">تاريخ البدء</div>
              <div className="font-medium">
                {new Date(competition.start_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-xs text-blue-100 mb-1">تاريخ الانتهاء</div>
              <div className="font-medium">
                {new Date(competition.end_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-xs text-blue-100 mb-1">الحالة</div>
              <div className="font-medium flex items-center gap-2">
                <span>✓</span>
                مكتملة
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">الوصف</h3>
            <p className="text-neutral-700 leading-relaxed">
              {competition.description || 'لا يوجد وصف'}
            </p>
          </div>

          {competition.rules && (
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">القواعد</h3>
              <div className="bg-neutral-50 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">نظام الأهلية</span>
                  <span className="font-medium text-neutral-900">
                    {competition.rules.eligibilityMode === 'all_correct' ? 'جميع الإجابات صحيحة' :
                     competition.rules.eligibilityMode === 'min_correct' ? 'حد أدنى من الإجابات' :
                     'تذكرة لكل إجابة صحيحة'}
                  </span>
                </div>
                {competition.rules.minCorrectAnswers && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">الحد الأدنى للإجابات</span>
                    <span className="font-medium text-neutral-900">{competition.rules.minCorrectAnswers}</span>
                  </div>
                )}
                {competition.rules.ticketsPerCorrect && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">تذاكر لكل إجابة صحيحة</span>
                    <span className="font-medium text-neutral-900">{competition.rules.ticketsPerCorrect}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
