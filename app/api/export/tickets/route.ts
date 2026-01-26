import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { ticketsRepo } from '@/lib/repos'
import type { Ticket } from '@/lib/store/types'

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session || !['ceo', 'lrc_manager'].includes(session.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    const format = searchParams.get('format') || 'csv'

    const tickets = competitionId
      ? await ticketsRepo.listByCompetition(competitionId)
      : await ticketsRepo.listByCompetition('') // Get all tickets

    const filtered = tickets

    // Aggregate by student
    const studentTotals = new Map<string, number>()
    filtered.forEach(ticket => {
      const current = studentTotals.get(ticket.studentUsername) || 0
      studentTotals.set(ticket.studentUsername, current + ticket.count)
    })

    const aggregated = Array.from(studentTotals.entries()).map(([username, total]) => ({
      studentUsername: username,
      totalTickets: total
    }))

    aggregated.sort((a, b) => b.totalTickets - a.totalTickets)

    if (format === 'json') {
      return new NextResponse(JSON.stringify(aggregated, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="tickets-${Date.now()}.json"`
        }
      })
    }

    // CSV format
    const headers = ['اسم الطالب', 'إجمالي التذاكر']
    const rows = aggregated.map(item => [
      escapeCSV(item.studentUsername),
      escapeCSV(item.totalTickets)
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    // Add BOM for proper Arabic display in Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tickets-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Export tickets error:', error)
    return NextResponse.json(
      { error: 'فشل تصدير التذاكر' },
      { status: 500 }
    )
  }
}
