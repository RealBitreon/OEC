import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const COOKIE_NAME = 'student_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface StudentSessionPayload {
  studentSessionId: string
  competitionId: string
  name: string
  class: string
  studentNumber?: string
  createdAt: string
}

function getSecret(): string {
  const secret = process.env.AUTH_COOKIE_SECRET
  if (!secret) {
    throw new Error('AUTH_COOKIE_SECRET is not set')
  }
  return secret
}

export function signStudentSession(payload: StudentSessionPayload): string {
  const secret = getSecret()
  const payloadJson = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadJson).toString('base64')
  
  const signature = createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('hex')
  
  return `${payloadBase64}.${signature}`
}

export function verifyStudentSession(cookieValue: string): StudentSessionPayload | null {
  try {
    const secret = getSecret()
    const [payloadBase64, signature] = cookieValue.split('.')
    
    if (!payloadBase64 || !signature) {
      return null
    }
    
    const expectedSignature = createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8')
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

export async function setStudentSessionCookie(payload: StudentSessionPayload): Promise<void> {
  const signedValue = signStudentSession(payload)
  const cookieStore = await cookies()
  
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  
  if (!cookie?.value) {
    return null
  }
  
  return verifyStudentSession(cookie.value)
}

export async function clearStudentSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
