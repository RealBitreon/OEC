/**
 * useUndoAction Hook
 * 
 * Provides undo functionality for destructive actions
 * Shows a toast with undo button and delays actual execution
 * 
 * Usage:
 * ```typescript
 * const { executeWithUndo } = useUndoAction()
 * 
 * const handleDelete = () => {
 *   executeWithUndo({
 *     action: async () => await deleteItem(id),
 *     message: 'تم حذف العنصر',
 *     undoMessage: 'تم التراجع عن الحذف',
 *     delay: 5000
 *   })
 * }
 * ```
 */

'use client'

import { useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'

interface UndoActionOptions {
  action: () => Promise<void>
  message: string
  undoMessage?: string
  delay?: number // milliseconds, default 5000
  onUndo?: () => void
  onExecute?: () => void
}

export function useUndoAction() {
  const { showToast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const cancelledRef = useRef(false)

  const executeWithUndo = useCallback(async ({
    action,
    message,
    undoMessage = 'تم التراجع',
    delay = 5000,
    onUndo,
    onExecute
  }: UndoActionOptions) => {
    cancelledRef.current = false

    // Show toast with undo option
    showToast(
      `${message} - سيتم التنفيذ خلال ${delay / 1000} ثوانٍ`,
      'info'
    )

    // Set timeout for actual execution
    timeoutRef.current = setTimeout(async () => {
      if (!cancelledRef.current) {
        try {
          await action()
          onExecute?.()
          showToast('تم التنفيذ بنجاح', 'success')
        } catch (error) {
          console.error('Action failed:', error)
          showToast('فشل التنفيذ', 'error')
        }
      }
    }, delay)

    // Return cancel function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        cancelledRef.current = true
        onUndo?.()
        showToast(undoMessage, 'info')
      }
    }
  }, [showToast])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      cancelledRef.current = true
    }
  }, [])

  return { executeWithUndo, cancel }
}
