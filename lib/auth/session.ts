import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import type { SessionPayload } from './types'

const COOKIE_NAME = 'session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_COOKIE_SECRET
  if (!secret) {
    throw new Error(
      '❌ AUTH_COOKIE_SECRET is not set in environment variables.\n' +
      'Please add AUTH_COOKIE_SECRET=your-secret-key-here to your .env file'
    )
  }
  return secret
}

export function signSession(payload: SessionPayload): string {
  const secret = getSecret()
  const payloadJson = JSON.stringify(payload)
  const payloadBase64 = Buffer.from(payloadJson).toString('base64')
  
  const signature = createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('hex')
  
  return `${payloadBase64}.${signature}`
}

export function verifySession(cookieValue: string): SessionPayload | null {
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

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const signedValue = signSession(payload)
  const cookieStore = await cookies()
  
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  
  if (!cookie?.value) {
    return null
  }
  
  return verifySession(cookie.value)
}
