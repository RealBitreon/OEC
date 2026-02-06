/**
 * Homepage for مسابقة الموسوعة العُمانية
 * 
 * This is the main landing page that users see when they visit the site.
 * It's a server component that fetches data at request time and passes it
 * to the client component for interactivity.
 * 
 * Design Philosophy:
 * We match the reference design with:
 * - Primary color (#1a5f4f) - deep green representing Omani heritage
 * - Secondary color (#c4f542) - lime accent for energy and youth
 * - Rounded corners (16px cards, 12px buttons) - modern, friendly feel
 * - Soft shadows - depth without harshness
 * - Cairo/Tajawal fonts - excellent Arabic readability
 * - Generous spacing - breathable, not cramped
 * 
 * Performance Strategy:
 * - force-dynamic: Always fetch fresh data (competitions change frequently)
 * - revalidate: 0 - No caching (we want real-time competition status)
 * - Graceful degradation: If data fetch fails, show empty state
 * 
 * Why separate Server/Client components?
 * - Server: Fetch data, handle secrets, reduce bundle size
 * - Client: Handle interactions, animations, state management
 * This is the Next.js 13+ App Router pattern for optimal performance.
 */

import HomeClient from './HomeClient'
import { competitionsRepo, questionsRepo } from '@/lib/repos'
import type { Question } from '@/lib/store/types'

// Force dynamic rendering - we need fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  let activeCompetition = null
  let questionsData: Question[] = []

  try {
    // Check if environment variables are set
    // This prevents cryptic errors if someone forgets to configure Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured')
      return <HomeClient activeCompetition={null} questions={[]} />
    }

    // Fetch active competition (if any)
    // This determines what we show in the hero section
    activeCompetition = await competitionsRepo.getActive()
  } catch (error) {
    console.error('Error fetching active competition:', error)
    // Continue with null - HomeClient will handle the empty state
  }

  try {
    // Fetch training questions for preview
    // These show up in the "Questions Preview" section
    questionsData = await questionsRepo.listTraining()
  } catch (error) {
    console.error('Error fetching training questions:', error)
    // Continue with empty array - better to show the page than crash
  }
  
  return <HomeClient activeCompetition={activeCompetition} questions={questionsData} />
}
