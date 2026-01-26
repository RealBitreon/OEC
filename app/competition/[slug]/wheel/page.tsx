import { notFound } from 'next/navigation'
import { readCompetitions } from '@/lib/store/readWrite'
import { getWheelRunForCompetition } from '@/lib/competition/wheel'
import type { Competition } from '@/lib/store/types'
import WheelPageClient from './WheelPageClient'

export default async function CompetitionWheelPage({ params }: { params: { slug: string } }) {
  const competitions = await readCompetitions() as Competition[]
  const competition = competitions.find((c: Competition) => c.slug === params.slug)
  
  if (!competition) {
    notFound()
  }
  
  const wheelRun = await getWheelRunForCompetition(competition.id)
  
  return <WheelPageClient competition={competition} wheelRun={wheelRun} />
}
