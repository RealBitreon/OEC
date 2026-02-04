'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Competition, Winner } from '@/lib/store/types'

export default function ArchivedCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [compRes, winnersRes] = await Promise.all([
        fetch('/api/competitions/archived'),
        fetch('/api/winners')
      ])
      
      // Always parse response, even if not ok (API returns empty arrays gracefully)
      const compData = await compRes.json().catch(() => ({ competitions: [] }))
      const winnersData = await winnersRes.json().catch(() => ({ winners: [] }))
      
      setCompetitions(compData.competitions || [])
      setWinners(winnersData.winners || [])
    } catch (error) {
      console.error('Error loading archived competitions:', error)
      // Set empty arrays on error to prevent crashes
      setCompetitions([])
      setWinners([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-neutral-100">
        <div className="section-container">
          <div className="text-center text-neutral-600">جاري التحميل...</div>
        </div>
      </section>
    )
  }

  if (competitions.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-neutral-100">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            إصدارات سابقة من المسابقة
          </h2>
          <p className="text-lg text-neutral-600">
            شاهد نتائج المسابقات السابقة والفائزين
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((comp, idx) => {
            const winner = winners.find(w => w.competitionId === comp.id)
            
            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link href={`/competition/${comp.slug}`}>
                  <div className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-neutral-900">{comp.title}</h3>
                      <span className="text-2xl">📦</span>
                    </div>
                    
                    <div className="text-sm text-neutral-600 space-y-2 mb-4">
                      <div>📅 {new Date(comp.startAt).toLocaleDateString('ar-OM', { month: 'long', year: 'numeric' })}</div>
                      {winner && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="text-xs text-green-600 mb-1">الفائز</div>
                          <div className="font-bold text-green-700">{winner.displayName}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/competition/${comp.slug}`}
                        className="flex-1 btn-secondary text-center text-sm py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        التفاصيل
                      </Link>
                      {winner && (
                        <Link
                          href={`/competition/${comp.slug}/wheel`}
                          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all text-center text-sm py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🎡 العجلة
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
