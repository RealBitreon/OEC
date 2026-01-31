'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import StartCompetitionButton from '@/components/StartCompetitionButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WheelSpinner from './WheelSpinner'
import { BackButton } from '@/components'
import Icons from '@/components/icons'

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
      
      if (!compRes.ok) {
        console.warn('No active competition')
        setLoading(false)
        return
      }
      
      const compData = await compRes.json()
      
      if (compData.competition) {
        setCompetition(compData.competition)
        
        // Fetch wheel run
        const wheelRes = await fetch(`/api/wheel/public?competitionId=${compData.competition.id}`)
        
        if (wheelRes.ok) {
          const wheelData = await wheelRes.json()
          
          if (wheelData.wheelRun && wheelData.wheelRun.is_published) {
            setWheelRun(wheelData.wheelRun)
          }
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
          <div className="mb-4">
            <BackButton 
              fallbackUrl="/"
              label="العودة للرئيسية"
              className="text-white/80 hover:text-white text-sm font-medium"
            />
          </div>

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
      <div className="mb-6"><Icons.clock className="w-24 h-24" /></div>
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

      <StartCompetitionButton className="btn-primary inline-block" />
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
        <div className="mb-6"><Icons.lock className="w-24 h-24" /></div>
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
  
  // Determine display name
  const displayName = wheelRun.winner_display_name || 
    (wheelRun.show_winner_name !== false 
      ? (wheelRun.winner?.display_name || wheelRun.winner?.username)
      : 'الفائز')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Winner Card */}
      <div className="card text-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-400 shadow-xl">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="text-8xl mb-6"
        ><Icons.trophy className="w-6 h-6" /></motion.div>
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          مبروك للفائز!
        </h2>
        <div className="bg-white rounded-2xl p-8 mb-6 inline-block min-w-[300px] shadow-lg border-2 border-green-200">
          <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {displayName}
          </div>
          <div className="text-sm text-neutral-600 mt-3">
            🎉 تم السحب في {new Date(wheelRun.run_at).toLocaleDateString('ar-SA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        {wheelRun.announcement_message && (
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 mb-6 max-w-2xl mx-auto border border-green-200">
            <p className="text-lg text-neutral-700 italic">
              "{wheelRun.announcement_message}"
            </p>
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-primary">{wheelRun.locked_snapshot?.length || 0}</div>
            <div className="text-sm text-neutral-600">مرشح مؤهل</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-green-600">
              {wheelRun.locked_snapshot?.reduce((sum: number, e: any) => sum + e.totalTickets, 0) || 0}
            </div>
            <div className="text-sm text-neutral-600">إجمالي التذاكر</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-blue-600">
              {wheelRun.draw_metadata?.winner_ticket_index !== undefined 
                ? `#${wheelRun.draw_metadata.winner_ticket_index}` 
                : '✓'}
            </div>
            <div className="text-sm text-neutral-600">التذكرة الفائزة</div>
          </div>
        </div>
      </div>

      {/* Wheel Replay */}
      <div className="card bg-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900">🎡 عجلة الحظ</h3>
          <button
            onClick={() => setShowReplay(!showReplay)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {showReplay ? '⏸️ إيقاف' : '▶️ إعادة السحب'}
          </button>
        </div>
        <WheelSpinner 
          candidates={wheelRun.locked_snapshot?.map((e: any) => ({
            studentUsername: e.user.display_name || e.user.username,
            tickets: e.totalTickets
          })) || []}
          status={showReplay ? 'spinning' : 'done'}
          winnerUsername={displayName}
          winnerTicketIndex={wheelRun.draw_metadata?.winner_ticket_index}
        />
      </div>

      {/* Competition Info */}
      <div className="card bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">📋 معلومات السحب</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="text-neutral-600 mb-1">المسابقة</div>
            <div className="font-bold text-neutral-900">{competition.title}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="text-neutral-600 mb-1">تاريخ السحب</div>
            <div className="font-bold text-neutral-900">
              {new Date(wheelRun.run_at).toLocaleString('ar-SA')}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="text-neutral-600 mb-1">تاريخ القفل</div>
            <div className="font-bold text-neutral-900">
              {new Date(wheelRun.locked_at).toLocaleString('ar-SA')}
            </div>
          </div>
          {wheelRun.draw_metadata?.draw_hash && (
            <div className="bg-white rounded-lg p-4 border border-neutral-200">
              <div className="text-neutral-600 mb-1">Hash التحقق</div>
              <div className="font-mono text-xs text-neutral-700 break-all">
                {wheelRun.draw_metadata.draw_hash.substring(0, 32)}...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card bg-gradient-to-r from-primary to-primary-light text-white text-center">
        <h3 className="text-2xl font-bold mb-3">هل تريد أن تكون الفائز القادم؟</h3>
        <p className="text-white/90 mb-6">
          شارك في المسابقات القادمة واحصل على فرصتك للفوز!
        </p>
        <Link href="/questions" className="inline-block px-8 py-3 bg-white text-primary rounded-lg hover:bg-neutral-100 transition-colors font-bold">
          ابدأ الآن
        </Link>
      </div>
    </motion.div>
  )
}
