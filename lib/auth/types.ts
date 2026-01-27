export interface SessionPayload {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher' | 'manager' | 'ceo'
  displayName?: string
}
