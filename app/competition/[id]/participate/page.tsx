import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BackButton } from '@/components'
import ParticipationForm from './ParticipationForm'
import { competitionsRepo, questionsRepo } from '@/lib/repos'
import Icons from '@/components/icons'

async function getCompetitionData(id: string) {
  try {
    console.log('[PARTICIPATE] Fetching competition for id/slug:', id)
    
    // Get all competitions and find by ID or slug
    const competitions = await competitionsRepo.listAll()
    const competition = competitions.find((c: any) => c.id === id || c.slug === id)
    
    if (!competition) {
      console.error('[PARTICIPATE] Competition not found for id/slug:', id)
      return null
    }
    
    console.log('[PARTICIPATE] Found competition:', competition.id, competition.title)
    
    // Get active questions for this competition
    const allQuestions = await questionsRepo.listAll()
    const repoQuestions = allQuestions.filter((q: any) => 
      q.competitionId === competition.id && 
      q.isActive !== false &&
      q.isTraining === false
    )
    
    console.log('[PARTICIPATE] Questions loaded:', repoQuestions.length)
    
    // Transform questions to match ParticipationForm expected format
    const questions = repoQuestions.map(q => ({
      id: q.id,
      type: q.type as 'mcq' | 'true_false' | 'text',
      question_text: q.questionText,
      options: q.options,
      correct_answer: q.correctAnswer,
      source_ref: q.sourceRef,
    }))
    
    return { competition, questions }
  } catch (error) {
    console.error('[PARTICIPATE] Error loading competition:', error)
    return null
  }
}

export default async function CompetitionParticipatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  console.log('[PARTICIPATE PAGE] Rendering with id:', id)
  
  const data = await getCompetitionData(id)
  
  if (!data) {
    console.error('[PARTICIPATE PAGE] No data returned, showing 404')
    // Show proper 404 instead of redirecting to home
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <BackButton fallbackUrl="/" label="العودة للرئيسية" />
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.warning className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">المسابقة غير موجودة</h2>
              <p className="text-neutral-600 mb-6">
                عذراً، لم نتمكن من العثور على المسابقة المطلوبة. قد تكون المسابقة قد انتهت أو تم إزالتها.
              </p>
              <a 
                href="/"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-button transition-all duration-200"
              >
                العودة للصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }
  
  const { competition, questions } = data

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton fallbackUrl={`/competition/${encodeURIComponent(competition.id)}`} label="العودة للمسابقة" />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">المشاركة في: {competition.title}</h1>
          
          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.warning className="w-10 h-10 " />
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">لا توجد أسئلة</h2>
              <p className="text-neutral-600">
                لم يتم إضافة أسئلة لهذه المسابقة بعد. يرجى المحاولة لاحقاً.
              </p>
            </div>
          ) : (
            <ParticipationForm 
              competition={{
                id: competition.id,
                title: competition.title,
                slug: competition.slug,
                endAt: competition.endAt,
                wheelSpinAt: competition.wheelSpinAt
              }} 
              questions={questions}
            />
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
