import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { winnersRepo, competitionsRepo } from '@/lib/repos'
import type { Winner, Competition } from '@/lib/store/types'

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
    const format = searchParams.get('format') || 'csv'

    const winners = await winnersRepo.listAll()
    const competitions = await competitionsRepo.listAll()
    
    const competitionMap = new Map(competitions.map(c => [c.id, c]))

    const enriched = winners.map(w => ({
      ...w,
      competitionTitle: competitionMap.get(w.competitionId)?.title || 'غير معروف'
    }))

    if (format === 'json') {
      return new NextResponse(JSON.stringify(enriched, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="winners-${Date.now()}.json"`
        }
      })
    }

    // CSV format
    const headers = ['المسابقة', 'الفائز', 'تاريخ السحب', 'ملاحظات']
    const rows = enriched.map(w => [
      escapeCSV(w.competitionTitle),
      escapeCSV(w.winnerUsername),
      escapeCSV(new Date(w.runAt).toLocaleString('ar-EG')),
      escapeCSV(w.notes || '')
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    // Add BOM for proper Arabic display in Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="winners-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Export winners error:', error)
    return NextResponse.json(
      { error: 'فشل تصدير الفائزين' },
      { status: 500 }
    )
  }
}
