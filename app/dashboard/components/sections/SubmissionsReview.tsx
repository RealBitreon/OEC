'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '../../core/types'
import { 
  getSubmissions, 
  reviewSubmission, 
  bulkReview, 
  getSubmissionStats,
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
  tickets_earned: number
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  review_notes?: string
  retry_allowed: boolean
  is_retry: boolean
  is_winner?: boolean | null
  competition?: {
    id: string
    title: string
  }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  underReview: number
  averageScore: number
}

export default function SubmissionsReview({ profile, competitionId }: { profile: User, competitionId?: string }) {
  const { showToast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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
  const [bulkAction, setBulkAction] = useState<'approved' | 'rejected' | null>(null)
  const [competitions, setCompetitions] = useState<Array<{ id: string; title: string }>>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [submissionsData, statsData] = await Promise.all([
        getSubmissions(filters, page, 20),
        getSubmissionStats(filters.competition_id)
      ])
      
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
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('فشل تحميل البيانات', 'error')
      setSubmissions([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReview = async (submissionId: string, result: 'approved' | 'rejected') => {
    try {
      await reviewSubmission(submissionId, result)
      showToast('تم مراجعة الإجابة بنجاح', 'success')
      setReviewModal({ open: false, submission: null })
      loadData()
      setSelectedIds(new Set())
    } catch (error: any) {
      showToast(error.message || 'فشل مراجعة الإجابة', 'error')
    }
  }

  const handleBulkReview = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    
    try {
      await bulkReview(Array.from(selectedIds), bulkAction)
      showToast(`تم مراجعة ${selectedIds.size} إجابة بنجاح`, 'success')
      setBulkAction(null)
      setSelectedIds(new Set())
      loadData()
    } catch (error: any) {
      showToast(error.message || 'فشل المراجعة الجماعية', 'error')
    }
  }

  const handleAllowRetry = async (submissionId: string) => {
    try {
      await allowRetry(submissionId)
      showToast('تم السماح بإعادة المحاولة', 'success')
      loadData()
    } catch (error: any) {
      showToast(error.message || 'فشل السماح بإعادة المحاولة', 'error')
    }
  }

  const handleRemoveSubmission = async (submissionId: string, participantName: string) => {
    if (!confirm(`هل أنت متأكد من حذف إجابة ${participantName}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('فشل حذف الإجابة')
      }
      
      showToast('تم حذف الإجابة بنجاح', 'success')
      loadData()
    } catch (error: any) {
      showToast(error.message || 'فشل حذف الإجابة', 'error')
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

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (!submissions || !Array.isArray(submissions)) return
    
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)))
    }
  }

  const getStatusBadge = (submission: Submission) => {
    switch (submission.status) {
      case 'approved':
        return <Badge variant="success">مقبولة ✓</Badge>
      case 'rejected':
        return <Badge variant="danger">مرفوضة ✗</Badge>
      case 'under_review':
        return <Badge variant="warning">قيد المراجعة</Badge>
      case 'pending':
      default:
        return <Badge variant="info">قيد الانتظار</Badge>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
            <div className="text-sm text-neutral-600">إجمالي الإجابات</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{stats.pending}</div>
            <div className="text-sm text-blue-700">قيد الانتظار</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{stats.underReview}</div>
            <div className="text-sm text-yellow-700">قيد المراجعة</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
            <div className="text-sm text-green-700">مقبولة</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
            <div className="text-sm text-red-700">مرفوضة</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{stats.averageScore}%</div>
            <div className="text-sm text-purple-700">متوسط الدرجات</div>
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
            <option value="pending">قيد الانتظار</option>
            <option value="under_review">قيد المراجعة</option>
            <option value="approved">مقبولة</option>
            <option value="rejected">مرفوضة</option>
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

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200 flex items-center justify-between">
          <div className="text-blue-900 font-medium">
            تم تحديد {selectedIds.size} إجابة
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setBulkAction('approved')}
              variant="primary"
              size="sm"
            >
              ✓ قبول
            </Button>
            <Button
              onClick={() => setBulkAction('rejected')}
              variant="danger"
              size="sm"
            >
              ✗ رفض
            </Button>
            <Button
              onClick={() => setSelectedIds(new Set())}
              variant="secondary"
              size="sm"
            >
              إلغاء التحديد
            </Button>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-right">
                  <Checkbox
                    checked={submissions && submissions.length > 0 && selectedIds.size === submissions.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">المشارك</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">المسابقة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الدرجة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">التذاكر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-600">
                    ⏳ جاري التحميل...
                  </td>
                </tr>
              ) : !submissions || submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-600">
                    📝 لا توجد إجابات
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(submission.id)}
                        onChange={() => toggleSelection(submission.id)}
                      />
                    </td>
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
                      {submission.is_winner === true && (
                        <div className="mt-1">
                          <Badge variant="success">🏆 فائز</Badge>
                        </div>
                      )}
                      {submission.is_winner === false && (
                        <div className="mt-1">
                          <Badge variant="default">خاسر</Badge>
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
                      <div className="text-xs text-neutral-500">
                        {submission.total_questions > 0 
                          ? Math.round((submission.score / submission.total_questions) * 100) 
                          : 0}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-lg font-bold text-purple-900">
                        {submission.tickets_earned} 🎟️
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
                      {submission.reviewed_at && (
                        <div className="text-xs text-neutral-500 mt-1">
                          تمت المراجعة: {new Date(submission.reviewed_at).toLocaleDateString('ar-EG')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
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
                            setReviewModal({ open: true, submission, questions })
                          }}
                          variant="primary"
                          size="sm"
                        >
                          عرض التفاصيل
                        </Button>
                        <Button
                          onClick={() => handleEditSubmission(submission)}
                          variant="secondary"
                          size="sm"
                        >
                          ✏️ تعديل
                        </Button>
                        {submission.status === 'rejected' && !submission.retry_allowed && (
                          <Button
                            onClick={() => handleAllowRetry(submission.id)}
                            variant="secondary"
                            size="sm"
                          >
                            السماح بإعادة المحاولة
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemoveSubmission(submission.id, submission.participant_name)}
                          variant="danger"
                          size="sm"
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
          onClose={() => setReviewModal({ open: false, submission: null })}
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">الدرجة</label>
                <div className="text-lg font-bold text-blue-900 bg-blue-50 p-3 rounded-lg text-center">
                  {reviewModal.submission.score} / {reviewModal.submission.total_questions}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">النسبة</label>
                <div className="text-lg font-bold text-green-900 bg-green-50 p-3 rounded-lg text-center">
                  {reviewModal.submission.total_questions > 0 
                    ? Math.round((reviewModal.submission.score / reviewModal.submission.total_questions) * 100) 
                    : 0}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">التذاكر</label>
                <div className="text-lg font-bold text-purple-900 bg-purple-50 p-3 rounded-lg text-center">
                  {reviewModal.submission.tickets_earned} 🎟️
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">الإجابات</label>
              <div className="space-y-3">
                {reviewModal.questions && reviewModal.questions.length > 0 ? (
                  Object.entries(reviewModal.submission.answers).map(([questionId, studentAnswer], index) => {
                    const question = reviewModal.questions?.find(q => q.id === questionId)
                    if (!question) return null
                    
                    const isCorrect = question.correct_answer === studentAnswer
                    
                    return (
                      <div key={questionId} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-neutral-900 font-medium mb-3">{question.question_text}</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="text-sm font-bold text-blue-900 mb-2">📍 موقع السؤال في المصدر:</div>
                              <div className="text-base text-blue-800 flex flex-wrap items-center gap-4">
                                <span className="font-semibold">📚 المجلد: {question.volume}</span>
                                <span className="font-semibold">📄 الصفحة: {question.page}</span>
                                <span className="font-semibold">📝 السطور: {question.line_from}-{question.line_to}</span>
                              </div>
                            </div>
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
                            isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className={`text-sm font-bold mb-2 ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {isCorrect ? '✓ إجابة الطالب (صحيحة)' : '✗ إجابة الطالب (خاطئة)'}
                            </div>
                            <div className={`text-base font-semibold ${
                              isCorrect ? 'text-green-900' : 'text-red-900'
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
            </div>

            {reviewModal.submission.proofs && Object.keys(reviewModal.submission.proofs).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">الإثباتات (الدليل من المصدر)</label>
                <div className="space-y-3">
                  {reviewModal.questions && reviewModal.questions.length > 0 ? (
                    Object.entries(reviewModal.submission.proofs).map(([questionId, proof], index) => {
                      const question = reviewModal.questions?.find(q => q.id === questionId)
                      if (!question) return null
                      
                      return (
                        <div key={questionId} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-neutral-900 font-medium mb-2 text-sm">{question.question_text}</p>
                              <div className="bg-white border border-amber-200 rounded p-3">
                                <div className="text-xs font-medium text-amber-700 mb-1">📖 الدليل المقدم من الطالب</div>
                                <div className="text-sm text-neutral-900">{proof}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <pre className="text-sm text-neutral-900 whitespace-pre-wrap">
                        {JSON.stringify(reviewModal.submission.proofs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">الحالة الحالية</label>
              <div className="flex gap-2 items-center">
                {getStatusBadge(reviewModal.submission)}
                {reviewModal.submission.is_winner === true && (
                  <Badge variant="success">🏆 فائز</Badge>
                )}
                {reviewModal.submission.is_winner === false && (
                  <Badge variant="default">خاسر</Badge>
                )}
              </div>
            </div>

            {reviewModal.submission.review_notes && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ملاحظات المراجعة</label>
                <div className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">
                  {reviewModal.submission.review_notes}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {reviewModal.submission.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleReview(reviewModal.submission!.id, 'approved')}
                    variant="primary"
                    className="flex-1"
                  >
                    ✓ قبول
                  </Button>
                  <Button
                    onClick={() => handleReview(reviewModal.submission!.id, 'rejected')}
                    variant="danger"
                    className="flex-1"
                  >
                    ✗ رفض
                  </Button>
                </>
              )}
              <Button
                onClick={() => setReviewModal({ open: false, submission: null })}
                variant="secondary"
              >
                إغلاق
              </Button>
            </div>

            {/* Winner/Loser Status Buttons */}
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                حالة الفوز في السحب
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={async () => {
                    try {
                      await fetch('/api/submissions/mark-winner', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          submissionId: reviewModal.submission!.id,
                          isWinner: true
                        })
                      })
                      showToast('تم تحديد الطالب كفائز 🎉', 'success')
                      loadData()
                      setReviewModal({ open: false, submission: null })
                    } catch (error) {
                      showToast('فشل تحديث حالة الفوز', 'error')
                    }
                  }}
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  🏆 فائز
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await fetch('/api/submissions/mark-winner', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          submissionId: reviewModal.submission!.id,
                          isWinner: false
                        })
                      })
                      showToast('تم تحديد الطالب كخاسر', 'success')
                      loadData()
                      setReviewModal({ open: false, submission: null })
                    } catch (error) {
                      showToast('فشل تحديث حالة الفوز', 'error')
                    }
                  }}
                  variant="secondary"
                  className="bg-neutral-600 hover:bg-neutral-700 text-white font-bold py-3"
                >
                  خاسر
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                استخدم هذه الأزرار لتحديد الفائزين بعد إجراء السحب على عجلة الحظ
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Action Confirmation Modal */}
      {bulkAction && (
        <Modal
          isOpen={!!bulkAction}
          onClose={() => setBulkAction(null)}
          title="تأكيد المراجعة الجماعية"
        >
          <div className="space-y-4">
            <p className="text-neutral-700">
              هل أنت متأكد من وضع علامة <strong>{bulkAction === 'approved' ? 'مقبولة' : 'مرفوضة'}</strong> على {selectedIds.size} إجابة؟
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleBulkReview}
                variant={bulkAction === 'approved' ? 'primary' : 'danger'}
                className="flex-1"
              >
                تأكيد
              </Button>
              <Button
                onClick={() => setBulkAction(null)}
                variant="secondary"
              >
                إلغاء
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
