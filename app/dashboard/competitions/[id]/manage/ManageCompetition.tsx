'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Competition, User } from '@/app/dashboard/core/types'
import { updateCompetition, archiveCompetition } from '@/app/dashboard/actions/competitions'

interface ManageCompetitionProps {
  competition: Competition
  profile: User
}

export default function ManageCompetition({ competition: initialCompetition, profile }: ManageCompetitionProps) {
  const router = useRouter()
  const [competition, setCompetition] = useState(initialCompetition)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCompetition(competition.id, competition)
      alert('تم حفظ التغييرات بنجاح')
      router.push(`/dashboard/competitions/${competition.id}`)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('فشل حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('هل تريد أرشفة هذه المسابقة؟')) return

    try {
      await archiveCompetition(competition.id)
      router.push('/dashboard/competitions')
    } catch (error) {
      console.error('Failed to archive:', error)
      alert('فشل أرشفة المسابقة')
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(`/dashboard/competitions/${competition.id}`)}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <span>→</span>
        <span>العودة إلى المسابقة</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">إدارة المسابقة</h1>
        {profile.role === 'CEO' && (
          <button
            onClick={handleArchive}
            className="px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            أرشفة المسابقة
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            عنوان المسابقة *
          </label>
          <input
            type="text"
            value={competition.title}
            onChange={e => setCompetition({ ...competition, title: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            الوصف *
          </label>
          <textarea
            value={competition.description}
            onChange={e => setCompetition({ ...competition, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            الحالة *
          </label>
          <select
            value={competition.status}
            onChange={e => setCompetition({ ...competition, status: e.target.value as any })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">مسودة</option>
            <option value="active">نشطة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              تاريخ البداية *
            </label>
            <input
              type="datetime-local"
              value={competition.start_at.slice(0, 16)}
              onChange={e => setCompetition({ ...competition, start_at: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              تاريخ النهاية *
            </label>
            <input
              type="datetime-local"
              value={competition.end_at.slice(0, 16)}
              onChange={e => setCompetition({ ...competition, end_at: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              موعد السحب *
            </label>
            <input
              type="datetime-local"
              value={competition.wheel_at.slice(0, 16)}
              onChange={e => setCompetition({ ...competition, wheel_at: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            عدد المحاولات المسموحة *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="4"
              value={competition.max_attempts || 2}
              onChange={e => setCompetition({ ...competition, max_attempts: parseInt(e.target.value) })}
              className="w-32 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="text-sm text-neutral-600">
              (من 1 إلى 4 محاولات - الافتراضي: 2)
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            💡 يحدد عدد المرات التي يمكن للطالب المشاركة فيها من نفس الجهاز/المتصفح
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">قواعد الأهلية</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                نظام الأهلية *
              </label>
              <select
                value={competition.rules.eligibilityMode}
                onChange={e => setCompetition({
                  ...competition,
                  rules: { ...competition.rules, eligibilityMode: e.target.value as any }
                })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all_correct">جميع الإجابات صحيحة</option>
                <option value="min_correct">الحد الأدنى من الإجابات الصحيحة</option>
                <option value="per_correct">تذاكر لكل إجابة صحيحة</option>
              </select>
            </div>

            {competition.rules.eligibilityMode === 'min_correct' && (
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  الحد الأدنى من الإجابات الصحيحة *
                </label>
                <input
                  type="number"
                  min="1"
                  value={competition.rules.minCorrectAnswers || 1}
                  onChange={e => setCompetition({
                    ...competition,
                    rules: { ...competition.rules, minCorrectAnswers: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {competition.rules.eligibilityMode === 'per_correct' && (
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  عدد التذاكر لكل إجابة صحيحة *
                </label>
                <input
                  type="number"
                  min="1"
                  value={competition.rules.ticketsPerCorrect || 1}
                  onChange={e => setCompetition({
                    ...competition,
                    rules: { ...competition.rules, ticketsPerCorrect: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            onClick={() => router.push(`/dashboard/competitions/${competition.id}`)}
            className="px-6 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
