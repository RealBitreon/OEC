'use client'

import { useState, useEffect } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, WheelRun, Winner } from '@/lib/store/types'
import { lockSnapshot, runDraw } from '../actions'

interface WheelTabProps {
  session: SessionPayload
  competitions: Competition[]
  submissions: any[]
  winners: Winner[]
  setWinners: (winners: Winner[]) => void
}

export default function WheelTab({ session, competitions, submissions, winners, setWinners }: WheelTabProps) {
  const [loading, setLoading] = useState(false)
  const [wheelRun, setWheelRun] = useState<WheelRun | null>(null)
  const [eligiblePreview, setEligiblePreview] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const activeCompetition = competitions.find(c => c.status === 'active')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load wheel run on mount
  useEffect(() => {
    if (activeCompetition) {
      loadWheelRun()
    }
  }, [activeCompetition?.id])

  const loadWheelRun = async () => {
    if (!activeCompetition) return
    
    try {
      const response = await fetch(`/api/wheel/status?competitionId=${activeCompetition.id}`)
      const data = await response.json()
      
      if (data.wheelRun) {
        setWheelRun(data.wheelRun)
      }
      if (data.eligiblePreview) {
        setEligiblePreview(data.eligiblePreview)
      }
    } catch (error) {
      console.error('Error loading wheel run:', error)
    }
  }

  const handleLockSnapshot = async () => {
    if (!activeCompetition) return
    if (!confirm('هل تريد قفل قائمة المرشحين؟ لا يمكن التراجع عن هذا الإجراء.')) return

    setLoading(true)
    try {
      const result = await lockSnapshot(activeCompetition.id)
      if (result.success) {
        setWheelRun(result.wheelRun!)
        showToast('تم قفل المرشحين بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في القفل', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRunDraw = async () => {
    if (!wheelRun) return
    if (!confirm('هل تريد تشغيل السحب الآن؟ لا يمكن التراجع عن هذا الإجراء.')) return

    setLoading(true)
    try {
      const result = await runDraw(wheelRun.id)
      if (result.success) {
        setWheelRun(result.wheelRun!)
        showToast('تم السحب بنجاح!', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في السحب', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExportWinners = (format: 'csv' | 'json') => {
    const url = `/api/export/winners?format=${format}`
    window.open(url, '_blank')
  }

  if (!activeCompetition) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">عجلة الحظ</h1>
          <p className="text-neutral-600">إدارة السحب واختيار الفائزين</p>
        </div>

        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">🎡</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقة نشطة</h3>
          <p className="text-neutral-600">قم بتفعيل مسابقة أولاً</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">عجلة الحظ</h1>
          <p className="text-neutral-600">إدارة السحب واختيار الفائزين</p>
        </div>
        {(session.role === 'ceo' || session.role === 'lrc_manager') && winners.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExportWinners('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              تصدير الفائزين CSV
            </button>
            <button
              onClick={() => handleExportWinners('json')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              تصدير الفائزين JSON
            </button>
          </div>
        )}
      </div>

      {/* Competition Info */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">{activeCompetition.title}</h2>
        <div className="text-sm text-neutral-600 space-y-1">
          <div>موعد السحب: {new Date(activeCompetition.wheelSpinAt).toLocaleString('ar-OM')}</div>
          <div>الحالة: {wheelRun ? (wheelRun.status === 'done' ? '✅ تم السحب' : '🔒 مقفل') : '⏳ لم يتم القفل'}</div>
        </div>
      </div>

      {/* Preview Eligibility (before lock) */}
      {!wheelRun && eligiblePreview && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">معاينة المرشحين المؤهلين</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{eligiblePreview.eligibleCount}</div>
              <div className="text-sm text-neutral-600">طالب مؤهل</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{eligiblePreview.totalTickets}</div>
              <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{eligiblePreview.totalCandidates}</div>
              <div className="text-sm text-neutral-600">إجمالي المشاركين</div>
            </div>
          </div>

          {eligiblePreview.topCandidates && eligiblePreview.topCandidates.length > 0 && (
            <div>
              <h4 className="font-bold text-neutral-900 mb-3">أعلى المرشحين (حسب التذاكر)</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {eligiblePreview.topCandidates.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-neutral-400">#{idx + 1}</span>
                      <span className="font-medium text-neutral-900">{c.studentUsername}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-600">{c.tickets} تذكرة</span>
                      {c.eligible ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600 text-xs">غير مؤهل</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLockSnapshot}
            disabled={loading || eligiblePreview.eligibleCount === 0}
            className="w-full mt-6 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'جاري القفل...' : '🔒 قفل قائمة المرشحين'}
          </button>
        </div>
      )}

      {/* Locked Snapshot */}
      {wheelRun && wheelRun.status === 'ready' && (
        <div className="bg-white rounded-xl p-6 border-2 border-yellow-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">تم قفل المرشحين</h3>
              <p className="text-sm text-neutral-600">
                تم القفل بواسطة {wheelRun.lockedBy} في {new Date(wheelRun.lockedAt).toLocaleString('ar-OM')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{wheelRun.candidatesSnapshot.length}</div>
              <div className="text-sm text-neutral-600">مرشح مقفل</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{wheelRun.totalTickets}</div>
              <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-neutral-900 mb-3">المرشحون المقفولون</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wheelRun.candidatesSnapshot.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="font-medium text-neutral-900">{c.studentUsername}</span>
                  <span className="text-sm text-neutral-600">{c.tickets} تذكرة</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunDraw}
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-primary-dark font-bold px-6 py-4 rounded-lg transition-all disabled:opacity-50 text-lg"
          >
            {loading ? 'جاري السحب...' : '🎲 تشغيل السحب'}
          </button>
        </div>
      )}

      {/* Winner Result */}
      {wheelRun && wheelRun.status === 'done' && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-green-500 text-center">
          <div className="text-8xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold text-green-600 mb-2">الفائز</h3>
          <p className="text-5xl font-bold text-neutral-900 mb-4">{wheelRun.winnerUsername}</p>
          <div className="text-neutral-600 space-y-1">
            <div>تم السحب في: {new Date(wheelRun.runAt!).toLocaleString('ar-OM')}</div>
            <div>من بين {wheelRun.candidatesSnapshot.length} مرشح ({wheelRun.totalTickets} تذكرة)</div>
            <div className="text-sm">رقم التذكرة الفائزة: {wheelRun.winnerTicketIndex}</div>
          </div>
        </div>
      )}

      {/* Previous Winners */}
      {winners.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">الفائزون السابقون</h3>
          <div className="space-y-3">
            {winners.slice(-5).reverse().map((w, idx) => {
              const comp = competitions.find(c => c.id === w.competitionId)
              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="font-bold text-neutral-900">{w.winnerUsername}</div>
                    <div className="text-sm text-neutral-600">{comp?.title || 'مسابقة'}</div>
                    <div className="text-xs text-neutral-500">{new Date(w.runAt).toLocaleDateString('ar-OM')}</div>
                  </div>
                  <span className="text-3xl">🏆</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold z-50 animate-pulse`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
