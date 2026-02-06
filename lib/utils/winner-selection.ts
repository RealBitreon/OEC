/**
 * Winner Selection Algorithm
 * 
 * Implements a provably fair weighted random selection system.
 * This is the heart of our competition draw mechanism - we use crypto-grade
 * randomness to ensure nobody can game the system or predict outcomes.
 * 
 * Key design decisions:
 * - Crypto.randomBytes instead of Math.random() for true unpredictability
 * - Selection without replacement (once picked, you're out of the pool)
 * - Weights allow for ticket-based systems and early-bird bonuses
 * - Each draw is independently verifiable via hash generation
 */

import crypto from 'crypto'

export interface Candidate {
  submissionId: string
  participantName: string
  weight: number // Higher weight = better odds (tickets, bonuses, etc.)
  submittedAt: string
}

export interface Winner {
  submissionId: string
  participantName: string
  position: number // 1st, 2nd, 3rd place etc.
  weight: number
  probability: number // Their actual odds at time of selection
  totalCandidates?: number
}

/**
 * Select multiple winners using weighted random selection without replacement
 * 
 * This is essentially a lottery system where:
 * 1. Each candidate has a "weight" (think of it as lottery tickets)
 * 2. We randomly pick based on those weights
 * 3. Once someone wins, they're removed from the pool
 * 4. Repeat until we have all winners
 * 
 * Why this approach?
 * - Fair: Everyone's odds are proportional to their weight
 * - Transparent: We can prove the math checks out
 * - Flexible: Works for both simple draws and complex ticket systems
 * - Auditable: Each selection is logged with probabilities
 * 
 * @param candidates - Array of candidates with weights
 * @param count - Number of winners to select
 * @returns Array of winners with their positions and probabilities
 */
export function selectMultipleWinners(
  candidates: Candidate[],
  count: number
): Winner[] {
  if (candidates.length === 0) {
    throw new Error('No candidates available for selection')
  }
  
  const winners: Winner[] = []
  const remaining = [...candidates] // Clone so we don't mutate the original
  const totalCandidates = candidates.length
  
  // Select winners one by one
  for (let position = 1; position <= count; position++) {
    if (remaining.length === 0) break // Ran out of candidates
    
    // Calculate total weight of remaining candidates
    // This changes each round as winners are removed
    const totalWeight = remaining.reduce((sum, c) => sum + c.weight, 0)
    
    // Generate cryptographically secure random number
    // Why crypto.randomBytes? Math.random() is predictable and can be gamed.
    // We need true randomness for fairness and legal compliance.
    const randomBytes = crypto.randomBytes(4) // 4 bytes = 32 bits of entropy
    const randomValue = (randomBytes.readUInt32BE(0) / 0xFFFFFFFF) * totalWeight
    
    // Weighted selection using cumulative distribution
    // Think of it like a number line where each candidate occupies space
    // proportional to their weight. We throw a dart (randomValue) and see
    // where it lands.
    let cumulative = 0
    let selectedIndex = 0
    
    for (let i = 0; i < remaining.length; i++) {
      cumulative += remaining[i].weight
      if (randomValue <= cumulative) {
        selectedIndex = i
        break
      }
    }
    
    const selected = remaining[selectedIndex]
    
    // Record the winner with all relevant metadata
    // Probability is calculated at selection time, not beforehand,
    // because it changes as candidates are removed
    winners.push({
      submissionId: selected.submissionId,
      participantName: selected.participantName,
      position,
      weight: selected.weight,
      probability: (selected.weight / totalWeight) * 100,
      totalCandidates
    })
    
    // Remove winner from pool (no replacement)
    // This ensures one person can't win multiple prizes
    remaining.splice(selectedIndex, 1)
  }
  
  return winners
}

/**
 * Calculate probability for a candidate
 */
export function calculateProbability(
  candidateWeight: number,
  totalWeight: number
): number {
  if (totalWeight === 0) return 0
  return (candidateWeight / totalWeight) * 100
}

/**
 * Generate verification hash for draw
 * 
 * This creates a tamper-proof fingerprint of the draw results.
 * If anyone questions the fairness of the draw, we can:
 * 1. Show them the original data (competition ID, winners, timestamp)
 * 2. Regenerate the hash
 * 3. Compare to the stored hash
 * 
 * If they match, the draw hasn't been tampered with. If they don't,
 * someone messed with the results after the fact.
 * 
 * This is similar to how blockchain works - each block has a hash
 * that depends on its contents. Change the contents, the hash changes.
 * 
 * Why SHA-256? Industry standard, collision-resistant, fast enough.
 */
export function generateDrawHash(
  competitionId: string,
  winners: Winner[],
  timestamp: string
): string {
  const data = `${competitionId}-${JSON.stringify(winners)}-${timestamp}`
  return crypto.createHash('sha256').update(data).digest('hex')
}
