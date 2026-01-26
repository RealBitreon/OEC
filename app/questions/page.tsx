import { readQuestions } from '@/lib/store/readWrite'
import QuestionsIndexClient from './QuestionsIndexClient'

export const metadata = {
  title: 'الأسئلة التدريبية - الموسوعة العُمانية',
  description: 'تدرّب على الأسئلة بدون ضغط المسابقة',
}

export default async function QuestionsPage() {
  const allQuestions = await readQuestions()
  
  // Filter training questions only
  const trainingQuestions = allQuestions.filter(
    (q: any) => q.isTraining === true && q.isActive === true && q.competitionId === null
  )

  return <QuestionsIndexClient questions={trainingQuestions} />
}
