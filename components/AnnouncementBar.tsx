'use client'

import { useState } from 'react'

interface AnnouncementBarProps {
  onClose?: () => void
}

export default function AnnouncementBar({ onClose }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-l from-secondary to-secondary-light text-primary-dark py-3 px-4">
      <div className="section-container">
        <div className="flex items-center justify-center gap-3 text-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-bold text-sm md:text-base">
            المسابقة جارية الآن — شارك واربح جوائز قيّمة!
          </p>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9C6 9 6 4 12 4C18 4 18 9 18 9V13C18 13 18 18 12 18C6 18 6 13 6 13V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V22M8 22H16M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-dark hover:text-primary transition-colors"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  )
}
