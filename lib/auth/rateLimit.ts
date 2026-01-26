// Simple in-memory rate limiter for signup attempts
interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  
  if (!entry) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    })
    return { allowed: true }
  }
  
  // Reset if window expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    })
    return { allowed: true }
  }
  
  // Check if exceeded
  if (entry.attempts >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment
  entry.attempts++
  entry.lastAttempt = now
  rateLimitStore.set(identifier, entry)
  
  return { allowed: true }
}

export function getProgressiveDelay(attempts: number): number {
  // Progressive delay: 0s, 1s, 2s, 4s, 8s...
  return Math.min(Math.pow(2, attempts - 1) * 1000, 8000)
}
