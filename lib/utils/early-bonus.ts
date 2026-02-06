/**
 * Early Submission Bonus Calculator
 * 
 * Rewards people who submit early to encourage participation and reduce
 * last-minute server load. This is a common pattern in competitive systems
 * (think early-bird discounts, pre-order bonuses, etc.)
 * 
 * The math here is carefully tuned to be fair but meaningful:
 * - Early birds get a real advantage, but not an overwhelming one
 * - Late submissions still have a chance (we're not cruel)
 * - The curve can be linear (steady decline) or exponential (front-loaded)
 */

export interface EarlyBonusConfig {
  max_multiplier: number // e.g., 2.0 means early birds get 2x weight
  decay_function: 'linear' | 'exponential'
}

/**
 * Calculate early submission bonus weight
 * 
 * This function answers: "How much extra weight should this submission get
 * based on when it was submitted?"
 * 
 * Example scenarios:
 * - Submit on day 1 of 30: Get full bonus (e.g., 2.0x)
 * - Submit on day 15 of 30: Get partial bonus (e.g., 1.5x)
 * - Submit on day 30 of 30: Get no bonus (1.0x)
 * 
 * Why 30 days hardcoded? Most competitions run for a month. If we need
 * flexibility later, we can make this configurable. For now, KISS principle.
 * 
 * @param submittedAt - When the submission was made
 * @param competitionEndAt - When the competition ends
 * @param config - Bonus configuration
 * @returns Multiplier between 1.0 and max_multiplier
 */
export function calculateEarlyBonus(
  submittedAt: Date | string,
  competitionEndAt: Date | string,
  config: EarlyBonusConfig
): number {
  const submitted = new Date(submittedAt)
  const endDate = new Date(competitionEndAt)
  
  // Assume competition starts 30 days before end
  // TODO: Make this configurable if we start running shorter/longer competitions
  const competitionStart = new Date(endDate)
  competitionStart.setDate(competitionStart.getDate() - 30)
  
  const totalDuration = endDate.getTime() - competitionStart.getTime()
  const timeFromStart = submitted.getTime() - competitionStart.getTime()
  
  // Normalize to 0-1 range (0 = earliest, 1 = latest)
  // The Math.max/min ensures we handle edge cases (submissions before start
  // or after end) gracefully
  const normalizedTime = Math.max(0, Math.min(1, timeFromStart / totalDuration))
  
  let weight: number
  
  if (config.decay_function === 'linear') {
    // Linear decay: steady, predictable decline
    // Good for when you want a simple, easy-to-explain system
    // Formula: weight = max - (progress * (max - 1))
    weight = config.max_multiplier - (normalizedTime * (config.max_multiplier - 1.0))
  } else {
    // Exponential decay: front-loaded bonus
    // Good for when you really want to incentivize early action
    // The first few days give most of the bonus, then it tapers off
    const decayRate = 2.0 // Tuned through experimentation - feel free to adjust
    weight = 1.0 + (config.max_multiplier - 1.0) * Math.exp(-decayRate * normalizedTime)
  }
  
  // Defensive programming: ensure weight is within bounds
  // This protects against floating-point precision issues and config errors
  return Math.max(1.0, Math.min(config.max_multiplier, weight))
}

/**
 * Format early bonus weight for display
 */
export function formatEarlyBonus(weight: number): string {
  if (weight === 1.0) return 'لا توجد مكافأة'
  const percentage = ((weight - 1.0) * 100).toFixed(1)
  return `+${percentage}% مكافأة`
}
