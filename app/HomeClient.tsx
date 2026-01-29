'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import RulesBanner from '@/components/RulesBanner'
import LiveStats from '@/components/LiveStats'
import QuestionsPreview from '@/components/QuestionsPreview'
import WheelTeaser from '@/components/WheelTeaser'
import ArchivedCompetitions from '@/components/ArchivedCompetitions'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import type { Competition, Question } from '@/lib/store/types'

interface HomeClientProps {
  activeCompetition: Competition | null
  questions: Question[]
}

export default function HomeClient({ activeCompetition, questions }: HomeClientProps) {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    // Check localStorage for lock status
    const lockStatus = localStorage.getItem('pageLocked')
    if (lockStatus === 'true') {
      setIsLocked(true)
    }

    // Expose global functions for console
    (window as any).WLock = () => {
      setIsLocked(true)
      localStorage.setItem('pageLocked', 'true')
    }
    
    (window as any).WUnlock = () => {
      setIsLocked(false)
      localStorage.setItem('pageLocked', 'false')
    }
  }, [])

  return (
    <>
      <main className="min-h-screen relative flex flex-col">
        <Header />
        <Hero activeCompetition={activeCompetition} />
        <HowItWorks />
        <RulesBanner />
        <LiveStats />
        <QuestionsPreview questions={questions} />
        <WheelTeaser />
        <ArchivedCompetitions />
        <Footer />
        <ScrollToTop />
      </main>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-8 border-secondary/30 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">انتظر من فضلك</h2>
            <p className="text-xl text-white/80">الصفحة مقفلة مؤقتاً</p>
            <p className="text-sm text-white/60 mt-2">سيتم فتحها قريباً</p>
          </div>
        </div>
      )}
    </>
  )
}
