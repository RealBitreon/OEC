'use client'

import { useEffect, useState } from 'react'
import { User } from '../../core/types'
import { getCompetitions } from '../../actions/competitions'
import { getEligibleStudents, lockSnapshot, runDraw, getWheelStatus, publishResults, resetWheel } from '../../actions/wheel'

export default function WheelManagement({ profile }: { profile: User }) {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [eligible, setEligible] = useState<any[]>([])
  const [wheelStatus, setWheelStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (selectedCompetition) {
      loadWheelData()
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

  const loadWheelData = async () => {
    if (!selectedCompetition) return
    
    setLoading(true)
    try {
      const [eligibleData, statusData] = await Promise.all([
        getEligibleStudents(selectedCompetition),
        getWheelStatus(selectedCompetition)
      ])
      setEligible(eligibleData)
      setWheelStatus(statusData)
    } catch (error) {
      console.error('Failed to load wheel data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLockSnapshot = async () => {
    if (!confirm('هل تريد قفل قائمة المرشحين؟ لن يمكن تعديلها بعد ذلك.')) return
    
    setProcessing(true)
    try {
      await lockSnapshot(selectedCompetition)
      await loadWheelData()
      alert('تم قفل القائمة بنجاح')
    } catch (error: any) {
      alert(error?.message || 'فشل قفل القائمة')
    } finally {
      setProcessing(false)
    }
  }

  const handleRunDraw = async () => {
    if (!confirm('هل تريد تنفيذ السحب الآن؟ لا يمكن التراجع عن هذا الإجراء.')) return
    
    setProcessing(true)
    try {
      const result = await runDraw(selectedCompetition)
      await loadWheelData()
      alert(`🎉 تم اختيار الفائز بنجاح!\n\nالفائز: ${result.winner.user.display_name || result.winner.user.username}\nعدد التذاكر: ${result.winner.totalTickets}\nالاحتمالية: ${result.winner.probability.toFixed(2)}%\n\nHash: ${result.metadata.drawHash.substring(0, 16)}...`)
    } catch (error: any) {
      alert('❌ ' + (error?.message || 'فشل تنفيذ السحب'))
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = async () => {
    const reason = prompt('⚠️ تحذير: إعادة تعيين العجلة ستحذف جميع البيانات!\n\nيرجى إدخال سبب إعادة التعيين (10 أحرف على الأقل):')
    if (!reason) return
    
    if (!confirm('هل أنت متأكد تماماً من إعادة تعيين العجلة؟ لا يمكن التراجع عن هذا الإجراء!')) return
    
    setProcessing(true)
    try {
      await resetWheel(selectedCompetition, reason)
      await loadWheelData()
      alert('✓ تم إعادة تعيين العجلة بنجاح')
    } catch (error: any) {
      alert('❌ ' + (error?.message || 'فشل إعادة التعيين'))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة عجلة الحظ</h1>
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
        <h1 className="text-3xl font-bold text-neutral-900">إدارة عجلة الحظ</h1>
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <span className="text-4xl mb-4 block">🎡</span>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقات</h2>
          <p className="text-neutral-600">قم بإنشاء مسابقة أولاً</p>
        </div>
      </div>
    )
  }

  const totalTickets = eligible.reduce((sum, e) => sum + e.totalTickets, 0)
  const competition = competitions.find(c => c.id === selectedCompetition)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة عجلة الحظ</h1>
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

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{eligible.length}</div>
          <div className="text-sm text-neutral-600">طلاب مؤهلون</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{totalTickets}</div>
          <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
        </div>
        <div className={`rounded-xl p-6 shadow-sm border ${wheelStatus ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="text-3xl font-bold mb-1" style={{ color: wheelStatus ? '#15803d' : '#a16207' }}>
            {wheelStatus ? '✓' : '○'}
          </div>
          <div className="text-sm" style={{ color: wheelStatus ? '#15803d' : '#a16207' }}>
            {wheelStatus ? 'تم القفل' : 'غير مقفل'}
          </div>
        </div>
        <div className={`rounded-xl p-6 shadow-sm border ${wheelStatus?.winner_id ? 'bg-blue-50 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="text-3xl font-bold mb-1" style={{ color: wheelStatus?.winner_id ? '#1e40af' : '#737373' }}>
            {wheelStatus?.winner_id ? '🏆' : '⏳'}
          </div>
          <div className="text-sm" style={{ color: wheelStatus?.winner_id ? '#1e40af' : '#737373' }}>
            {wheelStatus?.winner_id ? 'تم السحب' : 'لم يتم السحب'}
          </div>
        </div>
      </div>

      {/* Eligible Students Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">الطلاب المؤهلون</h2>
          {wheelStatus && (
            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {wheelStatus.locked_at ? `مقفل في ${new Date(wheelStatus.locked_at).toLocaleDateString('ar-SA')}` : 'غير مقفل'}
            </span>
          )}
        </div>
        
        {eligible.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-4 block">📋</span>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">لا يوجد طلاب مؤهلون</h3>
            <p className="text-neutral-600">لا يوجد طلاب حصلوا على تذاكر في هذه المسابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">التذاكر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">المصادر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">الاحتمالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {eligible.map((student, index) => (
                  <tr key={index} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {student.user.display_name || student.user.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {student.user.class || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                        {student.totalTickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {student.sources.map((s: any, i: number) => (
                        <div key={i} className="text-xs">
                          {s.reason}: {s.count}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {((student.totalTickets / totalTickets) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">إجراءات العجلة</h2>
        
        {!wheelStatus && eligible.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>الخطوة 1:</strong> قم بمراجعة قائمة الطلاب المؤهلين أعلاه، ثم اضغط على "قفل القائمة" لإنشاء نسخة ثابتة لا يمكن تعديلها.
              </p>
            </div>
            <button
              onClick={handleLockSnapshot}
              disabled={processing}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
            >
              {processing ? 'جاري القفل...' : '🔒 قفل قائمة المرشحين'}
            </button>
          </div>
        )}

        {wheelStatus && !wheelStatus.winner_id && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>الخطوة 2:</strong> تم قفل القائمة بنجاح. يمكنك الآن تنفيذ السحب لاختيار الفائز بشكل عشوائي مرجح حسب عدد التذاكر.
              </p>
            </div>
            <button
              onClick={handleRunDraw}
              disabled={processing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {processing ? 'جاري السحب...' : '🎡 تنفيذ السحب'}
            </button>
          </div>
        )}

        {wheelStatus?.winner_id && (
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-bold text-green-900 mb-3">🏆 تم اختيار الفائز</h3>
              <div className="space-y-2 mb-4">
                <p className="text-green-800">
                  <strong>الفائز:</strong> {wheelStatus.winner?.display_name || wheelStatus.winner?.username}
                </p>
                {wheelStatus.draw_metadata && (
                  <>
                    <p className="text-sm text-green-700">
                      <strong>عدد التذاكر:</strong> {eligible.find(e => e.user.id === wheelStatus.winner_id)?.totalTickets || 'N/A'}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Hash التحقق:</strong> <code className="bg-green-100 px-2 py-1 rounded text-xs">{wheelStatus.draw_metadata.draw_hash?.substring(0, 32)}...</code>
                    </p>
                  </>
                )}
                <p className="text-sm text-green-700">
                  <strong>تاريخ السحب:</strong> {new Date(wheelStatus.run_at).toLocaleString('ar-SA')}
                </p>
                {wheelStatus.is_published && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <span className="inline-flex items-center gap-2 text-sm text-green-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      منشور للعامة
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📢 إدارة نشر النتيجة
              </button>
              {profile.role === 'CEO' && (
                <button
                  onClick={handleReset}
                  disabled={processing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {processing ? 'جاري الإعادة...' : '🔄 إعادة تعيين العجلة'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showPublishModal && wheelStatus?.winner_id && (
        <PublishModal
          wheelStatus={wheelStatus}
          competitionId={selectedCompetition}
          onClose={() => {
            setShowPublishModal(false)
            loadWheelData()
          }}
        />
      )}
    </div>
  )
}

function PublishModal({ wheelStatus, competitionId, onClose }: any) {
  const [settings, setSettings] = useState({
    isPublished: wheelStatus.is_published || false,
    showWinnerName: wheelStatus.show_winner_name !== false,
    winnerDisplayName: wheelStatus.winner_display_name || '',
    announcementMessage: wheelStatus.announcement_message || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await publishResults(competitionId, settings)
      alert('تم حفظ الإعدادات بنجاح')
      onClose()
    } catch (error: any) {
      alert(error?.message || 'فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">إعدادات نشر النتيجة</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Publish Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isPublished}
                onChange={e => setSettings({ ...settings, isPublished: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-neutral-900">نشر النتيجة للعامة</div>
                <div className="text-sm text-neutral-600">عرض النتيجة في صفحة العجلة العامة</div>
              </div>
            </label>
          </div>

          {/* Winner Name Visibility */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showWinnerName}
                onChange={e => setSettings({ ...settings, showWinnerName: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-neutral-900">إظهار اسم الفائز</div>
                <div className="text-sm text-neutral-600">عرض الاسم الحقيقي للفائز</div>
              </div>
            </label>
          </div>

          {/* Display Name Override */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              اسم العرض البديل (اختياري)
            </label>
            <input
              type="text"
              value={settings.winnerDisplayName}
              onChange={e => setSettings({ ...settings, winnerDisplayName: e.target.value })}
              placeholder="مثال: الطالب المتميز"
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-600 mt-1">
              إذا تم تحديده، سيظهر هذا الاسم بدلاً من الاسم الحقيقي
            </p>
          </div>

          {/* Announcement Message */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              رسالة الإعلان (اختياري)
            </label>
            <textarea
              value={settings.announcementMessage}
              onChange={e => setSettings({ ...settings, announcementMessage: e.target.value })}
              placeholder="مثال: مبروك للفائز! نتمنى لك التوفيق..."
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-neutral-600 mt-1">
              رسالة تهنئة أو إعلان يظهر مع النتيجة
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-3">معاينة العرض العام:</div>
            {settings.isPublished ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900">
                  🏆 {settings.winnerDisplayName || (settings.showWinnerName 
                    ? (wheelStatus.winner?.display_name || wheelStatus.winner?.username)
                    : 'الفائز')}
                </div>
                {settings.announcementMessage && (
                  <p className="text-sm text-blue-700 italic">
                    "{settings.announcementMessage}"
                  </p>
                )}
                <div className="text-xs text-blue-600 mt-2">
                  ✓ سيتم عرض هذه المعلومات في صفحة العجلة العامة
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-neutral-600">النتيجة غير منشورة</div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
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
