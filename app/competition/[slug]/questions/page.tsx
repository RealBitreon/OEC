import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { readCompetitions, readQuestions, readSubmissions } from '@/lib/store/readWrite'
import { getStudentTickets, checkEligibility } from '@/lib/competition/tickets'
import QuestionsClient from './QuestionsClient'

interface Competition {
  id: string
  slug: string
  title: string
  status: 'draft' | 'active' | 'archived'
}

interface Question {
  id: string
  competitionId: string
  title: string
  body: string
  type: 'text' | 'true_false' | 'mcq'
  correctAnswer?: string
  options?: string[]
  isActive: boolean
}

interface Submission {
  id: string
  questionId: string
  competitionId: string
  studentUsername: string
  answer: string
  documentation: {
    part: string
    page: string
    lineFrom: string
    lineTo: string
    firstWord: string
    lastWord: string
  }
  autoResult: 'correct' | 'incorrect' | 'pending'
  submittedAt: string
}

export default async function QuestionsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'student') {
    redirect('/dashboard')
  }

  const competitions = (await readCompetitions()) as Competition[]
  const competition = competitions.find((c) => c.slug === slug)

  if (!competition) {
    notFound()
  }

  if (competition.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              انتهت فترة المشاركة
            </h1>
            <p className="text-gray-600 mb-6">
              عذراً، هذه المسابقة غير نشطة حالياً
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              العودة للوحة التحكم
            </a>
          </div>
        </div>
      </div>
    )
  }

  const allQuestions = (await readQuestions()) as Question[]
  const questions = allQuestions.filter(
    (q) => q.competitionId === competition.id && q.isActive
  )

  const allSubmissions = (await readSubmissions()) as Submission[]
  const existingSubmissions = allSubmissions.filter(
    (s) => s.studentUsername === session.username
  )

  // Get student tickets and eligibility
  const totalTickets = await getStudentTickets(competition.id, session.username)
  const eligibility = await checkEligibility(competition.id, session.username)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.title}</h1>
          <p className="text-gray-600">أجب على الأسئلة التالية مع التوثيق الكامل</p>
        </div>

        {/* Tickets and Eligibility Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-r-4 border-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">تذاكرك الحالية</div>
              <div className="text-3xl font-bold text-blue-600">🎫 {totalTickets}</div>
              <div className="text-xs text-gray-500 mt-1">كل إجابة صحيحة تزيد فرصك في الفوز</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">حالة الأهلية</div>
              <div className={`text-lg font-bold ${eligibility.eligible ? 'text-green-600' : 'text-orange-600'}`}>
                {eligibility.eligible ? '✅ مؤهل للسحب' : '⏳ غير مؤهل بعد'}
              </div>
              <div className="text-xs text-gray-500 mt-1">{eligibility.reason}</div>
            </div>
          </div>
        </div>

        <QuestionsClient
          questions={questions}
          existingSubmissions={existingSubmissions}
          studentUsername={session.username}
          competitionId={competition.id}
        />
      </div>
    </div>
  )
}
