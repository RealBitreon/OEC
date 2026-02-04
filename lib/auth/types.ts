export interface SessionPayload {
  id: string
  username: string
  email: string
  role: 'CEO' | 'LRC_MANAGER' | 'student'
  displayName?: string
}

// Role hierarchy (highest to lowest)
export const ROLES = {
  CEO: 'CEO',
  LRC_MANAGER: 'LRC_MANAGER',
  STUDENT: 'student'
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Helper functions
export function isAdmin(role: string): boolean {
  return role === ROLES.CEO || role === ROLES.LRC_MANAGER
}

export function isCEO(role: string): boolean {
  return role === ROLES.CEO
}
