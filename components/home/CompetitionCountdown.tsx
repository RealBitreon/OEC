'use client'

import { useState, useEffect } from 'react'

interface CompetitionCountdownProps {
  endAt: string
}

export default function CompetitionCountdown({ endAt }: CompetitionCountdownProps) {
  const [mounted, setMounted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isEnded: boolean
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const end = new Date(endAt).getTime()
      const totalSeconds = Math.max(0, Math.floor((end - now) / 1000))

      if (totalSeconds === 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true
        }
      }

      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60

      return {
        days,
        hours,
        minutes,
        seconds,
        isEnded: false
      }
    }

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining())

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [endAt, mounted])

  if (!mounted || !timeRemaining) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-card p-6 md:p-8 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-white text-lg md:text-xl font-bold mb-4 text-center">
          الوقت المتبقي حتى نهاية المسابقة
        </h3>
        <div className="text-center text-white/70">
          جارٍ الحساب...
        </div>
      </div>
    )
  }

  if (timeRemaining.isEnded) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-card p-6 md:p-8 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            انتهت المسابقة
          </div>
          <p className="text-white/70 text-sm md:text-base">
            شكراً لمشاركتكم
          </p>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-card p-6 md:p-8 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      <h3 className="text-white text-lg md:text-xl font-bold mb-6 text-center">
        الوقت المتبقي حتى نهاية المسابقة
      </h3>
      
      <div className="flex justify-center gap-3 md:gap-4" dir="ltr">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-4xl font-bold text-white text-center">
              {formatNumber(timeRemaining.days)}
            </div>
          </div>
          <div className="text-white/80 text-xs md:text-sm mt-2 font-medium">
            يوم
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center pb-6">
          <span className="text-2xl md:text-4xl font-bold text-white/60">:</span>
        </div>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-4xl font-bold text-white text-center">
              {formatNumber(timeRemaining.hours)}
            </div>
          </div>
          <div className="text-white/80 text-xs md:text-sm mt-2 font-medium">
            ساعة
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center pb-6">
          <span className="text-2xl md:text-4xl font-bold text-white/60">:</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-4xl font-bold text-white text-center">
              {formatNumber(timeRemaining.minutes)}
            </div>
          </div>
          <div className="text-white/80 text-xs md:text-sm mt-2 font-medium">
            دقيقة
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center pb-6">
          <span className="text-2xl md:text-4xl font-bold text-white/60">:</span>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
            <div className="text-2xl md:text-4xl font-bold text-white text-center">
              {formatNumber(timeRemaining.seconds)}
            </div>
          </div>
          <div className="text-white/80 text-xs md:text-sm mt-2 font-medium">
            ثانية
          </div>
        </div>
      </div>
    </div>
  )
}
