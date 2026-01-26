'use client'

import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, Submission, Winner } from '@/lib/store/types'
import Link from 'next/link'

interface OverviewTabProps {
  session: SessionPayload
  competitions: Competition[]
  submissions: Submission[]
  winners: Winner[]
}

export default function OverviewTab({ session, competitions, submissions, winners }: OverviewTabProps) {
  const activeCompetition = competitions.find(c => c.status === 'active')
  const isStudent = session.role === 'student'

  const stats = {
    totalCompetitions: competitions.length,
    activeCompetitions: competitions.filter(c => c.status === 'active').length,
    totalSubmissions: submissions.length,
    pendingReviews: submissions.filter(s => s.finalResult === 'pending').length,
    totalWinners: winners.length
  }

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">مرحباً، {session.username}</h1>
          <p className="text-neutral-600">لوحة تحكم الطالب</p>
        </div>

        {activeCompetition ? (
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">{activeCompetition.title}</h2>
                <p className="text-sm text-neutral-600">
                  من {new Date(activeCompetition.startAt).toLocaleDateString('ar-OM')} إلى {new Date(activeCompetition.endAt).toLocaleDateString('ar-OM')}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                نشطة
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-neutral-700">
                <span>🎯</span>
                <span>الحد الأدنى للإجابات الصحيحة: {activeCompetition.rules?.eligibility?.minCorrect || (activeCompetition.rules as any)?.minCorrect || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <span>🎡</span>
                <span>موعد السحب: {new Date(activeCompetition.wheelSpinAt).toLocaleDateString('ar-OM')}</span>
              </div>
            </div>

            <Link
              href="/questions"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg transition-all"
            >
              ابدأ المشاركة
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقة نشطة حالياً</h3>
            <p className="text-neutral-600">سيتم الإعلان عن المسابقة القادمة قريباً</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">
              {submissions.filter(s => s.studentUsername === session.username).length}
            </div>
            <div className="text-sm text-neutral-600">إجاباتي</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {submissions.filter(s => s.studentUsername === session.username && s.finalResult === 'correct').length}
            </div>
            <div className="text-sm text-neutral-600">إجابات صحيحة</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">نظرة عامة</h1>
        <p className="text-neutral-600">ملخص النظام والإحصائيات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.totalCompetitions}</div>
          <div className="text-sm text-neutral-600">إجمالي المسابقات</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.activeCompetitions}</div>
          <div className="text-sm text-neutral-600">مسابقات نشطة</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-neutral-900 mb-1">{stats.totalSubmissions}</div>
          <div className="text-sm text-neutral-600">إجمالي الإجابات</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pendingReviews}</div>
          <div className="text-sm text-neutral-600">بانتظار المراجعة</div>
        </div>
      </div>

      {activeCompetition && (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">المسابقة النشطة</h2>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-neutral-900 mb-2">{activeCompetition.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">تاريخ البدء:</span>
                <div className="font-semibold">{new Date(activeCompetition.startAt).toLocaleDateString('ar-OM')}</div>
              </div>
              <div>
                <span className="text-neutral-600">تاريخ الانتهاء:</span>
                <div className="font-semibold">{new Date(activeCompetition.endAt).toLocaleDateString('ar-OM')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!activeCompetition && (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقة نشطة</h3>
          <p className="text-neutral-600 mb-4">ابدأ بإنشاء مسابقة جديدة</p>
        </div>
      )}
    </div>
  )
}
