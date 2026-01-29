'use client'

import { useEffect, useState, useMemo } from 'react'
import { User } from '../../core/types'
import { getAuditLogs, getAuditStats, getUniqueActions, exportAuditLogs, type AuditFilters } from '../../actions/audit'

interface AuditLog {
  id: string
  user_id: string
  action: string
  details: any
  created_at: string
  user?: {
    id: string
    username: string
    display_name: string
    role: string
  }
}

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'login': { label: 'تسجيل دخول', icon: '🔐', color: 'blue' },
  'logout': { label: 'تسجيل خروج', icon: '🚪', color: 'neutral' },
  'competition_created': { label: 'إنشاء مسابقة', icon: '🏆', color: 'green' },
  'competition_updated': { label: 'تحديث مسابقة', icon: '✏️', color: 'yellow' },
  'competition_deleted': { label: 'حذف مسابقة', icon: '🗑️', color: 'red' },
  'question_created': { label: 'إضافة سؤال', icon: '❓', color: 'green' },
  'question_updated': { label: 'تحديث سؤال', icon: '✏️', color: 'yellow' },
  'question_deleted': { label: 'حذف سؤال', icon: '🗑️', color: 'red' },
  'submission_reviewed': { label: 'مراجعة إجابة', icon: '✓', color: 'green' },
  'bulk_review': { label: 'مراجعة جماعية', icon: '✓✓', color: 'green' },
  'wheel_spin': { label: 'دوران العجلة', icon: '🎡', color: 'purple' },
  'prize_awarded': { label: 'منح جائزة', icon: '🎁', color: 'green' },
  'settings_updated': { label: 'تحديث الإعدادات', icon: '⚙️', color: 'blue' },
  'user_created': { label: 'إضافة مستخدم', icon: '👤', color: 'green' },
  'user_updated': { label: 'تحديث مستخدم', icon: '✏️', color: 'yellow' },
  'user_deleted': { label: 'حذف مستخدم', icon: '🗑️', color: 'red' },
}

export default function AuditLog({ profile }: { profile: User }) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0, byAction: {} as Record<string, number> })
  const [actions, setActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<AuditFilters>({})
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadData()
  }, [filters, page])

  const loadData = async () => {
    try {
      const [logsData, statsData, actionsData] = await Promise.all([
        getAuditLogs(filters, page),
        getAuditStats(),
        getUniqueActions()
      ])
      setLogs(logsData.logs)
      setTotalPages(logsData.pages)
      setStats(statsData)
      setActions(actionsData)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs

    const query = searchQuery.toLowerCase()
    return logs.filter(log =>
      log.user?.username?.toLowerCase().includes(query) ||
      log.user?.display_name?.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      JSON.stringify(log.details).toLowerCase().includes(query)
    )
  }, [logs, searchQuery])

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportAuditLogs(filters)
      
      const headers = ['التاريخ', 'المستخدم', 'الإجراء', 'التفاصيل']
      const rows = data.map((log: any) => [
        new Date(log.created_at).toLocaleString('ar-SA'),
        log.user?.display_name || log.user?.username || 'غير معروف',
        ACTION_LABELS[log.action]?.label || log.action,
        JSON.stringify(log.details, null, 2)
      ])

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error: any) {
      alert(error?.message || 'فشل تصدير السجل')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">سجل التدقيق</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (selectedLog) {
    return (
      <LogDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">سجل التدقيق</h1>
          <p className="text-neutral-600 mt-1">تتبع جميع الإجراءات والتغييرات في النظام</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span>📥</span>
          {exporting ? 'جاري التصدير...' : 'تصدير CSV'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.total}</div>
          <div className="text-sm text-neutral-600">إجمالي السجلات</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 bg-blue-50">
          <div className="text-3xl font-bold text-blue-700 mb-1">{stats.today}</div>
          <div className="text-sm text-blue-700">اليوم</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 bg-green-50">
          <div className="text-3xl font-bold text-green-700 mb-1">{stats.thisWeek}</div>
          <div className="text-sm text-green-700">هذا الأسبوع</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 bg-purple-50">
          <div className="text-3xl font-bold text-purple-700 mb-1">{Object.keys(stats.byAction).length}</div>
          <div className="text-sm text-purple-700">أنواع الإجراءات</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">🔍 البحث</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في السجلات..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">📋 نوع الإجراء</label>
            <select
              value={filters.action || ''}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action]?.label || action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">📅 من تاريخ</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={e => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">📅 إلى تاريخ</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={e => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(filters.action || filters.date_from || filters.date_to) && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setFilters({})}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد سجلات</h2>
          <p className="text-neutral-600">
            {searchQuery ? 'لا توجد نتائج تطابق البحث' : 'لا توجد سجلات تطابق الفلاتر المحددة'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">التاريخ والوقت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">المستخدم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الإجراء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">التفاصيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredLogs.map(log => {
                  const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: '📝', color: 'neutral' }
                  
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        <div>{new Date(log.created_at).toLocaleDateString('ar-SA')}</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                            {(log.user?.display_name || log.user?.username || '؟')[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {log.user?.display_name || log.user?.username || 'غير معروف'}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {log.user?.role === 'CEO' ? 'مدير تنفيذي' :
                               log.user?.role === 'LRC_MANAGER' ? 'مدير مسابقة' : 'طالب'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-${actionInfo.color}-100 text-${actionInfo.color}-700`}>
                          <span>{actionInfo.icon}</span>
                          {actionInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                        <div className="truncate">
                          {JSON.stringify(log.details).substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          عرض
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="text-sm text-neutral-600">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function LogDetailsModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: '📝', color: 'neutral' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">تفاصيل السجل</h1>
          <p className="text-neutral-600 mt-1">معلومات تفصيلية عن الإجراء</p>
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
        <div className={`bg-gradient-to-r from-${actionInfo.color}-600 to-${actionInfo.color}-700 p-8 text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{actionInfo.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{actionInfo.label}</h2>
              <p className="text-sm opacity-90">
                {new Date(log.created_at).toLocaleString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">المستخدم</h3>
            <div className="bg-neutral-50 rounded-lg p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg">
                {(log.user?.display_name || log.user?.username || '؟')[0]}
              </div>
              <div>
                <div className="font-medium text-neutral-900">
                  {log.user?.display_name || log.user?.username || 'غير معروف'}
                </div>
                <div className="text-sm text-neutral-600">
                  {log.user?.username} • {
                    log.user?.role === 'CEO' ? 'مدير تنفيذي' :
                    log.user?.role === 'LRC_MANAGER' ? 'مدير مسابقة' : 'طالب'
                  }
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">التفاصيل</h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">معلومات إضافية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-xs text-neutral-600 mb-1">معرف السجل</div>
                <div className="text-sm font-mono text-neutral-900">{log.id}</div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-xs text-neutral-600 mb-1">معرف المستخدم</div>
                <div className="text-sm font-mono text-neutral-900">{log.user_id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
