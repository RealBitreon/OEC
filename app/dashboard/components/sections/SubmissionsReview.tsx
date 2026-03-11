'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '../../core/types'
import { 
  reviewSubmission, 
  bulkReview, 
  allowRetry,
  type SubmissionFilters 
} from '../../actions/submissions'
import { updateSubmissionAnswers } from '../../actions/submissions-edit'
import { getQuestions } from '../../actions/questions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/components/ui/Toast'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { useAsyncOperation } from '@/lib/hooks/useAsyncOperation'
import { getErrorMessage } from '@/lib/utils/error-messages'

interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  first_name?: string
  father_name?: string
  family_name?: string
  grade?: string
  competition_id: string
  answers: Record<string, string> // {question_id: answer}
  proofs?: Record<string, string>
  score: number
  total_questions: number
  submitted_at: string
  is_winner?: boolean | null
  competition?: {
    id: string
    title: string
  }
}

interface Stats {
  total: number
  winners: number
  losers: number
  notReviewed: number
  averageScore: number
}

export default function SubmissionsReview({ profile, competitionId }: { profile: User, competitionId?: string }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<SubmissionFilters>(
    competitionId ? { competition_id: competitionId } : {}
  )
  const [reviewModal, setReviewModal] = useState<{ open: boolean; submission: Submission | null; questions?: any[] }>({
    open: false,
    submission: null,
    questions: []
  })
  const [editModal, setEditModal] = useState<{ open: boolean; submission: Submission | null; questions?: any[] }>({
    open: false,
    submission: null,
    questions: []
  })
  const [editAnswers, setEditAnswers] = useState<Record<string, string>>({})
  const [editProofs, setEditProofs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [competitions, setCompetitions] = useState<Array<{ id: string; title: string }>>([])
  const [reviewCompetitionRules, setReviewCompetitionRules] = useState<any>(null)
  const [markingWinner, setMarkingWinner] = useState<string | null>(null)
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (filters.competition_id) params.append('competition_id', filters.competition_id)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      // Fetch submissions and stats in parallel
      const [submissionsRes, statsRes] = await Promise.all([
        fetch(`/api/submissions?${params.toString()}`),
        fetch(`/api/submissions/stats${filters.competition_id ? `?competition_id=${filters.competition_id}` : ''}`)
      ])
      
      if (!submissionsRes.ok) {
        const errorData = await submissionsRes.json()
        throw new Error(errorData.error || 'فشل في جلب البيانات')
      }
      
      if (!statsRes.ok) {
        const errorData = await statsRes.json()
        throw new Error(errorData.error || 'فشل في جلب الإحصائيات')
      }
      
      const submissionsData = await submissionsRes.json()
      const statsData = await statsRes.json()
      
      if (!mountedRef.current) return
      
      // Ensure submissions is always an array
      const submissionsArray = Array.isArray(submissionsData?.submissions) 
        ? submissionsData.submissions 
        : []
      
      setSubmissions(submissionsArray as Submission[])
      setTotalPages(submissionsData?.pages || 1)
      setStats(statsData)
      
      // Extract unique competitions
      if (submissionsArray.length > 0) {
        const uniqueComps = Array.from(
          new Map(
            submissionsArray
              .filter((s: any) => s?.competition)
              .map((s: any) => [s.competition.id, s.competition])
          ).values()
        )
        setCompetitions(uniqueComps as any)
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading data:', err)
      if (mountedRef.current) {
        setError(err.message || 'حدث خطأ في تحميل البيانات')
        setLoading(false)
        showToast(getErrorMessage(err), 'error')
        setSubmissions([])
        setTotalPages(1)
      }
    }
  }, [filters, page, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMarkWinner = async (submissionId: string, isWinner: boolean) => {
    setMarkingWinner(submissionId)
    try {
      const response = await fetch('/api/submissions/mark-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, isWinner })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Mark winner error:', data)
        throw new Error(data.error || 'فشل تحديث الحالة')
      }

      showToast(isWinner ? 'تم تحديد الطالب كفائز 🎉' : 'تم تحديد الطالب كخاسر', 'success')
      loadData()
      setReviewModal({ open: false, submission: null })
    } catch (error: any) {
      console.error('Mark winner exception:', error)
      showToast(error.message || 'فشل تحديث الحالة', 'error')
    } finally {
      setMarkingWinner(null)
    }
  }

  const handleEditSubmission = async (submission: Submission) => {
    // Load questions for this submission's competition
    let questions: any[] = []
    if (submission.competition_id) {
      try {
        const result = await getQuestions({ competition_id: submission.competition_id })
        questions = result.questions || []
      } catch (error) {
        console.error('Failed to load questions:', error)
      }
    }
    setEditAnswers(submission.answers || {})
    setEditProofs(submission.proofs || {})
    setEditModal({ open: true, submission, questions })
  }

  const handleSaveEdit = async () => {
    if (!editModal.submission) return
    
    setSaving(true)
    try {
      await updateSubmissionAnswers(
        editModal.submission.id,
        editAnswers,
        editProofs
      )
      showToast('تم تحديث الإجابات بنجاح', 'success')
      setEditModal({ open: false, submission: null })
      loadData()
    } catch (error: any) {
      showToast(error.message || 'فشل تحديث الإجابات', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string, participantName: string) => {
    if (!confirm(`هل أنت متأكد من حذف إجابة ${participantName}؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return
    }

    setDeletingSubmission(submissionId)
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل حذف الإجابة')
      }

      showToast('تم حذف الإجابة بنجاح', 'success')
      loadData()
    } catch (error: any) {
      showToast(error.message || 'فشل حذف الإجابة', 'error')
    } finally {
      setDeletingSubmission(null)
    }
  }

  const handleOpenReviewModal = async (submission: Submission) => {
    let questions: any[] = []
    if (submission.competition_id) {
      try {
        const result = await getQuestions({ competition_id: submission.competition_id })
        questions = result.questions || []
        
        // Fetch competition rules
        const response = await fetch(`/api/competitions/${submission.competition_id}`)
        if (response.ok) {
          const data = await response.json()
          setReviewCompetitionRules(data?.data?.rules)
        }
      } catch (error) {
        console.error('Failed to load questions or competition rules:', error)
      }
    }
    setReviewModal({ open: true, submission, questions })
  }

  const getStatusBadge = (submission: Submission) => {
    if (submission.is_winner === true) {
      return <Badge variant="success">🏆 فائز</Badge>
    } else if (submission.is_winner === false) {
      return <Badge variant="danger">خاسر</Badge>
    } else {
      return <Badge variant="info">لم تتم المراجعة</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">مراجعة الإجابات</h1>
          <p className="text-neutral-600 mt-1">إدارة ومراجعة إجابات المشاركين</p>
        </div>
        <Button
          onClick={loadData}
          variant="secondary"
          disabled={loading}
        >
          {loading ? '⏳ جاري التحميل...' : '🔄 تحديث'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
            <div className="text-sm text-neutral-600">إجمالي الإجابات</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-2xl font-bold text-green-900">{stats.winners}</div>
            <div className="text-sm text-green-700">🏆 الفائزون</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-2xl font-bold text-red-900">{stats.losers}</div>
            <div className="text-sm text-red-700">الخاسرون</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{stats.notReviewed}</div>
            <div className="text-sm text-blue-700">لم تتم المراجعة</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {!competitionId && (
            <Select
              value={filters.competition_id || ''}
              onChange={(e) => setFilters({ ...filters, competition_id: e.target.value || undefined })}
            >
              <option value="">كل المسابقات</option>
              {competitions && competitions.length > 0 && competitions.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.title}</option>
              ))}
            </Select>
          )}

          <Select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
          >
            <option value="">كل الحالات</option>
            <option value="winner">🏆 الفائزون</option>
            <option value="loser">الخاسرون</option>
            <option value="not_reviewed">لم تتم المراجعة</option>
          </Select>

          <Input
            type="text"
            placeholder="بحث..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
          />

          <Button
            onClick={() => {
              setFilters(competitionId ? { competition_id: competitionId } : {})
              setPage(1)
            }}
            variant="secondary"
          >
            مسح الفلاتر
          </Button>
        </div>
      </div>



      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-neutral-600 mb-4">{getErrorMessage(error)}</p>
            <Button onClick={loadData} variant="primary">
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">المشارك</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">المسابقة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الدرجة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {!submissions || submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-600">
                      📝 لا توجد إجابات
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-neutral-900">
                        {submission.participant_name}
                      </div>
                      {submission.participant_email && (
                        <div className="text-xs text-neutral-500">
                          {submission.participant_email}
                        </div>
                      )}
                      {submission.grade && (
                        <div className="text-xs text-neutral-500">
                          الصف: {submission.grade}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-neutral-900">
                        {submission.competition?.title || 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-lg font-bold text-neutral-900">
                        {submission.score} / {submission.total_questions}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(submission)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-neutral-600">
                        {new Date(submission.submitted_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={async () => {
                            await handleOpenReviewModal(submission)
                          }}
                          variant="primary"
                          size="sm"
                        >
                          عرض
                        </Button>
                        <Button
                          onClick={() => handleEditSubmission(submission)}
                          variant="secondary"
                          size="sm"
                          title="تعديل الإجابة"
                          aria-label="تعديل الإجابة"
                        >
                          ✏️
                        </Button>
                        {submission.is_winner === true ? (
                          <Button
                            onClick={() => handleMarkWinner(submission.id, false)}
                            variant="danger"
                            size="sm"
                            title="تحويل إلى خاسر"
                            aria-label="تحويل إلى خاسر"
                            loading={markingWinner === submission.id}
                            disabled={markingWinner !== null}
                          >
                            ❌
                          </Button>
                        ) : submission.is_winner === false ? (
                          <Button
                            onClick={() => handleMarkWinner(submission.id, true)}
                            variant="primary"
                            size="sm"
                            title="تحويل إلى فائز"
                            aria-label="تحويل إلى فائز"
                            loading={markingWinner === submission.id}
                            disabled={markingWinner !== null}
                          >
                            🏆
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleMarkWinner(submission.id, true)}
                              variant="primary"
                              size="sm"
                              title="تحديد كفائز"
                              aria-label="تحديد كفائز"
                              loading={markingWinner === submission.id}
                              disabled={markingWinner !== null}
                            >
                              🏆
                            </Button>
                            <Button
                              onClick={() => handleMarkWinner(submission.id, false)}
                              variant="danger"
                              size="sm"
                              title="تحديد كخاسر"
                              aria-label="تحديد كخاسر"
                              loading={markingWinner === submission.id}
                              disabled={markingWinner !== null}
                            >
                              ❌
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteSubmission(submission.id, submission.participant_name)}
                          variant="danger"
                          size="sm"
                          title="حذف الإجابة"
                          aria-label="حذف الإجابة"
                          loading={deletingSubmission === submission.id}
                          disabled={deletingSubmission !== null}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              صفحة {page} من {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                السابق
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="secondary"
                size="sm"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.open && reviewModal.submission && (
        <Modal
          isOpen={reviewModal.open}
          onClose={() => {
            setReviewModal({ open: false, submission: null })
            setReviewCompetitionRules(null)
          }}
          title="تفاصيل الإجابة"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">المشارك</label>
              <div className="text-neutral-900">
                {reviewModal.submission.participant_name}
              </div>
              {reviewModal.submission.participant_email && (
                <div className="text-sm text-neutral-600">
                  {reviewModal.submission.participant_email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">المسابقة</label>
              <div className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">
                {reviewModal.submission.competition?.title || 'غير محدد'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">الدرجة</label>
                <div className="text-lg font-bold text-blue-900 bg-blue-50 p-3 rounded-lg text-center">
                  {reviewModal.submission.score} / {reviewModal.submission.total_questions}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">الحالة</label>
                <div className="p-3 rounded-lg text-center">
                  {getStatusBadge(reviewModal.submission)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الإجابات</label>
              
              {/* For all_correct mode, show summary instead of details */}
              {reviewCompetitionRules?.eligibilityMode === 'all_correct' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-bold text-blue-700 mb-2">📝 ملخص الإجابة</div>
                  <div className="text-sm text-blue-800">
                    تم مراجعة إجابة الطالب بنجاح. الإجابات كلها صحيحة.
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">الدرجة:</span> {reviewModal.submission.score} / {reviewModal.submission.total_questions}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewModal.questions && reviewModal.questions.length > 0 ? (
                    Object.entries(reviewModal.submission.answers).map(([questionId, studentAnswer], index) => {
                      const question = reviewModal.questions?.find(q => q.id === questionId)
                      if (!question) return null
                      
                      const isCorrect = question.correct_answer === studentAnswer
                      const studentProof = reviewModal.submission.proofs?.[questionId] || ''
                      
                      const missingAnswer = !studentAnswer || studentAnswer.trim() === ''
                      const missingProof = !studentProof || studentProof.trim() === ''
                      
                      return (
                        <div key={questionId} className="bg-white border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-neutral-900 font-medium mb-3">{question.question_text}</p>
                              
                              {(missingAnswer || missingProof) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                  <div className="text-sm font-bold text-red-900 mb-1">⚠️ بيانات ناقصة</div>
                                  <div className="text-sm text-red-700">
                                    {missingAnswer && missingProof && 'الإجابة والدليل غير موجودين'}
                                    {missingAnswer && !missingProof && 'الإجابة غير موجودة'}
                                    {!missingAnswer && missingProof && 'الدليل غير موجود'}
                                  </div>
                                </div>
                              )}
                              
                              {studentProof && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                  <div className="text-sm font-bold text-amber-900 mb-2">📖 دليل الطالب من المصدر:</div>
                                  <div className="text-base text-amber-800 font-semibold">
                                    {studentProof}
                                  </div>
                                </div>
                              )}
                              
                              {(question.volume || question.page || (question.line_from && question.line_to)) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                  <div className="text-xs font-bold text-blue-700 mb-1">📍 الموقع الصحيح في المصدر (للمراجعة):</div>
                                  <div className="text-sm text-blue-700 flex flex-wrap items-center gap-3">
                                    {question.volume && <span>📚 المجلد: {question.volume}</span>}
                                    {question.page && <span>📄 الصفحة: {question.page}</span>}
                                    {question.line_from && question.line_to && <span>📝 السطور: {question.line_from}-{question.line_to}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-11">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="text-sm font-bold text-green-700 mb-2">✓ الإجابة الصحيحة</div>
                              <div className="text-base text-green-900 font-semibold">
                                {question.correct_answer || 'غير محددة'}
                              </div>
                            </div>
                            
                            <div className={`border rounded-lg p-4 ${
                              missingAnswer 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}>
                              <div className={`text-sm font-bold mb-2 ${
                                missingAnswer ? 'text-red-700' : 'text-blue-700'
                              }`}>
                                📝 إجابة الطالب
                              </div>
                              <div className={`text-base font-semibold ${
                                missingAnswer ? 'text-red-900' : 'text-blue-900'
                              }`}>
                                {studentAnswer || 'لم يجب'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <pre className="text-sm text-neutral-900 whitespace-pre-wrap">
                        {JSON.stringify(reviewModal.submission.answers, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Winner/Loser Status Buttons */}
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                تحديد حالة المشارك
              </label>
              
              {/* Show current status */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-3">
                <div className="text-sm text-neutral-600">الحالة الحالية:</div>
                <div className="mt-1">
                  {reviewModal.submission.is_winner === true && (
                    <Badge variant="success">🏆 فائز</Badge>
                  )}
                  {reviewModal.submission.is_winner === false && (
                    <Badge variant="danger">خاسر</Badge>
                  )}
                  {reviewModal.submission.is_winner === null && (
                    <Badge variant="info">لم تتم المراجعة</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {reviewModal.submission.is_winner === true ? (
                  <>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, true)}
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      🏆 فائز (حالي)
                    </Button>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, false)}
                      variant="danger"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                    >
                      ❌ تحويل إلى خاسر
                    </Button>
                  </>
                ) : reviewModal.submission.is_winner === false ? (
                  <>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, true)}
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      🏆 تحويل إلى فائز
                    </Button>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, false)}
                      variant="danger"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      ❌ خاسر (حالي)
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, true)}
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      🏆 فائز
                    </Button>
                    <Button
                      onClick={() => handleMarkWinner(reviewModal.submission!.id, false)}
                      variant="danger"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                    >
                      ❌ خاسر
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                الفائزون سيظهرون في عجلة الحظ تلقائياً
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-200 mt-4">
              <Button
                onClick={() => setReviewModal({ open: false, submission: null })}
                variant="secondary"
                className="flex-1"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}

{/* Edit Submission Modal */}
      {editModal.open && editModal.submission && (
        <Modal
          isOpen={editModal.open}
          onClose={() => setEditModal({ open: false, submission: null })}
          title="تعديل إجابة الطالب"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                📝 الطالب: {editModal.submission.participant_name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                يمكنك تعديل إجابات الطالب والأدلة المقدمة
              </p>
            </div>

            {editModal.questions && editModal.questions.length > 0 ? (
              <div className="space-y-4">
                {editModal.questions.map((question, index) => {
                  const currentAnswer = editAnswers[question.id] || ''
                  const currentProof = editProofs[question.id] || ''
                  const isCorrect = question.correct_answer === currentAnswer

                  return (
                    <div key={question.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-neutral-900 font-medium mb-2">{question.question_text}</p>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="text-xs font-bold text-green-700 mb-1">✓ الإجابة الصحيحة</div>
                            <div className="text-sm text-green-900 font-semibold">
                              {question.correct_answer || 'غير محددة'}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                إجابة الطالب {isCorrect && '✓'}
                              </label>
                              {question.type === 'mcq' && question.options ? (
                                <select
                                  value={currentAnswer}
                                  onChange={(e) => setEditAnswers({ ...editAnswers, [question.id]: e.target.value })}
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                                    isCorrect 
                                      ? 'border-green-300 bg-green-50' 
                                      : 'border-red-300 bg-red-50'
                                  }`}
                                >
                                  <option value="">اختر إجابة</option>
                                  {question.options.map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : question.type === 'true_false' ? (
                                <select
                                  value={currentAnswer}
                                  onChange={(e) => setEditAnswers({ ...editAnswers, [question.id]: e.target.value })}
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                                    isCorrect 
                                      ? 'border-green-300 bg-green-50' 
                                      : 'border-red-300 bg-red-50'
                                  }`}
                                >
                                  <option value="">اختر إجابة</option>
                                  <option value="true">صح</option>
                                  <option value="false">خطأ</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={currentAnswer}
                                  onChange={(e) => setEditAnswers({ ...editAnswers, [question.id]: e.target.value })}
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                                    isCorrect 
                                      ? 'border-green-300 bg-green-50' 
                                      : 'border-red-300 bg-red-50'
                                  }`}
                                  placeholder="أدخل الإجابة"
                                />
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-amber-700 mb-1">
                                📖 الدليل من المصدر
                              </label>
                              <input
                                type="text"
                                value={currentProof}
                                onChange={(e) => setEditProofs({ ...editProofs, [question.id]: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-amber-300 bg-amber-50 rounded-lg focus:outline-none focus:border-amber-500"
                                placeholder="مثال: المجلد 1 - الصفحة 25"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-neutral-600 py-8">
                لا توجد أسئلة لهذه المسابقة
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                variant="primary"
                className="flex-1"
              >
                {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
              </Button>
              <Button
                onClick={() => setEditModal({ open: false, submission: null })}
                variant="secondary"
                disabled={saving}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
