import { redirect } from 'next/navigation'
import { BackButton } from '@/components'
import ParticipationForm from './ParticipationForm'
import { competitionsRepo, questionsRepo } from '@/lib/repos'
import { Icons } from '@/components/icons'

async function getCompetitionData(slug: string) {
  try {
    // Get competition by slug
    const competitions = await competitionsRepo.listAll()
    const competition = competitions.find((c: any) => c.slug === slug && c.status === 'active')
    
    if (!competition) {
      return null
    }
    
    // Get active questions for this competition
    const allQuestions = await questionsRepo.listAll()
    const repoQuestions = allQuestions.filter((q: any) => 
      q.competitionId === competition.id && 
      q.isActive !== false &&
      q.isTraining === false
    )
    
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
    console.error('Error loading competition:', error)
    return null
  }
}

export default async function CompetitionParticipatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCompetitionData(slug)
  
  if (!data) {
    redirect('/dashboard')
  }
  
  const { competition, questions } = data

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <BackButton fallbackUrl={`/dashboard/competition/${slug}`} label="العودة للمسابقة" />
      </div>
      
      <h1 className="text-4xl font-bold text-primary mb-4">المشاركة في: {competition.title}</h1>
      
      {questions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.warning className="w-10 h-10 " />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">لا توجد أسئلة</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            لم يتم إضافة أسئلة لهذه المسابقة بعد. يرجى المحاولة لاحقاً.
          </p>
        </div>
      ) : (
        <ParticipationForm 
          competition={competition} 
          questions={questions}
        />
      )}
    </div>
  )
}
