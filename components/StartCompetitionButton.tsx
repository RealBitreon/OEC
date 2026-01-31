'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateFingerprint } from '@/lib/utils/device-fingerprint'

interface StartCompetitionButtonProps {
  competitionId?: string
  competitionSlug?: string
  className?: string
  children?: React.ReactNode
}

export default function StartCompetitionButton({
  competitionId,
  competitionSlug,
  className = 'btn-primary',
  children = 'ابدأ الإجابة على الأسئلة',
}: StartCompetitionButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      // If no competition provided, fetch active competition
      let targetCompetitionId = competitionId
      let targetSlug = competitionSlug

      if (!targetCompetitionId || !targetSlug) {
        const response = await fetch('/api/competitions/active')
        const data = await response.json()

        if (!data.competition) {
          setError('لا توجد مسابقة نشطة حالياً')
          setLoading(false)
          return
        }

        targetCompetitionId = data.competition.id
        targetSlug = data.competition.slug
      }

      // Get device fingerprint
      const deviceFingerprint = getOrCreateFingerprint()

      // Check if can attempt
      const checkResponse = await fetch('/api/attempts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: targetCompetitionId,
          deviceFingerprint,
        }),
      })

      const checkData = await checkResponse.json()

      if (!checkData.canAttempt) {
        setError(
          `لقد استنفدت جميع المحاولات المتاحة (${checkData.maxAttempts} محاولات). لا يمكنك المشاركة مرة أخرى.`
        )
        setLoading(false)
        return
      }

      // Show remaining attempts warning if less than max
      if (checkData.remainingAttempts < checkData.maxAttempts) {
        const confirmed = confirm(
          `لديك ${checkData.remainingAttempts} محاولة متبقية من أصل ${checkData.maxAttempts}. هل تريد المتابعة؟`
        )
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      // Redirect to competition questions
      router.push(`/competition/${targetSlug}/participate`)
    } catch (err) {
      console.error('Error starting competition:', err)
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-block">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'جاري التحميل...' : children}
      </button>
      {error && (
        <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
