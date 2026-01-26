'use client'

import { useState } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, Question, Submission } from '@/lib/store/types'
import { updateSubmission } from '../actions'

interface SubmissionsTabProps {
  session: SessionPayload
  competitions: Competition[]
  questions: Question[]
  submissions: Submission[]
  setSubmissions: (submissions: Submission[]) => void
}

export default function SubmissionsTab({ session, competitions, questions, submissions, setSubmissions }: SubmissionsTabProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const result = await updateSubmission(selectedSubmission.id, {
        finalResult: formData.get('finalResult') as 'correct' | 'incorrect' | 'pending',
        reason: formData.get('reason') as string,
        correctedBy: session.username
      })

      if (result.success) {
        setSubmissions(result.submissions!)
        setSelectedSubmission(null)
        showToast('تم التحديث بنجاح', 'success')
      } else {
        showToast(result.error || 'حدث خطأ', 'error')
      }
    } catch (error) {
      showToast('حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getQuestion = (questionId: string) => questions.find(q => q.id === questionId)

  const handleExport = (format: 'csv' | 'json') => {
    const activeComp = competitions.find(c => c.status === 'active')
    const url = activeComp 
      ? `/api/export/submissions?competitionId=${activeComp.id}&format=${format}`
      : `/api/export/submissions?format=${format}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">إجابات الطلاب</h1>
          <p className="text-neutral-600">مراجعة وتصحيح الإجابات</p>
        </div>
        {(session.role === 'ceo' || session.role === 'lrc_manager') && submissions.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              تصدير CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              تصدير JSON
            </button>
          </div>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">لا توجد إجابات بعد</h3>
          <p className="text-neutral-600">سيتم عرض إجابات الطلاب هنا</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">الطالب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">السؤال</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">التاريخ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-700">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {submissions.map(sub => {
                const question = getQuestion(sub.questionId)
                return (
                  <tr key={sub.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{sub.studentUsername}</td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{question?.title || 'غير معروف'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        sub.finalResult === 'correct' ? 'bg-green-100 text-green-700' :
                        sub.finalResult === 'incorrect' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sub.finalResult === 'correct' ? 'صحيح' : sub.finalResult === 'incorrect' ? 'خطأ' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(sub.submittedAt).toLocaleDateString('ar-OM')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-primary hover:text-primary-dark font-semibold text-sm"
                      >
                        مراجعة
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">مراجعة الإجابة</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Question */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-bold text-neutral-900 mb-2">السؤال</h3>
                <p className="text-neutral-700">{getQuestion(selectedSubmission.questionId)?.body}</p>
              </div>

              {/* Student Answer */}
              <div>
                <h3 className="font-bold text-neutral-900 mb-2">إجابة الطالب</h3>
                <p className="text-neutral-700 bg-blue-50 p-4 rounded-lg">{String(selectedSubmission.answer)}</p>
              </div>

              {/* Source */}
              <div>
                <h3 className="font-bold text-neutral-900 mb-2">المصدر</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">المجلد:</span>
                    <div className="font-semibold">{selectedSubmission.source.volume}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600">الصفحة:</span>
                    <div className="font-semibold">{selectedSubmission.source.page}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600">من السطر:</span>
                    <div className="font-semibold">{selectedSubmission.source.lineFrom}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600">إلى السطر:</span>
                    <div className="font-semibold">{selectedSubmission.source.lineTo}</div>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReview} className="space-y-4 border-t border-neutral-200 pt-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">النتيجة النهائية</label>
                  <select
                    name="finalResult"
                    defaultValue={selectedSubmission.finalResult}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) => {
                      // Show ticket impact preview
                      const competition = competitions.find(c => c.id === selectedSubmission.competitionId)
                      if (competition) {
                        const baseTickets = competition.rules?.tickets?.basePerCorrect || 1
                        const ticketPreview = document.getElementById('ticket-preview')
                        if (ticketPreview) {
                          if (e.target.value === 'correct') {
                            ticketPreview.innerHTML = `<div class="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                              <strong class="text-green-700">🎫 تأثير التذاكر:</strong>
                              <span class="text-green-600"> سيحصل الطالب على ${baseTickets}+ تذكرة (قد تزيد بالمكافأة المبكرة)</span>
                            </div>`
                          } else if (e.target.value === 'incorrect') {
                            ticketPreview.innerHTML = `<div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                              <strong class="text-red-700">🎫 تأثير التذاكر:</strong>
                              <span class="text-red-600"> سيتم إزالة جميع التذاكر لهذه الإجابة</span>
                            </div>`
                          } else {
                            ticketPreview.innerHTML = ''
                          }
                        }
                      }
                    }}
                  >
                    <option value="correct">صحيح</option>
                    <option value="incorrect">خطأ</option>
                    <option value="pending">قيد المراجعة</option>
                  </select>
                </div>

                {/* Ticket Impact Preview */}
                <div id="ticket-preview"></div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">ملاحظات (اختياري)</label>
                  <textarea
                    name="reason"
                    defaultValue={selectedSubmission.reason || ''}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="أضف ملاحظات إذا لزم الأمر..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 left-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-semibold z-50`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
