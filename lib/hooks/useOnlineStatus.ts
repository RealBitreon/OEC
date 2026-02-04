/**
 * useOnlineStatus Hook
 * 
 * Detects and tracks online/offline status
 * 
 * Usage:
 * ```typescript
 * const isOnline = useOnlineStatus()
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />
 * }
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      console.log('[Network] Back online')
      setIsOnline(true)
    }
    
    const handleOffline = () => {
      console.log('[Network] Gone offline')
      setIsOnline(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}
