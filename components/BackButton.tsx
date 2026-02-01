'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackUrl?: string
  label?: string
  className?: string
  variant?: 'default' | 'minimal' | 'primary'
  forceUrl?: boolean
}

export default function BackButton({ 
  fallbackUrl = '/', 
  label = 'العودة',
  className = '',
  variant = 'default',
  forceUrl = false
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // If forceUrl is true, always use fallbackUrl (for participation pages)
    if (forceUrl) {
      router.push(fallbackUrl)
      return
    }
    
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to specified URL if no history
      router.push(fallbackUrl)
    }
  }

  const variantStyles = {
    default: 'inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium',
    minimal: 'inline-flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors text-sm',
    primary: 'inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium'
  }

  return (
    <button
      onClick={handleBack}
      className={`${variantStyles[variant]} ${className}`}
      aria-label={label}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
