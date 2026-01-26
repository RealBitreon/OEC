import { notFound } from 'next/navigation'
import { readQuestions } from '@/lib/store/readWrite'
import { getSession } from '@/lib/auth/session'
import QuestionPracticeClient from './QuestionPracticeClient'

export const metadata = {
  title: 'سؤال تدريبي - الموسوعة العُمانية',
}

interface Props {
  params: { id: string }
}

export default async function QuestionPracticePage({ params }: Props) {
  const { id } = params
  const allQuestions = await readQuestions()
  
  // Find the training question
  const question = allQuestions.find(
    (q: any) => q.id === id && q.isTraining === true && q.isActive === true && q.competitionId === null
  )

  if (!question) {
    notFound()
  }

  // Get session
  const session = await getSession()

  return (
    <QuestionPracticeClient
      question={question}
      isLoggedIn={!!session}
      username={session?.username}
    />
  )
}
