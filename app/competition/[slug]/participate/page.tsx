import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { readCompetitions } from '@/lib/store/readWrite'
import ParticipateClient from './ParticipateClient'

interface Competition {
  id: string
  slug: string
  title: string
  status: 'draft' | 'active' | 'archived'
}

export default async function ParticipatePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const competitions = (await readCompetitions()) as Competition[]
  const competition = competitions.find((c) => c.slug === slug)

  if (!competition) {
    notFound()
  }

  const isStudent = session.role === 'student'

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {competition.title}
          </h1>

          <div className="mb-8">
            <p className="text-gray-700 text-lg mb-6">
              مرحباً بك في المسابقة. قبل البدء، يرجى قراءة التعليمات التالية بعناية.
            </p>

            <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>التوثيق إلزامي</span>
              </h2>
              <p className="text-amber-800 font-semibold">
                يجب توثيق كل إجابة بـ: الجزء + الصفحة + السطر
              </p>
            </div>

            {!isStudent && (
              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-6">
                <p className="text-blue-800 font-semibold">
                  أنت تشاهد هذه الصفحة كـ {session.role === 'ceo' ? 'مدير تنفيذي' : 'مدير مركز'}. 
                  لا يمكنك المشاركة في المسابقة.
                </p>
              </div>
            )}
          </div>

          {isStudent ? (
            <ParticipateClient slug={slug} competitionTitle={competition.title} />
          ) : (
            <div className="text-center">
              <a
                href="/dashboard"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                العودة للوحة التحكم
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
