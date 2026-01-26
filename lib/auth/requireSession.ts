import { redirect } from 'next/navigation'
import { getSession } from './session'
import type { SessionPayload } from './types'

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function requireRole(allowedRoles: string[]): Promise<SessionPayload> {
  const session = await requireSession()
  
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard')
  }
  
  return session
}
