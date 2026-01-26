'use client'

import { useState } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition } from '@/lib/store/types'
import { createCompetition, updateCompetition, archiveCompetition, updateCompetitionTicketsSettings, updateCompetitionEligibilityRules, recalculateCompetitionTickets } from '../actions'

interface CompetitionsTabProps {
  session: SessionPayload
  competitions: Competition[]
  setCompetitions: (competitions: Competition[]) => void
}

export default function CompetitionsTab({ session, competitions, setCompetitions }: CompetitionsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTicketsModal, setShowTicketsModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateCompetition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      startAt: formData.get('startAt') as string,
      endAt: formData.get('endAt') as string,
      wheelSpinAt: formData.get('wheelSpinAt') as string,
      minCorrect: parseInt(formData.get('minCorrect') as string),
      eligibleMode: formData.get('eligibleMode') as 'all_correct' | 'min_correct',
      username: session.username
    }

    try {
      const result = await createCompetition(data)
      if (result.success) {
        setCompetitions(result.competitions!)
        setShowCreateModal(false)
        showToast('تم إنشاء المسابقة بنجاح', 'success')
        e.currentTarget.reset()
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الإنشاء', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (id: string) => {
    if (!confirm('هل تريد تفعيل هذه المسابقة؟ سيتم أرشفة المسابقة النشطة الحالية.')) return

    setLoading(true)
    try {
      const result = await updateCompetition(id, { status: 'active' })
      if (result.success) {
        setCompetitions(result.competitions!)
        showToast('تم تفعيل المسابقة بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في التفعيل', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('هل تريد أرشفة هذه المسابقة؟')) return

    setLoading(true)
    try {
      const result = await archiveCompetition(id)
      if (result.success) {
        setCompetitions(result.competitions!)
        showToast('تم أرشفة المسابقة بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الأرشفة', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTicketsSettings = (comp: Competition) => {
    setSelectedCompetition(comp)
    setShowTicketsModal(true)
  }

  const handleRecalculateTickets = async (competitionId: string) => {
    if (!confirm('هل تريد إعادة احتساب جميع التذاكر لهذه المسابقة؟')) return

    setLoading(true)
    try {
      const result = await recalculateCompetitionTickets(competitionId)
      if (result.success) {
        showToast(`تم إعادة الاحتساب: ${result.stats!.after} تذكرة (كان ${result.stats!.before})`, 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في إعادة الاحتساب', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTicketsSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCompetition) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const tiers = [
      {
        fromHours: 0,
        toHours: parseFloat(formData.get('tier1_to') as string),
        bonus: parseInt(formData.get('tier1_bonus') as string)
      },
      {
        fromHours: parseFloat(formData.get('tier1_to') as string),
        toHours: parseFloat(formData.get('tier2_to') as string),
        bonus: parseInt(formData.get('tier2_bonus') as string)
      },
      {
        fromHours: parseFloat(formData.get('tier2_to') as string),
        toHours: parseFloat(formData.get('tier3_to') as string),
        bonus: parseInt(formData.get('tier3_bonus') as string)
      },
      {
        fromHours: parseFloat(formData.get('tier3_to') as string),
        toHours: 99999,
        bonus: 0
      }
    ]

    const ticketsSettings = {
      basePerCorrect: parseInt(formData.get('basePerCorrect') as string),
      earlyBonusMode: formData.get('earlyBonusMode') as 'tiers' | 'none',
      tiers,
      publishedAt: formData.get('publishedAt') as string || undefined
    }

    try {
      const result = await updateCompetitionTicketsSettings(selectedCompetition.id, ticketsSettings)
      if (result.success) {
        setCompetitions(result.competitions!)
        showToast('تم حفظ إعدادات التذاكر بنجاح', 'success')
        setShowTicketsModal(false)
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الحفظ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEligibilityRules = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCompetition) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const eligibilityRules = {
      mode: formData.get('eligibilityMode') as 'all_correct' | 'min_correct',
      minCorrect: parseInt(formData.get('minCorrect') as string)
    }

    try {
      const result = await updateCompetitionEligibilityRules(selectedCompetition.id, eligibilityRules)
      if (result.success) {
        setCompetitions(result.competitions!)
        showToast('تم حفظ قواعد الأهلية بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ في الحفظ', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">المسابقات</h1>
          <p className="text-neutral-600">إدارة المسابقات والإصدارات</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg transition-all"
        >
          + إنشاء مسابقة جديدة
        </button>
      </div>

      {competitions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقات بعد</h3>
          <p className="text-neutral-600 mb-4">ابدأ بإنشاء أول مسابقة</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg transition-all"
          >
            إنشاء مسابقة
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {competitions.map(comp => (
            <div key={comp.id} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900">{comp.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      comp.status === 'active' ? 'bg-green-100 text-green-700' :
                      comp.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {comp.status === 'active' ? 'نشطة' : comp.status === 'draft' ? 'مسودة' : 'مؤرشفة'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    من {new Date(comp.startAt).toLocaleDateString('ar-OM')} إلى {new Date(comp.endAt).toLocaleDateString('ar-OM')}
                  </p>
                  <div className="flex gap-4 text-sm text-neutral-700">
                    <span>🎯 الحد الأدنى: {comp.rules?.eligibility?.minCorrect || (comp.rules as any)?.minCorrect || 0} إجابة صحيحة</span>
                    <span>🎡 السحب: {new Date(comp.wheelSpinAt).toLocaleDateString('ar-OM')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenTicketsSettings(comp)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    ⚙️ التذاكر
                  </button>
                  <button
                    onClick={() => handleRecalculateTickets(comp.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    🔄 إعادة احتساب
                  </button>
                  {comp.status === 'draft' && (
                    <button
                      onClick={() => handleActivate(comp.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      تفعيل
                    </button>
                  )}
                  {comp.status === 'active' && (
                    <button
                      onClick={() => handleArchive(comp.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      أرشفة
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">إنشاء مسابقة جديدة</h2>
            </div>
            <form onSubmit={handleCreateCompetition} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">عنوان المسابقة</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مسابقة الموسوعة العُمانية - يناير 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">تاريخ البدء</label>
                  <input
                    type="date"
                    name="startAt"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    name="endAt"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">موعد السحب</label>
                <input
                  type="date"
                  name="wheelSpinAt"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">نظام الأهلية</label>
                <select
                  name="eligibleMode"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="min_correct">حد أدنى من الإجابات الصحيحة</option>
                  <option value="all_correct">جميع الإجابات صحيحة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">الحد الأدنى للإجابات الصحيحة</label>
                <input
                  type="number"
                  name="minCorrect"
                  min="1"
                  defaultValue="10"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء المسابقة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold z-50`}>
          {toast.message}
        </div>
      )}

      {/* Tickets Settings Modal */}
      {showTicketsModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">إعدادات التذاكر - {selectedCompetition.title}</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Eligibility Rules */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">قواعد الأهلية</h3>
                <form onSubmit={handleSaveEligibilityRules} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">نظام الأهلية</label>
                    <select
                      name="eligibilityMode"
                      defaultValue={selectedCompetition.rules?.eligibility?.mode || 'min_correct'}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="min_correct">حد أدنى من الإجابات الصحيحة</option>
                      <option value="all_correct">جميع الإجابات صحيحة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">الحد الأدنى للإجابات الصحيحة</label>
                    <input
                      type="number"
                      name="minCorrect"
                      min="1"
                      defaultValue={selectedCompetition.rules?.eligibility?.minCorrect || 10}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    حفظ قواعد الأهلية
                  </button>
                </form>
              </div>

              {/* Tickets Settings */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">نظام التذاكر</h3>
                <form onSubmit={handleSaveTicketsSettings} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">تاريخ النشر (مرجع المكافأة المبكرة)</label>
                    <input
                      type="datetime-local"
                      name="publishedAt"
                      defaultValue={selectedCompetition.publishedAt ? new Date(selectedCompetition.publishedAt).toISOString().slice(0, 16) : ''}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <p className="text-xs text-gray-600 mt-1">اتركه فارغًا لاستخدام تاريخ الإنشاء</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">التذاكر الأساسية لكل إجابة صحيحة</label>
                    <input
                      type="number"
                      name="basePerCorrect"
                      min="1"
                      defaultValue={selectedCompetition.rules?.tickets?.basePerCorrect || 1}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">نظام المكافأة المبكرة</label>
                    <select
                      name="earlyBonusMode"
                      defaultValue={selectedCompetition.rules?.tickets?.earlyBonusMode || 'tiers'}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="tiers">مستويات (Tiers)</option>
                      <option value="none">بدون مكافأة</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">مستويات المكافأة المبكرة</h4>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-700">
                      <span>من (ساعة)</span>
                      <span>إلى (ساعة)</span>
                      <span>مكافأة</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value="0" disabled className="px-3 py-2 rounded border bg-gray-100" />
                      <input type="number" name="tier1_to" defaultValue="24" className="px-3 py-2 rounded border" />
                      <input type="number" name="tier1_bonus" defaultValue="3" className="px-3 py-2 rounded border" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value="24" disabled className="px-3 py-2 rounded border bg-gray-100" />
                      <input type="number" name="tier2_to" defaultValue="72" className="px-3 py-2 rounded border" />
                      <input type="number" name="tier2_bonus" defaultValue="2" className="px-3 py-2 rounded border" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value="72" disabled className="px-3 py-2 rounded border bg-gray-100" />
                      <input type="number" name="tier3_to" defaultValue="120" className="px-3 py-2 rounded border" />
                      <input type="number" name="tier3_bonus" defaultValue="1" className="px-3 py-2 rounded border" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" value="120" disabled className="px-3 py-2 rounded border bg-gray-100" />
                      <input type="number" value="∞" disabled className="px-3 py-2 rounded border bg-gray-100" />
                      <input type="number" value="0" disabled className="px-3 py-2 rounded border bg-gray-100" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'جاري الحفظ...' : 'حفظ إعدادات التذاكر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTicketsModal(false)}
                      className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
