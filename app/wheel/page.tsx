'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WheelSpinner from './WheelSpinner'

export default function WheelPage() {
  const [competition, setCompetition] = useState<any>(null)
  const [wheelRun, setWheelRun] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWheelData()
  }, [])

  const loadWheelData = async () => {
    try {
      // Fetch active competition
      const compRes = await fetch('/api/competitions/active')
      const compData = await compRes.json()
      
      if (compData.competition) {
        setCompetition(compData.competition)
        
        // Fetch wheel run
        const wheelRes = await fetch(`/api/wheel/public?competitionId=${compData.competition.id}`)
        const wheelData = await wheelRes.json()
        
        if (wheelData.wheelRun) {
          setWheelRun(wheelData.wheelRun)
        }
      }
    } catch (error) {
      console.error('Error loading wheel data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🎡</div>
          <p className="text-neutral-600">جاري التحميل...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light pt-24 md:pt-32 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-secondary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="section-container relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            العودة للرئيسية
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-6xl md:text-8xl mb-6">🎡</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              عجلة الحظ
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              شاهد السحب المباشر وتعرّف على الفائزين
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 flex-1">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            {!competition ? (
              <NoActiveCompetition />
            ) : !wheelRun ? (
              <NotLockedYet competition={competition} />
            ) : wheelRun.status === 'ready' ? (
              <LockedNotRun wheelRun={wheelRun} competition={competition} />
            ) : (
              <WheelComplete wheelRun={wheelRun} competition={competition} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function NoActiveCompetition() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center bg-gradient-to-br from-neutral-100 to-neutral-50"
    >
      <div className="text-8xl mb-6">🎡</div>
      <h2 className="text-3xl font-bold text-neutral-900 mb-4">
        لا توجد مسابقة نشطة حالياً
      </h2>
      <p className="text-lg text-neutral-600 mb-8">
        تابع الإعلانات في المدرسة لمعرفة موعد المسابقة القادمة
      </p>
      <Link href="/" className="btn-primary inline-block">
        العودة للرئيسية
      </Link>
    </motion.div>
  )
}

function NotLockedYet({ competition }: { competition: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
    >
      <div className="text-8xl mb-6">⏳</div>
      <h2 className="text-3xl font-bold text-primary mb-4">
        لم يتم قفل المرشحين بعد
      </h2>
      <p className="text-lg text-neutral-700 mb-6">
        السحب سيتم في الموعد المحدد
      </p>
      
      <div className="bg-white rounded-xl p-6 mb-8 inline-block">
        <div className="text-sm text-neutral-600 mb-2">موعد السحب المتوقع</div>
        <div className="text-2xl font-bold text-primary">
          {new Date(competition.wheelSpinAt).toLocaleDateString('ar-OM', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <p className="text-neutral-600 mb-8">
        تابع هذه الصفحة للحصول على التحديثات
      </p>

      <Link href="/questions" className="btn-primary inline-block">
        ابدأ الإجابة على الأسئلة
      </Link>
    </motion.div>
  )
}

function LockedNotRun({ wheelRun, competition }: { wheelRun: any; competition: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400">
        <div className="text-8xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          تم قفل المرشحين — السحب قريباً
        </h2>
        <p className="text-lg text-neutral-700 mb-6">
          تم تحديد قائمة المرشحين النهائية
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-primary">{wheelRun.candidatesSnapshot.length}</div>
            <div className="text-sm text-neutral-600">مرشح مؤهل</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{wheelRun.totalTickets}</div>
            <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-600">
              {new Date(competition.wheelSpinAt).toLocaleDateString('ar-OM', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-sm text-neutral-600">موعد السحب</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 text-sm text-neutral-600">
          <div>تم القفل في: {new Date(wheelRun.lockedAt).toLocaleString('ar-OM')}</div>
        </div>
      </div>

      {/* Idle Wheel Animation */}
      <div className="card bg-white">
        <h3 className="text-xl font-bold text-neutral-900 mb-4 text-center">عجلة الحظ</h3>
        <WheelSpinner 
          candidates={wheelRun.candidatesSnapshot}
          status="idle"
        />
      </div>
    </motion.div>
  )
}

function WheelComplete({ wheelRun, competition }: { wheelRun: any; competition: any }) {
  const [showReplay, setShowReplay] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Winner Card */}
      <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          الفائز
        </h2>
        <div className="bg-white rounded-2xl p-8 mb-6 inline-block min-w-[300px]">
          <div className="text-5xl font-bold text-primary mb-2">
            {wheelRun.winnerUsername}
          </div>
          <div className="text-sm text-neutral-600">
            تم السحب في {new Date(wheelRun.runAt).toLocaleDateString('ar-OM')}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl font-bold text-primary">{wheelRun.candidatesSnapshot.length}</div>
            <div className="text-sm text-neutral-600">مرشح</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{wheelRun.totalTickets}</div>
            <div className="text-sm text-neutral-600">تذكرة</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600">#{wheelRun.winnerTicketIndex}</div>
            <div className="text-sm text-neutral-600">التذكرة الفائزة</div>
          </div>
        </div>
      </div>

      {/* Wheel Replay */}
      <div className="card bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900">عجلة الحظ</h3>
          <button
            onClick={() => setShowReplay(!showReplay)}
            className="btn-secondary text-sm"
          >
            {showReplay ? '⏸️ إيقاف' : '▶️ إعادة السحب'}
          </button>
        </div>
        <WheelSpinner 
          candidates={wheelRun.candidatesSnapshot}
          status={showReplay ? 'spinning' : 'done'}
          winnerUsername={wheelRun.winnerUsername}
          winnerTicketIndex={wheelRun.winnerTicketIndex}
        />
      </div>

      {/* Competition Info */}
      <div className="card bg-neutral-50">
        <h3 className="text-lg font-bold text-neutral-900 mb-3">{competition.title}</h3>
        <div className="text-sm text-neutral-600 space-y-1">
          <div>📅 تاريخ السحب: {new Date(wheelRun.runAt).toLocaleString('ar-OM')}</div>
          <div>🔒 تم القفل: {new Date(wheelRun.lockedAt).toLocaleString('ar-OM')}</div>
          <div>👤 بواسطة: {wheelRun.lockedBy}</div>
        </div>
      </div>
    </motion.div>
  )
}
