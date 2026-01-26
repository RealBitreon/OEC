'use client'

import type { Competition, Question, Winner } from '@/lib/store/types'

interface ArchivesTabProps {
  competitions: Competition[]
  questions: Question[]
  winners: Winner[]
}

export default function ArchivesTab({ competitions, questions, winners }: ArchivesTabProps) {
  const archivedCompetitions = competitions.filter(c => c.status === 'archived')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">الإصدارات السابقة</h1>
        <p className="text-neutral-600">المسابقات المؤرشفة والفائزون</p>
      </div>

      {archivedCompetitions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد مسابقات مؤرشفة</h3>
          <p className="text-neutral-600">سيتم عرض المسابقات المنتهية هنا</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedCompetitions.map(comp => {
            const compWinners = winners.filter(w => w.competitionId === comp.id)
            const compQuestions = questions.filter(q => q.competitionId === comp.id)

            return (
              <div key={comp.id} className="bg-white rounded-xl p-6 border border-neutral-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{comp.title}</h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      من {new Date(comp.startAt).toLocaleDateString('ar-OM')} إلى {new Date(comp.endAt).toLocaleDateString('ar-OM')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-semibold">
                    مؤرشفة
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="text-2xl mb-1">❓</div>
                    <div className="text-lg font-bold text-neutral-900">{compQuestions.length}</div>
                    <div className="text-sm text-neutral-600">أسئلة</div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-lg font-bold text-neutral-900">{compWinners.length}</div>
                    <div className="text-sm text-neutral-600">فائزون</div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-lg font-bold text-neutral-900">{comp.rules?.eligibility?.minCorrect || (comp.rules as any)?.minCorrect || 0}</div>
                    <div className="text-sm text-neutral-600">حد أدنى</div>
                  </div>
                </div>

                {compWinners.length > 0 && (
                  <div className="border-t border-neutral-200 pt-4">
                    <h4 className="font-bold text-neutral-900 mb-2">الفائزون:</h4>
                    <div className="flex flex-wrap gap-2">
                      {compWinners.map((w, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          🏆 {w.winnerUsername}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
