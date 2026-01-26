'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ParticipateClient({
  slug,
  competitionTitle
}: {
  slug: string
  competitionTitle: string
}) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreed) {
      alert('يرجى الموافقة على الشروط للمتابعة')
      return
    }

    setIsSubmitting(true)
    
    // Optional: Save participation record
    try {
      await fetch('/api/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
    } catch (error) {
      console.error('Error saving participation:', error)
    }

    // Redirect to questions
    router.push(`/competition/${slug}/questions`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span className="text-gray-700 text-lg group-hover:text-gray-900">
            أتعهد بالالتزام بالتوثيق وعدم استخدام أدوات الذكاء الاصطناعي
          </span>
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!agreed || isSubmitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جاري التحميل...' : 'ابدأ الإجابة على الأسئلة'}
        </button>

        <a
          href={`/competition/${slug}`}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          رجوع
        </a>
      </div>
    </form>
  )
}
