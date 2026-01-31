'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CompetitionQuestions from './CompetitionQuestions'
import { getCompetitions } from '@/app/dashboard/actions/competitions'

export default function CompetitionQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [competitionId, setCompetitionId] = useState<string>('')
  const [competitionTitle, setCompetitionTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setCompetitionId(resolvedParams.id)
      
      // Load competition title
      try {
        const competitions = await getCompetitions()
        const competition = competitions.find(c => c.id === resolvedParams.id)
        if (competition) {
          setCompetitionTitle(competition.title)
        }
      } catch (error) {
        console.error('Failed to load competition:', error)
      } finally {
        setLoading(false)
      }
    }
    initParams()
  }, [params])

  if (loading || !competitionId) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(`/dashboard/competitions/${competitionId}`)}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <span>→</span>
        <span>العودة إلى المسابقة</span>
      </button>

      <CompetitionQuestions 
        competitionId={competitionId}
        competitionTitle={competitionTitle}
      />
    </div>
  )
}
