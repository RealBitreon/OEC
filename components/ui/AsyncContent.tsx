/**
 * AsyncContent Component
 * 
 * This is our universal wrapper for async data. Instead of writing the same
 * loading/error/empty logic in every component, we centralize it here.
 * 
 * This pattern is inspired by React Suspense but works with any async data,
 * not just React.lazy(). It's especially useful for:
 * - API calls that might fail
 * - Database queries that might be empty
 * - Long-running operations that need loading states
 * 
 * The component automatically handles:
 * - Loading skeletons (table, card, or custom)
 * - Error states with retry buttons
 * - Empty states with helpful messages
 * - Success states (just renders children)
 * 
 * This keeps our components clean and focused on the happy path, while
 * ensuring consistent UX for edge cases.
 */

'use client'

import { ReactNode } from 'react'
import { TableSkeleton } from './TableSkeleton'
import { CardSkeleton } from './CardSkeleton'
import { ErrorState } from './EmptyState'
import { Button } from './Button'

interface AsyncContentProps {
  loading: boolean
  error?: Error | string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  loadingType?: 'table' | 'card' | 'custom'
  loadingRows?: number
  loadingColumns?: number
  children: ReactNode
  className?: string
}

export function AsyncContent({
  loading,
  error,
  empty = false,
  emptyMessage = 'لا توجد بيانات',
  onRetry,
  loadingType = 'custom',
  loadingRows = 5,
  loadingColumns = 4,
  children,
  className = ''
}: AsyncContentProps) {
  // Priority order: loading > error > empty > success
  // This ensures we show the most relevant state to the user
  
  if (loading) {
    // Show appropriate skeleton based on content type
    // This gives users a visual hint of what's loading
    if (loadingType === 'table') {
      return (
        <div className={className}>
          <TableSkeleton rows={loadingRows} columns={loadingColumns} />
        </div>
      )
    }
    
    if (loadingType === 'card') {
      return (
        <div className={className}>
          <CardSkeleton count={loadingRows} />
        </div>
      )
    }
    
    // Custom loading - generic spinner
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Show error state with optional retry button
    // We accept both Error objects and strings for flexibility
    return (
      <div className={className}>
        <ErrorState
          message={typeof error === 'string' ? error : error.message}
          onRetry={onRetry}
        />
      </div>
    )
  }

  if (empty) {
    // Show empty state - this is different from error
    // Empty means the operation succeeded but returned no data
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-neutral-600">{emptyMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" className="mt-4">
            تحديث
          </Button>
        )}
      </div>
    )
  }

  // Success state - just render the children
  return <div className={className}>{children}</div>
}
