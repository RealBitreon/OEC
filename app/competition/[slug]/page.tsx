import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readCompetitions, readWinners } from '@/lib/store/readWrite'
import { getWheelRunForCompetition } from '@/lib/competition/wheel'
import type { Competition, Winner } from '@/lib/store/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function CompetitionLandingPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const competitions = (await readCompetitions()) as Competition[]
  const competition = competitions.find((c: Competition) => c.slug === slug)

  if (!competition) {
    notFound()
  }

  const winners = (await readWinners()) as Winner[]
  const winner = winners.find((w: Winner) => w.competitionId === competition.id)
  const wheelRun = await getWheelRunForCompetition(competition.id)

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'نشطة', color: 'bg-green-100 text-green-800' },
      archived: { text: 'مؤرشفة', color: 'bg-gray-100 text-gray-800' },
      draft: { text: 'قادمة', color: 'bg-blue-100 text-blue-800' }
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  const badge = getStatusBadge(competition.status)

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-24 md:py-32">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{competition.title}</h1>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.color}`}>
                  {badge.text}
                </span>
              </div>

              {/* Winner Display (if archived and has winner) */}
              {competition.status === 'archived' && winner && (
                <div className="mb-8 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6 text-center">
                  <div className="text-5xl mb-3">🏆</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">الفائز</h2>
                  <div className="text-4xl font-bold text-primary mb-2">{winner.winnerUsername}</div>
                  <div className="text-sm text-neutral-600">
                    {new Date(winner.runAt).toLocaleDateString('ar-OM')}
                  </div>
                  {wheelRun && (
                    <div className="mt-4">
                      <Link 
                        href={`/competition/${slug}/wheel`}
                        className="btn-primary inline-block"
                      >
                        🎡 شاهد عجلة السحب
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Stats (if archived and has wheel run) */}
              {competition.status === 'archived' && wheelRun && (
                <div className="mb-8 grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{wheelRun.candidatesSnapshot.length}</div>
                    <div className="text-sm text-neutral-600">مرشح مؤهل</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{wheelRun.totalTickets}</div>
                    <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {new Date(wheelRun.runAt!).toLocaleDateString('ar-OM', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-sm text-neutral-600">تاريخ السحب</div>
                  </div>
                </div>
              )}

              <div className="mb-6 text-neutral-600 space-y-2">
                <p>
                  <span className="font-semibold">📅 تاريخ البداية:</span>{' '}
                  {new Date(competition.startAt).toLocaleDateString('ar-OM')}
                </p>
                <p>
                  <span className="font-semibold">📅 تاريخ النهاية:</span>{' '}
                  {new Date(competition.endAt).toLocaleDateString('ar-OM')}
                </p>
                <p>
                  <span className="font-semibold">🎡 موعد السحب:</span>{' '}
                  {new Date(competition.wheelSpinAt).toLocaleDateString('ar-OM')}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-neutral-900 mb-3">القواعد والشروط</h2>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-neutral-700">
                  <div>
                    <span className="font-semibold">شروط الأهلية:</span>{' '}
                    {competition.rules.eligibility.mode === 'all_correct' 
                      ? 'يجب الإجابة على جميع الأسئلة بشكل صحيح'
                      : `يجب الإجابة على ${competition.rules.eligibility.minCorrect} سؤال على الأقل بشكل صحيح`
                    }
                  </div>
                  <div>
                    <span className="font-semibold">نظام التذاكر:</span>{' '}
                    {competition.rules.tickets.basePerCorrect} تذكرة لكل إجابة صحيحة
                    {competition.rules.tickets.earlyBonusMode === 'tiers' && ' + مكافآت الإجابة المبكرة'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                {competition.status === 'active' && (
                  <>
                    <Link
                      href={`/competition/${slug}/participate`}
                      className="btn-primary flex-1 text-center min-w-[200px]"
                    >
                      🎯 ابدأ المشاركة
                    </Link>
                    <Link
                      href={`/competition/${slug}/questions`}
                      className="btn-secondary flex-1 text-center min-w-[200px]"
                    >
                      📝 الأسئلة
                    </Link>
                  </>
                )}

                {competition.status === 'archived' && wheelRun && (
                  <Link
                    href={`/competition/${slug}/wheel`}
                    className="btn-primary flex-1 text-center min-w-[200px]"
                  >
                    🎡 شاهد عجلة السحب
                  </Link>
                )}

                {competition.status === 'draft' && (
                  <div className="flex-1 bg-neutral-100 text-neutral-600 px-6 py-3 rounded-lg font-semibold text-center min-w-[200px]">
                    المسابقة لم تبدأ بعد
                  </div>
                )}

                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
