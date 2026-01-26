import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { submissionsRepo, questionsRepo } from '@/lib/repos'
import type { Submission, Question } from '@/lib/store/types'

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

    const submissions = competitionId 
      ? await submissionsRepo.list({ competitionId })
      : await submissionsRepo.list()
    const questions = await questionsRepo.listActive()
    
    const questionMap = new Map(questions.map(q => [q.id, q]))

    const filtered = submissions

    if (format === 'json') {
      const enriched = filtered.map(sub => ({
        ...sub,
        questionTitle: questionMap.get(sub.questionId)?.title || 'غير معروف'
      }))

      return new NextResponse(JSON.stringify(enriched, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="submissions-${Date.now()}.json"`
        }
      })
    }

    // CSV format
    const headers = [
      'ID',
      'اسم الطالب',
      'السؤال',
      'الإجابة',
      'المجلد',
      'الصفحة',
      'من سطر',
      'إلى سطر',
      'النتيجة التلقائية',
      'النتيجة النهائية',
      'صححها',
      'السبب',
      'تاريخ الإرسال'
    ]

    const rows = filtered.map(sub => [
      escapeCSV(sub.id),
      escapeCSV(sub.studentUsername),
      escapeCSV(questionMap.get(sub.questionId)?.title || 'غير معروف'),
      escapeCSV(sub.answer),
      escapeCSV(sub.source.volume),
      escapeCSV(sub.source.page),
      escapeCSV(sub.source.lineFrom),
      escapeCSV(sub.source.lineTo),
      escapeCSV(sub.autoResult),
      escapeCSV(sub.finalResult),
      escapeCSV(sub.correctedBy || ''),
      escapeCSV(sub.reason || ''),
      escapeCSV(new Date(sub.submittedAt).toLocaleString('ar-EG'))
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    // Add BOM for proper Arabic display in Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="submissions-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Export submissions error:', error)
    return NextResponse.json(
      { error: 'فشل تصدير الإجابات' },
      { status: 500 }
    )
  }
}
