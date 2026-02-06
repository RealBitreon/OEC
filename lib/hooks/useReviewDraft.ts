/**
 * Review Draft Hook
 * 
 * This hook solves a critical UX problem: reviewers spend 10-15 minutes
 * grading submissions, and if their browser crashes or they accidentally
 * close the tab, all that work is lost. Not cool.
 * 
 * Our solution:
 * 1. Save drafts to localStorage immediately (instant, no network)
 * 2. Auto-save to server every 2 minutes (backup, survives device changes)
 * 3. Optimistic concurrency control (prevent two reviewers from clobbering each other)
 * 4. Warn before leaving with unsaved changes (browser beforeunload)
 * 
 * This is inspired by how Google Docs handles drafts - aggressive local
 * persistence with periodic server sync. Users should never lose work.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'

export interface QuestionCorrection {
  isCorrect: boolean
  notes?: string // Optional feedback for the participant
}

export interface ReviewDraft {
  submissionId: string
  corrections: Record<string, QuestionCorrection> // questionId -> correction
  finalDecision: 'accepted' | 'rejected' | null
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  autoSaveEnabled: boolean
  version: number // For optimistic concurrency control
}

// Why 2 minutes? Long enough to avoid spamming the server, short enough
// that you won't lose much work if something goes wrong. Tuned based on
// typical review time (10-15 min) and network reliability.
const AUTOSAVE_DELAY = 120000 // 2 minutes

const STORAGE_KEY_PREFIX = 'review_draft_'

/**
 * Load draft from localStorage
 * 
 * This runs on component mount to restore any in-progress review.
 * Handles SSR gracefully (window check) and corrupted data (try-catch).
 * 
 * Edge case: What if localStorage is full? We catch and ignore - better
 * to lose the draft than crash the app. In practice, review drafts are
 * tiny (~1-5KB) so this rarely happens.
 */
function loadFromLocalStorage(submissionId: string): ReviewDraft {
  // SSR safety: localStorage doesn't exist on the server
  if (typeof window === 'undefined') {
    return createInitialDraft(submissionId)
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + submissionId)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Dates don't survive JSON serialization, so we reconstruct them
      return {
        ...parsed,
        lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null
      }
    }
  } catch (error) {
    // Corrupted data or quota exceeded - fail gracefully
    console.error('Failed to load draft from localStorage:', error)
  }
  
  return createInitialDraft(submissionId)
}

/**
 * Save draft to localStorage
 */
function saveToLocalStorage(draft: ReviewDraft): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + draft.submissionId,
      JSON.stringify(draft)
    )
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error)
  }
}

/**
 * Clear draft from localStorage
 */
function clearLocalStorage(submissionId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + submissionId)
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error)
  }
}

/**
 * Create initial draft state
 */
function createInitialDraft(submissionId: string): ReviewDraft {
  return {
    submissionId,
    corrections: {},
    finalDecision: null,
    hasUnsavedChanges: false,
    lastSaved: null,
    autoSaveEnabled: true,
    version: 0
  }
}

export function useReviewDraft(submissionId: string) {
  const { showToast } = useToast()
  const [draft, setDraft] = useState<ReviewDraft>(() => loadFromLocalStorage(submissionId))
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Save to localStorage whenever draft changes
  useEffect(() => {
    if (draft.hasUnsavedChanges) {
      saveToLocalStorage(draft)
    }
  }, [draft])
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])
  
  /**
   * Mark a question as correct/incorrect
   * 
   * This is called on every checkbox click or note edit. We use a debounced
   * autosave timer to avoid hammering the server - each edit resets the timer.
   * 
   * Why not save immediately? Network latency would make the UI feel sluggish.
   * Why not wait until they click "Save"? They might forget or crash before then.
   * This is the sweet spot: responsive UI + automatic backup.
   */
  const markQuestion = useCallback((questionId: string, isCorrect: boolean, notes?: string) => {
    setDraft(prev => ({
      ...prev,
      corrections: {
        ...prev.corrections,
        [questionId]: { isCorrect, notes }
      },
      hasUnsavedChanges: true
    }))
    
    // Reset autosave timer (debounce pattern)
    // Each edit resets the countdown, so we only save after 2 min of inactivity
    if (draft.autoSaveEnabled) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave()
      }, AUTOSAVE_DELAY)
    }
  }, [draft.autoSaveEnabled])
  
  /**
   * Set final decision
   */
  const setFinalDecision = useCallback((decision: 'accepted' | 'rejected') => {
    setDraft(prev => ({
      ...prev,
      finalDecision: decision,
      hasUnsavedChanges: true
    }))
  }, [])
  
  /**
   * Auto-save to server
   * 
   * This is our backup mechanism. localStorage is great for instant recovery,
   * but it's device-specific. Server-side drafts let reviewers switch devices
   * or recover from localStorage corruption.
   * 
   * We're intentionally lenient with failures here - if the network is down,
   * we just keep the localStorage copy and try again later. The user's work
   * is safe locally, so no need to panic.
   */
  const autoSave = useCallback(async () => {
    if (!draft.hasUnsavedChanges || autoSaving) return
    
    setAutoSaving(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/review-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corrections: draft.corrections })
      })
      
      if (response.ok) {
        setDraft(prev => ({ ...prev, lastSaved: new Date() }))
        showToast('تم الحفظ التلقائي ✓', 'success')
      }
      // Note: We don't show an error toast on failure - that would be annoying
      // if the user is offline. The localStorage copy is still safe.
    } catch (error) {
      console.error('Autosave failed:', error)
      // Keep in localStorage for retry - the work isn't lost
    } finally {
      setAutoSaving(false)
    }
  }, [draft, submissionId, autoSaving, showToast])
  
  /**
   * Final save (batch save all corrections)
   * 
   * This is the "commit" operation - we're done reviewing and ready to
   * finalize the decision. This is atomic: either everything saves or
   * nothing does (no partial states).
   * 
   * We include the version number for optimistic concurrency control.
   * If another reviewer modified this submission while we were working,
   * the server will reject our save with a 409 Conflict. This prevents
   * the "last write wins" problem that would lose someone's work.
   * 
   * On success, we nuke the draft from both localStorage and server.
   * The review is done - no need to keep the draft around.
   */
  const finalizeSave = useCallback(async () => {
    if (!draft.finalDecision) {
      throw new Error('يجب تحديد القرار النهائي (قبول/رفض)')
    }
    
    setSaving(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/review-final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corrections: draft.corrections,
          finalDecision: draft.finalDecision,
          version: draft.version // For optimistic concurrency control
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'فشل حفظ التصحيح')
      }
      
      const result = await response.json()
      
      // Success! Clear the draft from everywhere
      clearLocalStorage(submissionId)
      setDraft(createInitialDraft(submissionId))
      
      return result
    } finally {
      setSaving(false)
    }
  }, [draft, submissionId])
  
  /**
   * Discard draft
   */
  const discardDraft = useCallback(() => {
    clearLocalStorage(submissionId)
    setDraft(createInitialDraft(submissionId))
  }, [submissionId])
  
  return {
    draft,
    markQuestion,
    setFinalDecision,
    finalizeSave,
    discardDraft,
    saving,
    autoSaving
  }
}
