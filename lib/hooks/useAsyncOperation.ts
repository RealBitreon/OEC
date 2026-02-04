/**
 * useAsyncOperation Hook
 * 
 * Provides consistent async operation handling with:
 * - Automatic loading state management
 * - Error handling with timeout
 * - Success/error callbacks
 * - Cleanup on unmount
 * 
 * Usage:
 * ```typescript
 * const { loading, error, execute } = useAsyncOperation()
 * 
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     return await submitData()
 *   }, {
 *     onSuccess: (data) => showToast('نجح!', 'success'),
 *     onError: (err) => showToast(err.message, 'error'),
 *     timeout: 30000
 *   })
 * }
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  timeout?: number // milliseconds, default 30000 (30s)
}

export interface AsyncOperationState<T> {
  loading: boolean
  error: string | null
  data: T | null
}

export function useAsyncOperation<T = void>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const mountedRef = useRef(true)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: AsyncOperationOptions<T>
  ): Promise<T | null> => {
    // Only update state if component is still mounted
    if (!mountedRef.current) return null
    
    setLoading(true)
    setError(null)
    
    // Set timeout
    const timeoutMs = options?.timeout || 30000
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        const timeoutError = 'انتهت مهلة العملية. يرجى المحاولة مرة أخرى'
        setError(timeoutError)
        setLoading(false)
        options?.onError?.(new Error(timeoutError))
      }
    }, timeoutMs)
    
    try {
      const result = await operation()
      
      // Clear timeout on success
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      if (mountedRef.current) {
        setData(result)
        setLoading(false)
        options?.onSuccess?.(result)
      }
      
      return result
    } catch (err: any) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      if (mountedRef.current) {
        const errorMessage = err.message || 'حدث خطأ غير متوقع'
        setError(errorMessage)
        setLoading(false)
        options?.onError?.(err)
      }
      
      throw err
    }
  }, [])
  
  const reset = useCallback(() => {
    if (mountedRef.current) {
      setLoading(false)
      setError(null)
      setData(null)
    }
  }, [])
  
  return { 
    loading, 
    error, 
    data, 
    execute, 
    reset,
    // Convenience getters
    isIdle: !loading && !error && !data,
    isLoading: loading,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null
  }
}
