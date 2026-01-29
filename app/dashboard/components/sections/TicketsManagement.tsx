'use client'

import { useEffect, useState } from 'react'
import { User } from '../../core/types'
import { getCompetitions } from '../../actions/competitions'
import { getTicketsSummary, recalculateAllTickets, addManualTickets } from '../../actions/tickets'

export default function TicketsManagement({ profile }: { profile: User }) {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetition) {
      loadTicketsSummary()
    }
  }, [selectedCompetition])

  const loadCompetitions = async () => {
    try {
      const data = await getCompetitions()
      const activeOrRecent = data.filter(c => c.status === 'active' || c.status === 'archived')
      setCompetitions(activeOrRecent)
      if (activeOrRecent.length > 0) {
        setSelectedCompetition(activeOrRecent[0].id)
      }
    } catch (error) {
      console.error('Failed to load competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketsSummary = async () => {
    if (!selectedCompetition) return
    
    setLoading(true)
    try {
      const data = await getTicketsSummary(selectedCompetition)
      setSummary(data)
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateAll = async () => {
    if (!confirm('هل تريد إعادة حساب جميع التذاكر؟ سيتم تحديث التذاكر بناءً على القواعد الحالية.')) return
    
    setProcessing(true)
    try {
      await recalculateAllTickets(selectedCompetition)
      await loadTicketsSummary()
      alert('تم إعادة حساب التذاكر بنجاح')
    } catch (error: any) {
      alert(error?.message || 'فشل إعادة الحساب')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة التذاكر</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (competitions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة التذاكر</h1>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">🎫</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقات</h2>
          <p className="text-neutral-600">قم بإنشاء مسابقة أولاً</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة التذاكر</h1>
        <button
          onClick={handleRecalculateAll}
          disabled={processing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {processing ? 'جاري الحساب...' : '🔄 إعادة حساب الكل'}
        </button>
      </div>

      {/* Competition Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          اختر المسابقة
        </label>
        <select
          value={selectedCompetition}
          onChange={e => setSelectedCompetition(e.target.value)}
          className="w-full md:w-96 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {competitions.map(comp => (
            <option key={comp.id} value={comp.id}>
              {comp.title} ({comp.status === 'active' ? 'نشطة' : 'مؤرشفة'})
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{summary?.total || 0}</div>
          <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{summary?.byUser?.length || 0}</div>
          <div className="text-sm text-neutral-600">طلاب لديهم تذاكر</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">
            {summary?.byUser?.length > 0 ? (summary.total / summary.byUser.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-neutral-600">متوسط التذاكر</div>
        </div>
      </div>

      {/* Tickets by Reason */}
      {summary?.byReason && Object.keys(summary.byReason).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">التذاكر حسب المصدر</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.byReason).map(([reason, count]: [string, any]) => (
              <div key={reason} className="p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900 mb-1">{count}</div>
                <div className="text-sm text-neutral-600">{getReasonLabel(reason)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">التذاكر حسب الطالب</h2>
        </div>

        {!summary?.byUser || summary.byUser.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-4 block">🎫</span>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">لا توجد تذاكر</h3>
            <p className="text-neutral-600">لم يحصل أي طالب على تذاكر في هذه المسابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">إجمالي التذاكر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">التفاصيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {summary.byUser.map((entry: any, index: number) => (
                  <tr key={index} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {entry.user.display_name || entry.user.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {entry.user.class || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                        {entry.total}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {entry.sources.map((source: any, i: number) => (
                          <div key={i} className="text-xs text-neutral-600">
                            {getReasonLabel(source.reason)}: {source.count}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(entry.user)
                          setShowManualModal(true)
                        }}
                        className="px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        إضافة يدوي
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Tickets Modal */}
      {showManualModal && selectedUser && (
        <ManualTicketsModal
          user={selectedUser}
          competitionId={selectedCompetition}
          onClose={() => {
            setShowManualModal(false)
            setSelectedUser(null)
            loadTicketsSummary()
          }}
        />
      )}
    </div>
  )
}

function ManualTicketsModal({ user, competitionId, onClose }: any) {
  const [count, setCount] = useState(1)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!reason.trim()) {
      alert('الرجاء إدخال سبب إضافة التذاكر')
      return
    }

    setSaving(true)
    try {
      await addManualTickets(user.id, competitionId, count, reason)
      alert('تم إضافة التذاكر بنجاح')
      onClose()
    } catch (error: any) {
      alert(error?.message || 'فشل إضافة التذاكر')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">إضافة تذاكر يدوياً</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              الطالب
            </label>
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-neutral-900 font-medium">
              {user.display_name || user.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              عدد التذاكر *
            </label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={e => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              السبب *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="مثال: مكافأة على التميز"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الإضافة...' : 'إضافة'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

function getReasonLabel(reason: string): string {
  if (reason.startsWith('manual:')) {
    return reason.replace('manual:', 'يدوي: ')
  }
  const labels: Record<string, string> = {
    submissions: 'الإجابات',
    early_bonus: 'مكافأة مبكرة',
    manual: 'يدوي',
  }
  return labels[reason] || reason
}
