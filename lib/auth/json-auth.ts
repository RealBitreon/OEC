import { cookies } from 'next/headers'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const DATA_DIR = join(process.cwd(), 'data')

export interface User {
  id: string
  username: string
  password: string // hashed
  role: 'STUDENT' | 'LRC_MANAGER' | 'CEO'
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
}

// Role codes from env
const ROLE_CODES = {
  ceo: process.env.CEO_ROLE_CODE || 'CEO2024',
  manager: process.env.MANAGER_ROLE_CODE || 'MANAGER2024',
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function readUsers(): User[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'users.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeUsers(users: User[]): void {
  writeFileSync(join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2))
}

function readSessions(): Session[] {
  try {
    const data = readFileSync(join(DATA_DIR, 'sessions.json'), 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeSessions(sessions: Session[]): void {
  writeFileSync(join(DATA_DIR, 'sessions.json'), JSON.stringify(sessions, null, 2))
}

export async function signup(username: string, password: string, roleCode: string): Promise<{ success: boolean; error?: string; user?: User }> {
  // Validate
  if (!username || !password || !roleCode) {
    return { success: false, error: 'اسم المستخدم وكلمة المرور ورمز الدور مطلوبة' }
  }

  if (username.length < 3 || username.length > 30) {
    return { success: false, error: 'اسم المستخدم يجب أن يكون بين 3 و 30 حرف' }
  }

  if (password.length < 6) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  }

  // Determine role
  let role: User['role']
  if (roleCode === ROLE_CODES.ceo) {
    role = 'CEO'
  } else if (roleCode === ROLE_CODES.manager) {
    role = 'LRC_MANAGER'
  } else {
    return { success: false, error: 'رمز الدور غير صحيح' }
  }

  const users = readUsers()

  // Check if username exists
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'اسم المستخدم موجود بالفعل' }
  }

  // Create user
  const user: User = {
    id: crypto.randomUUID(),
    username,
    password: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  writeUsers(users)

  return { success: true, user }
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User; sessionId?: string }> {
  if (!username || !password) {
    return { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' }
  }

  const users = readUsers()
  const user = users.find(u => u.username === username && u.password === hashPassword(password))

  if (!user) {
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }
  }

  // Check if user has dashboard access
  const allowedRoles = ['LRC_MANAGER', 'CEO']
  if (!allowedRoles.includes(user.role)) {
    return { success: false, error: 'ليس لديك صلاحية الوصول إلى لوحة التحكم' }
  }

  // Create session
  const sessionId = crypto.randomUUID()
  const sessions = readSessions()
  
  // Remove old sessions for this user
  const filteredSessions = sessions.filter(s => s.userId !== user.id)
  
  const session: Session = {
    id: sessionId,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  }

  filteredSessions.push(session)
  writeSessions(filteredSessions)

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return { success: true, user, sessionId }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    const sessions = readSessions()
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    writeSessions(filteredSessions)
  }

  cookieStore.delete('session')
}

export async function getSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    return null
  }

  const sessions = readSessions()
  const session = sessions.find(s => s.id === sessionId)

  if (!session) {
    return null
  }

  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    // Remove expired session
    const filteredSessions = sessions.filter(s => s.id !== sessionId)
    writeSessions(filteredSessions)
    cookieStore.delete('session')
    return null
  }

  const users = readUsers()
  const user = users.find(u => u.id === session.userId)

  if (!user) {
    return null
  }

  return { user }
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session.user
}
