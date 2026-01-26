import { createHash } from 'crypto'

/**
 * Deterministic Fisher-Yates shuffle based on a seed
 */
export function deterministicShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array]
  const rng = seededRandom(seed)
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Seeded random number generator (simple LCG)
 */
function seededRandom(seed: string): () => number {
  // Convert seed to number using hash
  const hash = createHash('sha256').update(seed).digest('hex')
  let state = parseInt(hash.substring(0, 8), 16)
  
  return function() {
    // Linear Congruential Generator
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/**
 * Generate shuffle seed for a student
 */
export function generateShuffleSeed(studentSessionId: string, competitionId: string): string {
  return createHash('sha256')
    .update(`${studentSessionId}:${competitionId}`)
    .digest('hex')
}
