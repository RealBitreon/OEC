/**
 * Homepage for مسابقة الموسوعة العُمانية
 * 
 * Design Match Notes:
 * - Colors: Primary (#1a5f4f), Secondary (#c4f542) matching reference green/lime palette
 * - Border Radius: 16px for cards, 12px for buttons (matching reference rounded style)
 * - Shadows: Soft shadows (0 4px 20px rgba(0,0,0,0.08)) matching reference depth
 * - Typography: Cairo/Tajawal fonts for Arabic, bold headings matching reference hierarchy
 * - Spacing: 6rem section spacing, consistent padding matching reference layout
 * - Animations: Subtle fade-in, hover lift, card transitions matching reference interactions
 * - Layout: Centered max-width container (1280px), responsive grid matching reference structure
 * - Components: Header (sticky), Hero (gradient bg), Steps (icon cards), Rules (split layout),
 *   Stats (counter cards), Questions (preview cards), Wheel (countdown teaser), Footer (dark)
 */

import HomeClient from './HomeClient'
import { competitionsRepo, questionsRepo } from '@/lib/repos'
import type { Question } from '@/lib/store/types'

export default async function Home() {
  let activeCompetition = null
  let questionsData: Question[] = []

  try {
    activeCompetition = await competitionsRepo.getActive()
  } catch (error) {
    console.error('Error fetching active competition:', error)
  }

  try {
    questionsData = await questionsRepo.listTraining()
  } catch (error) {
    console.error('Error fetching training questions:', error)
    // Continue with empty questions array
  }
  
  return <HomeClient activeCompetition={activeCompetition} questions={questionsData} />
}
