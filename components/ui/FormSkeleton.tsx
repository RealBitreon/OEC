/**
 * FormSkeleton Component
 * 
 * Loading skeleton for form displays
 */

'use client'

import { Skeleton } from './Skeleton'

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 4, className = '' }: FormSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          {/* Label */}
          <Skeleton className="h-5 w-32 mb-2" />
          
          {/* Input */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
      
      {/* Submit Button */}
      <div className="pt-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}
