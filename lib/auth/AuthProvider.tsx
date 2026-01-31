'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  id: string
  username: string
  email?: string
  role: 'CEO' | 'LRC_MANAGER'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

/**
 * Auth Provider - Fetches session ONCE on mount
 * NO polling, NO refetching, NO background requests
 * Session is cached in memory for the entire app lifecycle
 * 
 * CRITICAL: This component MUST NOT refetch on:
 * - Route changes
 * - Window focus
 * - Component re-renders
 * - Any other event
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [loading, setLoading] = useState(false) // Start with false
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(!!initialUser)

  useEffect(() => {
    // CRITICAL: Only fetch ONCE per app lifecycle
    if (hasFetched) {
      return
    }

    // Mark as fetched immediately to prevent duplicate requests
    setHasFetched(true)

    // Fetch session ONCE on mount
    let mounted = true

    fetch('/api/session', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
      .then(async res => {
        if (!mounted) return
        
        const data = await res.json()
        
        // If 401, user is not authenticated - this is OK, not an error
        if (res.status === 401) {
          setUser(null)
          setError('Not authenticated')
          setLoading(false)
          return
        }
        
        // If other error status
        if (!res.ok) {
          throw new Error(`Session API returned ${res.status}`)
        }
        
        // Success - we have a user
        if (data.user) {
          setUser(data.user)
          setError(null)
        } else {
          setUser(null)
          setError('No user data')
        }
        
        setLoading(false)
      })
      .catch(err => {
        if (!mounted) return
        console.error('Failed to fetch session:', err)
        setUser(null)
        setError('Failed to load session')
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [hasFetched]) // Depend on hasFetched to ensure single execution

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}
