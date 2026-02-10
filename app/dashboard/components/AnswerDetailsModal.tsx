'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CurrentSubmissionTab } from './CurrentSubmissionTab'
import { WinnersListTab } from './WinnersListTab'

interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  first_name?: string
  father_name?: string
  family_name?: string
  grade?: string
  competition_id: string
  answers: Record<string, string>
  proofs?: Record<string, string>
  score: number
  total_questions: number
  submitted_at: string
  is_winner?: boolean | null
  competition?: {
    id: string
    title: string
    rules?: {
      require_all_correct?: boolean
    }
  }
}

interface Question {
  id: string
  question_text: string
  correct_answer: string
  type?: string
  options?: string[]
  volume?: string
  page?: string
  line_from?: string
  line_to?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  submission: Submission
  questions: Question[]
  onComplete: () => void
}

type TabType = 'current' | 'winners'

export function AnswerDetailsModal({ isOpen, onClose, submission, questions, onComplete }: Props) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('current')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingTab, setPendingTab] = useState<TabType | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('current')
      setHasUnsavedChanges(false)
      setShowUnsavedDialog(false)
      setPendingTab(null)
    }
  }, [isOpen])

  // Handle tab switch with unsaved changes check
  const handleTabSwitch = useCallback((newTab: TabType) => {
    if (newTab === activeTab) return

    // If switching away from current tab and there are unsaved changes
    if (activeTab === 'current' && hasUnsavedChanges) {
      setPendingTab(newTab)
      setShowUnsavedDialog(true)
      return
    }

    setActiveTab(newTab)
  }, [activeTab, hasUnsavedChanges])

  // Handle unsaved changes dialog actions
  const handleContinueWithoutSaving = () => {
    if (pendingTab) {
      setActiveTab(pendingTab)
      setHasUnsavedChanges(false)
    }
    setShowUnsavedDialog(false)
    setPendingTab(null)
  }

  const handleCancelTabSwitch = () => {
    setShowUnsavedDialog(false)
    setPendingTab(null)
  }

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!confirm('عندك تعديلات غير محفوظة. هل تريد الإغلاق بدون حفظ؟')) {
        return
      }
    }
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="تفاصيل الإجابة"
        size="xl"
      >
        <div className="flex flex-col h-full">
          {/* Tab Header */}
          <div className="flex border-b border-neutral-200 mb-6" dir="rtl">
            <button
              onClick={() => handleTabSwitch('current')}
              className={`flex-1 px-6 py-4 text-base font-bold transition-all relative ${
                activeTab === 'current'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📝</span>
                <span>الطالب الحالي (قيد التصحيح)</span>
                {hasUnsavedChanges && activeTab === 'current' && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full" title="تعديلات غير محفوظة"></span>
                )}
              </span>
              {activeTab === 'current' && (
                <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => handleTabSwitch('winners')}
              className={`flex-1 px-6 py-4 text-base font-bold transition-all relative ${
                activeTab === 'winners'
                  ? 'text-green-700 bg-green-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏆</span>
                <span>الفائزون المعتمدون</span>
              </span>
              {activeTab === 'winners' && (
                <div className="absolute bottom-0 right-0 left-0 h-1 bg-green-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'current' ? (
              <CurrentSubmissionTab
                submission={submission}
                questions={questions}
                onComplete={onComplete}
                onUnsavedChanges={setHasUnsavedChanges}
              />
            ) : (
              <WinnersListTab
                competitionId={submission.competition_id}
                competitionTitle={submission.competition?.title}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 pt-4 mt-4">
            <Button
              onClick={handleClose}
              variant="secondary"
              className="w-full"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved Changes Dialog */}
      <ConfirmDialog
        isOpen={showUnsavedDialog}
        onClose={handleCancelTabSwitch}
        onConfirm={handleContinueWithoutSaving}
        title="تعديلات غير محفوظة"
        message="عندك تعديلات غير محفوظة في تصحيح الطالب الحالي. تبي تكمّل بدون حفظ؟"
        confirmLabel="متابعة بدون حفظ"
        cancelLabel="إلغاء"
        variant="warning"
      />
    </>
  )
}
