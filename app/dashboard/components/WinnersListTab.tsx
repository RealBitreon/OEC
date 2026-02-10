'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'

interface Winner {
  id: string
  participant_name: string
  participant_email?: string
  first_name?: string
  father_name?: string
  family_name?: string
  grade?: string
  score: number
  total_questions: number
  tickets_earned?: number
  submitted_at: string
  reviewed_at: string
}

interface Props {
  competitionId: string
  competitionTitle?: string
}

export function WinnersListTab({ competitionId, competitionTitle }: Props) {
  const { showToast } = useToast()
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const abortControllerRef = useState(() => new AbortController())[0]

  useEffect(() => {
    loadWinners()

    // Cleanup: abort fetch on unmount
    return () => {
      abortControllerRef.abort()
    }
  }, [competitionId])

  const loadWinners = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/competitions/${competitionId}/winners`, {
        signal: abortControllerRef.signal
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('صلاحيات غير كافية')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل جلب الفائزين')
      }

      const data = await response.json()
      setWinners(data.data || [])
    } catch (err: any) {
      if (err.name === 'AbortError') return // Ignore abort errors
      console.error('Error loading winners:', err)
      setError(err.message || 'حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeWinner = async (winnerId: string, participantName: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء فوز ${participantName}؟\n\nسيتم إعادة حالة الطالب إلى "قيد المراجعة".`)) {
      return
    }

    setRevoking(winnerId)
    try {
      const response = await fetch(`/api/winners/${winnerId}/revoke`, {
        method: 'POST'
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('صلاحيات غير كافية - هذا الإجراء متاح للمدير التنفيذي فقط')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل إلغاء الفوز')
      }

      showToast('تم إلغاء الفوز بنجاح', 'success')
      loadWinners() // Reload list
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setRevoking(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-bold text-green-900">🏆 الفائزون المعتمدون</h3>
          {competitionTitle && (
            <p className="text-sm text-green-700 mt-1">المسابقة: {competitionTitle}</p>
          )}
        </div>
        <TableSkeleton rows={5} columns={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-bold text-green-900">🏆 الفائزون المعتمدون</h3>
          {competitionTitle && (
            <p className="text-sm text-green-700 mt-1">المسابقة: {competitionTitle}</p>
          )}
        </div>
        <ErrorState
          message={error}
          onRetry={loadWinners}
        />
      </div>
    )
  }

  if (winners.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="font-bold text-green-900">🏆 الفائزون المعتمدون</h3>
          {competitionTitle && (
            <p className="text-sm text-green-700 mt-1">المسابقة: {competitionTitle}</p>
          )}
        </div>
        <EmptyState
          icon="🏆"
          title="لا يوجد فائزون حتى الآن"
          description="لم يتم اعتماد أي فائزين لهذه المسابقة بعد"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-green-900">🏆 الفائزون المعتمدون</h3>
            {competitionTitle && (
              <p className="text-sm text-green-700 mt-1">المسابقة: {competitionTitle}</p>
            )}
          </div>
          <div className="text-2xl font-bold text-green-900">{winners.length}</div>
        </div>
      </div>

      {/* Winners Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">المشارك</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">البريد</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الدرجة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">التذاكر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">تاريخ الاعتماد</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {winners.map((winner) => (
                <tr key={winner.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">
                      {winner.participant_name}
                    </div>
                    {winner.grade && (
                      <div className="text-xs text-neutral-500">
                        الصف: {winner.grade}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-neutral-700">
                      {winner.participant_email || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-neutral-900">
                      {winner.score} / {winner.total_questions}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-blue-900">
                      {winner.tickets_earned || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-neutral-600">
                      {formatDate(winner.reviewed_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => handleRevokeWinner(winner.id, winner.participant_name)}
                      disabled={revoking === winner.id}
                      variant="danger"
                      size="sm"
                      title="إلغاء الفوز (CEO/Manager فقط)"
                    >
                      {revoking === winner.id ? '⏳' : '❌ إلغاء'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>ملاحظة:</strong> يمكن إلغاء فوز أي طالب من قبل المدير التنفيذي فقط. سيتم إعادة حالة الطالب إلى "قيد المراجعة" ويمكن مراجعته مرة أخرى.
        </p>
      </div>
    </div>
  )
}
