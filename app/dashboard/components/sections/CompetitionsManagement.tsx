'use client'

// ============================================
// COMPETITIONS MANAGEMENT (LRC + CEO)
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { User, Competition } from '../../core/types'
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition, activateCompetition } from '../../actions/competitions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'


interface CompetitionsManagementProps {
  profile: User
}

export default function CompetitionsManagement({ profile }: CompetitionsManagementProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { showToast } = useToast()

  const { data: competitions = [], isLoading: loading } = useQuery({
    queryKey: ['competitions'],
    queryFn: getCompetitions,
    staleTime: 30 * 1000,
  })

  const activateMutation = useMutation({
    mutationFn: activateCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => updateCompetition(id, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      queryClient.invalidateQueries({ queryKey: ['overview-stats'] })
    },
  })

  const handleCreate = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleActivate = async (id: string) => {
    if (!confirm('هل تريد تفعيل هذه المسابقة؟ سيتم أرشفة المسابقة النشطة الحالية.')) return
    
    try {
      await activateMutation.mutateAsync(id)
      alert('تم تفعيل المسابقة بنجاح')
    } catch (error) {
      alert('فشل تفعيل المسابقة')
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('هل تريد أرشفة هذه المسابقة؟')) return
    
    try {
      await archiveMutation.mutateAsync(id)
      alert('تم أرشفة المسابقة بنجاح')
    } catch (error) {
      alert('فشل أرشفة المسابقة')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه المسابقة؟ سيتم نقل الأسئلة إلى التدريب.')) return
    
    try {
      await deleteMutation.mutateAsync(id)
      alert('تم حذف المسابقة بنجاح')
    } catch (error) {
      alert('فشل حذف المسابقة')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إدارة المسابقات</h1>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <CompetitionForm
        competitionId={editingId}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
          queryClient.invalidateQueries({ queryKey: ['competitions'] })
          queryClient.invalidateQueries({ queryKey: ['overview-stats'] })
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">إدارة المسابقات</h1>
        <Button
          onClick={handleCreate}
          variant="primary"
          size="lg"
        >
          + إنشاء مسابقة جديدة
        </Button>
      </div>

      {/* Competitions List */}
      {competitions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 shadow-sm border border-neutral-200 dark:border-neutral-700 text-center">
          <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.trophy className="w-10 h-10 " />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            لا توجد مسابقات
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            ابدأ بإنشاء مسابقة جديدة
          </p>
          <Button
            onClick={handleCreate}
            variant="primary"
            size="lg"
          >
            إنشاء مسابقة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {competitions.map(competition => (
            <div
              key={competition.id}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {competition.title}
                    </h3>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${competition.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      ${competition.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${competition.status === 'archived' ? 'bg-neutral-100 text-neutral-700' : ''}
                    `}>
                      {getStatusLabel(competition.status)}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {competition.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                    <span>📅 {new Date(competition.start_at).toLocaleDateString('ar-SA')}</span>
                    <span>→</span>
                    <span>📅 {new Date(competition.end_at).toLocaleDateString('ar-SA')}</span>
                    <span>🎡 {new Date(competition.wheel_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push(`/dashboard/competitions/${competition.id}`)}
                  variant="primary"
                  size="sm"
                >
                  عرض المسابقة
                </Button>
                <Button
                  onClick={() => handleEdit(competition.id)}
                  variant="secondary"
                  size="sm"
                >
                  تعديل
                </Button>
                {competition.status === 'draft' && (
                  <Button
                    onClick={() => handleActivate(competition.id)}
                    variant="primary"
                    size="sm"
                  >
                    تفعيل
                  </Button>
                )}
                {competition.status === 'active' && (
                  <Button
                    onClick={() => handleArchive(competition.id)}
                    variant="outline"
                    size="sm"
                  >
                    أرشفة
                  </Button>
                )}
                {competition.status === 'archived' && (
                  <Button
                    onClick={() => router.push(`/dashboard/competitions/${competition.id}/migrate-training`)}
                    variant="secondary"
                    size="sm"
                  >
                    📚 نقل إلى التدريب
                  </Button>
                )}
                {profile.role === 'CEO' && (
                  <Button
                    onClick={() => handleDelete(competition.id)}
                    variant="danger"
                    size="sm"
                  >
                    حذف
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompetitionForm({ competitionId, onClose }: { competitionId: string | null, onClose: () => void }) {
  // FIXED: Add localStorage persistence to prevent data loss
  const DRAFT_KEY = `draft:competition:${competitionId || 'new'}`
  
  const [formData, setFormData] = useState(() => {
    // Try to restore from localStorage first (only for new competitions)
    if (!competitionId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved draft:', e)
        }
      }
    }
    
    // Default values
    return {
      title: '',
      description: '',
      status: 'draft' as 'draft' | 'active' | 'archived',
      start_at: '',
      end_at: '',
      wheel_at: '',
      rules: {
        eligibilityMode: 'all_correct' as 'all_correct' | 'min_correct' | 'per_correct',
        minCorrectAnswers: 5,
        ticketsPerCorrect: 1,
        earlyBonusTiers: [] as Array<{ cutoffDate: string; bonusTickets: number }>,
      }
    }
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!competitionId)
  const [showRulesConfig, setShowRulesConfig] = useState(false)

  // FIXED: Auto-save draft to localStorage on every change (only for new competitions)
  useEffect(() => {
    if (!competitionId && typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    }
  }, [formData, DRAFT_KEY, competitionId])

  useEffect(() => {
    if (competitionId) {
      // Load competition data
      loadCompetition()
    } else {
      // Set defaults
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + 30)

      setFormData({
        title: '',
        description: '',
        status: 'draft',
        start_at: today.toISOString().split('T')[0],
        end_at: endDate.toISOString().split('T')[0],
        wheel_at: endDate.toISOString().split('T')[0], // السحب في نفس يوم الانتهاء
        rules: {
          eligibilityMode: 'all_correct',
          minCorrectAnswers: 5,
          ticketsPerCorrect: 1,
          earlyBonusTiers: [],
        }
      })
    }
  }, [competitionId])

  const loadCompetition = async () => {
    try {
      const competitions = await getCompetitions()
      const competition = competitions.find(c => c.id === competitionId)
      
      if (competition) {
        setFormData({
          title: competition.title,
          description: competition.description,
          status: competition.status,
          start_at: competition.start_at.split('T')[0],
          end_at: competition.end_at.split('T')[0],
          wheel_at: competition.wheel_at.split('T')[0],
          rules: {
            eligibilityMode: competition.rules?.eligibilityMode || 'all_correct',
            minCorrectAnswers: competition.rules?.minCorrectAnswers || 5,
            ticketsPerCorrect: competition.rules?.ticketsPerCorrect || 1,
            earlyBonusTiers: competition.rules?.earlyBonusTiers || [],
          }
        })
      }
    } catch (error) {
      console.error('Failed to load competition:', error)
      alert('فشل تحميل بيانات المسابقة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate dates
      const startDate = new Date(formData.start_at)
      const endDate = new Date(formData.end_at)

      if (startDate >= endDate) {
        alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
        setSaving(false)
        return
      }

      // Ensure wheel_at is same as end_at (automatic draw on end date)
      const updatedFormData = {
        ...formData,
        wheel_at: formData.end_at // السحب تلقائياً في نفس يوم الانتهاء
      }

      if (competitionId) {
        await updateCompetition(competitionId, updatedFormData)
      } else {
        await createCompetition(updatedFormData)
      }
      
      // FIXED: Clear draft from localStorage after successful save
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY)
      }
      
      onClose()
    } catch (error: any) {
      alert(error?.message || 'فشل حفظ المسابقة')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">جاري التحميل...</h1>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {competitionId ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة'}
        </h1>
        <Button
          onClick={onClose}
          variant="secondary"
        >
          إلغاء
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            عنوان المسابقة *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="مثال: مسابقة القرآن الكريم - رمضان 1446"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            الوصف *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="وصف المسابقة وشروطها..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              تاريخ البداية *
            </label>
            <input
              type="date"
              required
              value={formData.start_at}
              onChange={e => setFormData({ ...formData, start_at: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              تاريخ النهاية * <span className="text-xs text-neutral-600">(سيتم السحب تلقائياً في نفس اليوم)</span>
            </label>
            <input
              type="date"
              required
              value={formData.end_at}
              onChange={e => {
                // Set both end_at and wheel_at to the same date
                setFormData({ 
                  ...formData, 
                  end_at: e.target.value,
                  wheel_at: e.target.value // السحب في نفس يوم الانتهاء
                })
              }}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-blue-600">
              💡 سيتم السحب على الجوائز تلقائياً في نفس يوم انتهاء المسابقة
            </p>
          </div>
        </div>

        {/* Rules Configuration */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900">قواعد الأهلية والتذاكر</h3>
            <Button
              type="button"
              onClick={() => setShowRulesConfig(!showRulesConfig)}
              variant="ghost"
              size="sm"
            >
              {showRulesConfig ? 'إخفاء' : 'عرض'} التفاصيل
            </Button>
          </div>

          {showRulesConfig && (
            <div className="space-y-6 bg-neutral-50 p-6 rounded-lg">
              {/* Eligibility Mode */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-3">
                  نظام الأهلية *
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                    style={{ borderColor: formData.rules.eligibilityMode === 'all_correct' ? '#2563eb' : '#d4d4d8' }}>
                    <input
                      type="radio"
                      name="eligibilityMode"
                      value="all_correct"
                      checked={formData.rules.eligibilityMode === 'all_correct'}
                      onChange={e => setFormData({
                        ...formData,
                        rules: { ...formData.rules, eligibilityMode: 'all_correct' }
                      })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">الخيار أ - القاعدة الصارمة</div>
                      <div className="text-sm text-neutral-600">فقط الطلاب الذين يجيبون على جميع الأسئلة بشكل صحيح يدخلون العجلة</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                    style={{ borderColor: formData.rules.eligibilityMode === 'min_correct' ? '#2563eb' : '#d4d4d8' }}>
                    <input
                      type="radio"
                      name="eligibilityMode"
                      value="min_correct"
                      checked={formData.rules.eligibilityMode === 'min_correct'}
                      onChange={e => setFormData({
                        ...formData,
                        rules: { ...formData.rules, eligibilityMode: 'min_correct' }
                      })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">الخيار ب - القاعدة المرنة</div>
                      <div className="text-sm text-neutral-600 mb-3">يجب على الطلاب الإجابة على الأقل على X أسئلة بشكل صحيح</div>
                      {formData.rules.eligibilityMode === 'min_correct' && (
                        <input
                          type="number"
                          min="1"
                          value={formData.rules.minCorrectAnswers}
                          onChange={e => setFormData({
                            ...formData,
                            rules: { ...formData.rules, minCorrectAnswers: parseInt(e.target.value) || 1 }
                          })}
                          className="w-32 px-3 py-2 border border-neutral-300 rounded-lg"
                          placeholder="5"
                        />
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                    style={{ borderColor: formData.rules.eligibilityMode === 'per_correct' ? '#2563eb' : '#d4d4d8' }}>
                    <input
                      type="radio"
                      name="eligibilityMode"
                      value="per_correct"
                      checked={formData.rules.eligibilityMode === 'per_correct'}
                      onChange={e => setFormData({
                        ...formData,
                        rules: { ...formData.rules, eligibilityMode: 'per_correct' }
                      })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">تذاكر لكل إجابة صحيحة</div>
                      <div className="text-sm text-neutral-600">كل إجابة صحيحة تمنح تذاكر إضافية</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tickets Configuration */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  عدد التذاكر الأساسية *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.rules.ticketsPerCorrect}
                  onChange={e => setFormData({
                    ...formData,
                    rules: { ...formData.rules, ticketsPerCorrect: parseInt(e.target.value) || 1 }
                  })}
                  className="w-32 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-neutral-600 mt-1">
                  {formData.rules.eligibilityMode === 'per_correct' 
                    ? 'عدد التذاكر لكل إجابة صحيحة'
                    : 'عدد التذاكر عند تحقيق الأهلية'}
                </p>
              </div>

              {/* Early Bonus Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-neutral-900">
                    مكافأة التقديم المبكر (اختياري)
                  </label>
                  <Button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        earlyBonusTiers: [
                          ...formData.rules.earlyBonusTiers,
                          { cutoffDate: formData.start_at, bonusTickets: 1 }
                        ]
                      }
                    })}
                    variant="ghost"
                    size="sm"
                  >
                    + إضافة مستوى
                  </Button>
                </div>
                {formData.rules.earlyBonusTiers.length > 0 && (
                  <div className="space-y-3">
                    {formData.rules.earlyBonusTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">تاريخ القطع</label>
                            <input
                              type="date"
                              value={tier.cutoffDate}
                              onChange={e => {
                                const newTiers = [...formData.rules.earlyBonusTiers]
                                newTiers[index].cutoffDate = e.target.value
                                setFormData({
                                  ...formData,
                                  rules: { ...formData.rules, earlyBonusTiers: newTiers }
                                })
                              }}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">تذاكر إضافية</label>
                            <select
                              value={tier.bonusTickets}
                              onChange={e => {
                                const newTiers = [...formData.rules.earlyBonusTiers]
                                newTiers[index].bonusTickets = parseInt(e.target.value) || 1
                                setFormData({
                                  ...formData,
                                  rules: { ...formData.rules, earlyBonusTiers: newTiers }
                                })
                              }}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                            >
                              <option value="1">1 تذكرة</option>
                              <option value="2">2 تذكرة</option>
                              <option value="3">3 تذاكر</option>
                              <option value="5">5 تذاكر</option>
                              <option value="10">10 تذاكر</option>
                              <option value="15">15 تذكرة</option>
                              <option value="20">20 تذكرة</option>
                              <option value="25">25 تذكرة</option>
                              <option value="50">50 تذكرة</option>
                            </select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const newTiers = formData.rules.earlyBonusTiers.filter((_, i) => i !== index)
                            setFormData({
                              ...formData,
                              rules: { ...formData.rules, earlyBonusTiers: newTiers }
                            })
                          }}
                          variant="danger"
                          size="sm"
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            disabled={saving}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="lg"
            disabled={saving}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    active: 'نشطة',
    archived: 'مؤرشفة',
  }
  return labels[status] || status
}
