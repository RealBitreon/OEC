'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CurrentSubmissionTab } from './CurrentSubmissionTab'

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

export function AnswerDetailsModal({ isOpen, onClose, submission, questions, onComplete }: Props) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasUnsavedChanges(false)
    }
  }, [isOpen])

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تفاصيل الإجابة"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CurrentSubmissionTab
            submission={submission}
            questions={questions}
            onComplete={onComplete}
            onUnsavedChanges={setHasUnsavedChanges}
          />
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
  )
}
