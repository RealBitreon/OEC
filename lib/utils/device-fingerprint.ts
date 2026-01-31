/**
 * Device Fingerprinting Utility
 * Creates a unique identifier for each device/browser combination
 * Uses multiple browser characteristics to create a stable fingerprint
 */

export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side'
  }

  const components: string[] = []

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`)
  components.push(`${window.screen.colorDepth}`)

  // Timezone
  components.push(`${new Date().getTimezoneOffset()}`)

  // Language
  components.push(navigator.language || 'unknown')

  // Platform
  components.push(navigator.platform || 'unknown')

  // User Agent (simplified)
  components.push(navigator.userAgent || 'unknown')

  // Hardware concurrency (CPU cores)
  components.push(`${navigator.hardwareConcurrency || 0}`)

  // Device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory) {
    components.push(`${deviceMemory}`)
  }

  // Canvas fingerprint (lightweight version)
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('fingerprint', 2, 2)
      components.push(canvas.toDataURL().slice(0, 50))
    }
  } catch (e) {
    // Canvas fingerprinting blocked or failed
  }

  // Combine all components and hash
  const fingerprint = components.join('|')
  return hashString(fingerprint)
}

/**
 * Simple hash function for creating fingerprint
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Store fingerprint in cookie and localStorage for persistence
 */
export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side'
  }

  // Check localStorage first
  const stored = localStorage.getItem('device_fp')
  if (stored) {
    return stored
  }

  // Check cookie
  const cookieMatch = document.cookie.match(/device_fp=([^;]+)/)
  if (cookieMatch) {
    const fp = cookieMatch[1]
    localStorage.setItem('device_fp', fp)
    return fp
  }

  // Generate new fingerprint
  const fingerprint = generateDeviceFingerprint()
  
  // Store in localStorage
  localStorage.setItem('device_fp', fingerprint)
  
  // Store in cookie (1 year expiry)
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `device_fp=${fingerprint}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
  
  return fingerprint
}

/**
 * Clear fingerprint (for testing)
 */
export function clearFingerprint(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('device_fp')
  document.cookie = 'device_fp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}
