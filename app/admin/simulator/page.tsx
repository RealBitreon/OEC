'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons'

interface Candidate {
  username: string
  tickets: number
  probability: string
}

interface Winner {
  username: string
  displayName: string
  ticketIndex: number
  position: number
}

interface SimulationResult {
  competitionId: string
  competitionTitle: string
  winnerCount: number
  totalCandidates: number
  totalTickets: number
  winners: Winner[]
  dryRun: boolean
}

export default function WinnerSimulatorPage() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [winnerCount, setWinnerCount] = useState<number>(1)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string>('')

  // Load competitions
  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions/active')
      if (response.ok) {
        const data = await response.json()
        setCompetitions(data.competition ? [data.competition] : [])
      }
    } catch (err) {
      console.error('Error loading competitions:', err)
    }
  }

  // Load candidates when competition selected
  useEffect(() => {
    if (selectedCompetition) {
      loadCandidates()
    }
  }, [selectedCompetition])

  const loadCandidates = async () => {
    if (!selectedCompetition) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/wheel/simulate?competitionId=${selectedCompetition}`)
      
      if (!response.ok) {
        throw new Error('Failed to load candidates')
      }
      
      const data = await response.json()
      setCandidates(data.candidates || [])
      setWinnerCount(data.competition?.winnerCount || 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async (dryRun: boolean = true) => {
    if (!selectedCompetition) {
      setError('Please select a competition')
      return
    }
    
    setSimulating(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/wheel/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: selectedCompetition,
          winnerCount,
          dryRun
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Simulation failed')
      }
      
      const data = await response.json()
      setResult(data.simulation)
      
      if (!dryRun) {
        alert('✅ Winners have been saved to the database!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-8 mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-2">🎯 محاكي اختيار الفائزين</h1>
          <p className="text-white/90 text-lg">
            اختر المسابقة وعدد الفائزين وشاهد عملية السحب
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">الإعدادات</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Competition Selection */}
            <div>
              <label className="block text-lg font-semibold text-neutral-800 mb-3">
                اختر المسابقة *
              </label>
              <select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="">-- اختر مسابقة --</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Winner Count */}
            <div>
              <label className="block text-lg font-semibold text-neutral-800 mb-3">
                عدد الفائزين *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:outline-none"
              />
              <p className="text-sm text-neutral-600 mt-2">
                يمكنك اختيار من 1 إلى 10 فائزين
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => runSimulation(true)}
              disabled={!selectedCompetition || simulating || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {simulating ? 'جاري المحاكاة...' : '🎲 محاكاة السحب (تجريبي)'}
            </button>
            
            <button
              onClick={() => runSimulation(false)}
              disabled={!selectedCompetition || simulating || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {simulating ? 'جاري الحفظ...' : '✅ تنفيذ السحب وحفظ النتائج'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Candidates List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-neutral-600">جاري تحميل المرشحين...</p>
          </div>
        ) : candidates.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              المرشحون المؤهلون ({candidates.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-200">
                    <th className="text-right py-3 px-4 font-bold text-neutral-700">#</th>
                    <th className="text-right py-3 px-4 font-bold text-neutral-700">الاسم</th>
                    <th className="text-center py-3 px-4 font-bold text-neutral-700">التذاكر</th>
                    <th className="text-center py-3 px-4 font-bold text-neutral-700">احتمالية الفوز</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-neutral-600">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">{candidate.username}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                          {candidate.tickets}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-green-600 font-bold">
                        {candidate.probability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedCompetition ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-neutral-600">لا يوجد مرشحون مؤهلون لهذه المسابقة</p>
          </div>
        ) : null}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl font-bold text-green-700 mb-2">
                  {result.dryRun ? 'نتائج المحاكاة' : 'تم اختيار الفائزين!'}
                </h2>
                <p className="text-green-600">
                  {result.competitionTitle}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{result.totalCandidates}</div>
                  <div className="text-sm text-neutral-600">مرشح</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{result.totalTickets}</div>
                  <div className="text-sm text-neutral-600">تذكرة</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{result.winnerCount}</div>
                  <div className="text-sm text-neutral-600">فائز</div>
                </div>
              </div>

              {/* Winners */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">🏆 الفائزون:</h3>
                {result.winners.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {winner.position}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-neutral-800">{winner.displayName}</div>
                          <div className="text-sm text-neutral-600">التذكرة رقم: {winner.ticketIndex}</div>
                        </div>
                      </div>
                      <div className="text-4xl">
                        {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : winner.position === 3 ? '🥉' : '🏅'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {result.dryRun && (
                <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="text-amber-800 text-center">
                    ⚠️ هذه محاكاة فقط. لم يتم حفظ النتائج في قاعدة البيانات.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
