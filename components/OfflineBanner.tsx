/**
 * OfflineBanner Component
 * 
 * Shows a banner when the user is offline
 * Automatically hides when back online
 */

'use client'

import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [show, setShow] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  
  useEffect(() => {
    if (!isOnline) {
      setShow(true)
      setWasOffline(true)
    } else if (wasOffline) {
      // Show "back online" message briefly
      setTimeout(() => setShow(false), 3000)
    }
  }, [isOnline, wasOffline])
  
  if (!show) return null
  
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-300 ${
        isOnline ? 'translate-y-0' : 'translate-y-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {!isOnline ? (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-center gap-3">
            <svg 
              className="w-5 h-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
              />
            </svg>
            <div className="flex-1 text-center">
              <p className="font-bold text-sm sm:text-base">
                ⚠️ لا يوجد اتصال بالإنترنت
              </p>
              <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                يرجى التحقق من اتصالك بالإنترنت للمتابعة
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 shadow-lg animate-slide-down">
          <div className="container mx-auto flex items-center justify-center gap-3">
            <svg 
              className="w-5 h-5 flex-shrink-0" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="font-bold text-sm sm:text-base">
              ✓ تم استعادة الاتصال بالإنترنت
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
