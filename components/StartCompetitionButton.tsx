'use client'

import { useRouter } from 'next/navigation'
import { getOrCreateFingerprint } from '@/lib/utils/device-fingerprint'
import { useAsyncOperation } from '@/lib/hooks/useAsyncOperation'
import { getErrorMessage } from '@/lib/utils/error-messages'

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
  const { loading, error, execute } = useAsyncOperation()

  const handleClick = async () => {
    await execute(async () => {
      // If no competition provided, fetch active competition
      let targetCompetitionId = competitionId
      let targetSlug = competitionSlug

      if (!targetCompetitionId || !targetSlug) {
        const response = await fetch('/api/competitions/active')
        const data = await response.json()

        if (!data.competition) {
          throw new Error('لا توجد مسابقة نشطة حالياً')
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
        throw new Error(
          `لقد استنفدت جميع المحاولات المتاحة (${checkData.maxAttempts} محاولات). لا يمكنك المشاركة مرة أخرى.`
        )
      }

      // Show remaining attempts warning if less than max
      if (checkData.remainingAttempts < checkData.maxAttempts) {
        const confirmed = confirm(
          `لديك ${checkData.remainingAttempts} محاولة متبقية من أصل ${checkData.maxAttempts}. هل تريد المتابعة؟`
        )
        if (!confirmed) {
          throw new Error('تم إلغاء العملية')
        }
      }

      // Redirect to competition questions
      const encodedSlug = encodeURIComponent(targetSlug)
      console.log('[START BUTTON] Redirecting to:', `/competition/${encodedSlug}/participate`)
      router.push(`/competition/${encodedSlug}/participate`)
    }, {
      onError: (err) => {
        console.error('Error starting competition:', err)
      },
      timeout: 15000
    })
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
          {getErrorMessage(error)}
        </div>
      )}
    </div>
  )
}
