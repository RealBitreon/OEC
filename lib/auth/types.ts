export type UserRole = 'ceo' | 'lrc_manager' | 'student'

export interface User {
  username: string
  passwordHash: string
  role: UserRole
  createdAt: string
}

export interface SessionPayload {
  username: string
  role: UserRole
  iat: number
}
