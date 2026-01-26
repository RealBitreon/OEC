'use client'

import { useState, useEffect } from 'react'
import type { Competition, Ticket } from '@/lib/store/types'

interface TicketsSummary {
  studentUsername: string
  totalTickets: number
  correctAnswers: number
}

export default function TicketsTab({
  competitions,
  tickets
}: {
  competitions: Competition[]
  tickets: Ticket[]
}) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('')
  const [summary, setSummary] = useState<TicketsSummary[]>([])

  useEffect(() => {
    if (selectedCompetitionId) {
      // Calculate summary for selected competition
      const competitionTickets = tickets.filter(t => t.competitionId === selectedCompetitionId)
      
      const studentMap = new Map<string, { totalTickets: number; correctAnswers: number }>()
      
      for (const ticket of competitionTickets) {
        const current = studentMap.get(ticket.studentUsername) || { totalTickets: 0, correctAnswers: 0 }
        current.totalTickets += ticket.count
        studentMap.set(ticket.studentUsername, current)
      }
      
      // Count correct answers per student
      const submissionCounts = new Map<string, Set<string>>()
      for (const ticket of competitionTickets) {
        if (!submissionCounts.has(ticket.studentUsername)) {
          submissionCounts.set(ticket.studentUsername, new Set())
        }
        submissionCounts.get(ticket.studentUsername)!.add(ticket.submissionId)
      }
      
      submissionCounts.forEach((submissions, username) => {
        const current = studentMap.get(username) || { totalTickets: 0, correctAnswers: 0 }
        current.correctAnswers = submissions.size
        studentMap.set(username, current)
      })
      
      const summaryData = Array.from(studentMap.entries())
        .map(([studentUsername, data]) => ({
          studentUsername,
          ...data
        }))
        .sort((a, b) => b.totalTickets - a.totalTickets)
      
      setSummary(summaryData)
    } else {
      setSummary([])
    }
  }, [selectedCompetitionId, tickets])

  const activeCompetitions = competitions.filter(c => c.status === 'active')

  const handleExport = (format: 'csv' | 'json') => {
    if (!selectedCompetitionId) {
      alert('الرجاء اختيار مسابقة أولاً')
      return
    }
    const url = `/api/export/tickets?competitionId=${selectedCompetitionId}&format=${format}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">التذاكر</h2>
        <p className="text-gray-600 mb-4">
          عرض وتصدير بيانات التذاكر للمسابقات النشطة
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">اختر المسابقة</label>
          <select
            value={selectedCompetitionId}
            onChange={(e) => setSelectedCompetitionId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- اختر مسابقة --</option>
            {activeCompetitions.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCompetitionId && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                تصدير JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                تصدير CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right">اسم المستخدم</th>
                    <th className="px-4 py-2 text-right">إجمالي التذاكر</th>
                    <th className="px-4 py-2 text-right">الإجابات الصحيحة</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        لا توجد تذاكر لهذه المسابقة
                      </td>
                    </tr>
                  ) : (
                    summary.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.studentUsername}</td>
                        <td className="px-4 py-2 font-bold text-blue-600">{item.totalTickets}</td>
                        <td className="px-4 py-2">{item.correctAnswers}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {summary.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>إجمالي الطلاب:</strong> {summary.length} | 
                  <strong className="mr-4">إجمالي التذاكر:</strong> {summary.reduce((sum, s) => sum + s.totalTickets, 0)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
