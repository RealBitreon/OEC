import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

/**
 * WINNER SELECTION SIMULATOR
 * 
 * Simulates the draw process and selects multiple winners
 * Uses weighted random selection based on ticket counts
 */

interface Candidate {
  studentUsername: string
  displayName?: string
  tickets: number
}

interface Winner {
  username: string
  displayName: string
  ticketIndex: number
  position: number // 1st, 2nd, 3rd place
}

/**
 * Weighted random selection
 * Each ticket represents one entry in the pool
 */
function selectWinner(candidates: Candidate[], excludeUsernames: string[] = []): Winner | null {
  // Filter out already selected winners
  const availableCandidates = candidates.filter(
    c => !excludeUsernames.includes(c.studentUsername) && c.tickets > 0
  )
  
  if (availableCandidates.length === 0) {
    return null
  }
  
  // Build ticket pool
  const ticketPool: { username: string; displayName: string; ticketIndex: number }[] = []
  let ticketIndex = 0
  
  for (const candidate of availableCandidates) {
    for (let i = 0; i < candidate.tickets; i++) {
      ticketPool.push({
        username: candidate.studentUsername,
        displayName: candidate.displayName || candidate.studentUsername,
        ticketIndex: ticketIndex++
      })
    }
  }
  
  // Random selection
  const randomIndex = Math.floor(Math.random() * ticketPool.length)
  const selected = ticketPool[randomIndex]
  
  return {
    username: selected.username,
    displayName: selected.displayName,
    ticketIndex: selected.ticketIndex,
    position: 0 // Will be set by caller
  }
}

/**
 * Select multiple winners without replacement
 */
function selectMultipleWinners(candidates: Candidate[], count: number): Winner[] {
  const winners: Winner[] = []
  const excludeUsernames: string[] = []
  
  for (let position = 1; position <= count; position++) {
    const winner = selectWinner(candidates, excludeUsernames)
    
    if (!winner) {
      break // No more candidates available
    }
    
    winner.position = position
    winners.push(winner)
    excludeUsernames.push(winner.username)
  }
  
  return winners
}

/**
 * POST /api/wheel/simulate
 * Simulates winner selection for a competition
 */
export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  
  try {
    const body = await request.json()
    const { competitionId, winnerCount, dryRun = true } = body
    
    console.log(`[${correlationId}] Simulate request:`, {
      competitionId,
      winnerCount,
      dryRun
    })
    
    if (!competitionId) {
      return NextResponse.json(
        { error: 'Competition ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Get competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()
    
    if (compError || !competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }
    
    // Use competition's winner_count if not specified
    const finalWinnerCount = winnerCount || competition.winner_count || 1
    
    // Get eligible submissions (approved or with tickets)
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .eq('competition_id', competitionId)
      .gt('tickets_earned', 0)
      .order('submitted_at', { ascending: true })
    
    if (subError) {
      console.error(`[${correlationId}] Error fetching submissions:`, subError)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }
    
    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        { error: 'No eligible candidates found' },
        { status: 404 }
      )
    }
    
    // Build candidate list
    const candidateMap = new Map<string, Candidate>()
    
    for (const submission of submissions) {
      const username = submission.participant_name
      const existing = candidateMap.get(username)
      
      if (existing) {
        existing.tickets += submission.tickets_earned
      } else {
        candidateMap.set(username, {
          studentUsername: username,
          displayName: username,
          tickets: submission.tickets_earned
        })
      }
    }
    
    const candidates = Array.from(candidateMap.values())
    const totalTickets = candidates.reduce((sum, c) => sum + c.tickets, 0)
    
    console.log(`[${correlationId}] Candidates:`, {
      count: candidates.length,
      totalTickets,
      requestedWinners: finalWinnerCount
    })
    
    // Select winners
    const winners = selectMultipleWinners(candidates, finalWinnerCount)
    
    console.log(`[${correlationId}] Winners selected:`, winners)
    
    // If not dry run, save to database
    if (!dryRun) {
      // Check if wheel_run exists
      const { data: existingRun } = await supabase
        .from('wheel_runs')
        .select('*')
        .eq('competition_id', competitionId)
        .single()
      
      const wheelRunData = {
        competition_id: competitionId,
        winner_count: finalWinnerCount,
        status: 'completed',
        candidates_snapshot: candidates,
        locked_snapshot: candidates,
        total_tickets: totalTickets,
        winners: winners,
        draw_metadata: {
          draw_hash: randomUUID(),
          timestamp: new Date().toISOString(),
          correlation_id: correlationId,
          total_candidates: candidates.length,
          total_tickets: totalTickets
        },
        locked_at: new Date().toISOString(),
        run_at: new Date().toISOString(),
        is_published: false,
        show_winner_names: true
      }
      
      if (existingRun) {
        // Update existing
        const { error: updateError } = await supabase
          .from('wheel_runs')
          .update(wheelRunData)
          .eq('id', existingRun.id)
        
        if (updateError) {
          console.error(`[${correlationId}] Error updating wheel run:`, updateError)
          return NextResponse.json(
            { error: 'Failed to save draw results' },
            { status: 500 }
          )
        }
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('wheel_runs')
          .insert(wheelRunData)
        
        if (insertError) {
          console.error(`[${correlationId}] Error creating wheel run:`, insertError)
          return NextResponse.json(
            { error: 'Failed to save draw results' },
            { status: 500 }
          )
        }
      }
      
      // Mark winners in submissions table
      for (const winner of winners) {
        await supabase
          .from('submissions')
          .update({ is_winner: true })
          .eq('competition_id', competitionId)
          .eq('participant_name', winner.username)
      }
    }
    
    return NextResponse.json({
      success: true,
      correlationId,
      simulation: {
        competitionId,
        competitionTitle: competition.title,
        winnerCount: finalWinnerCount,
        totalCandidates: candidates.length,
        totalTickets,
        winners,
        dryRun
      },
      candidates: candidates.map(c => ({
        username: c.studentUsername,
        tickets: c.tickets,
        probability: ((c.tickets / totalTickets) * 100).toFixed(2) + '%'
      }))
    })
    
  } catch (error: any) {
    console.error(`[${correlationId}] Simulation error:`, error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/wheel/simulate?competitionId=xxx
 * Get simulation preview without executing
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const competitionId = searchParams.get('competitionId')
  
  if (!competitionId) {
    return NextResponse.json(
      { error: 'Competition ID is required' },
      { status: 400 }
    )
  }
  
  const supabase = createServiceClient()
  
  // Get competition
  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', competitionId)
    .single()
  
  if (!competition) {
    return NextResponse.json(
      { error: 'Competition not found' },
      { status: 404 }
    )
  }
  
  // Get eligible submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('competition_id', competitionId)
    .gt('tickets_earned', 0)
  
  // Build candidate list
  const candidateMap = new Map<string, Candidate>()
  
  for (const submission of submissions || []) {
    const username = submission.participant_name
    const existing = candidateMap.get(username)
    
    if (existing) {
      existing.tickets += submission.tickets_earned
    } else {
      candidateMap.set(username, {
        studentUsername: username,
        displayName: username,
        tickets: submission.tickets_earned
      })
    }
  }
  
  const candidates = Array.from(candidateMap.values())
  const totalTickets = candidates.reduce((sum, c) => sum + c.tickets, 0)
  
  return NextResponse.json({
    competition: {
      id: competition.id,
      title: competition.title,
      winnerCount: competition.winner_count || 1
    },
    statistics: {
      totalCandidates: candidates.length,
      totalTickets,
      averageTicketsPerCandidate: candidates.length > 0 
        ? (totalTickets / candidates.length).toFixed(2) 
        : 0
    },
    candidates: candidates
      .sort((a, b) => b.tickets - a.tickets)
      .map(c => ({
        username: c.studentUsername,
        tickets: c.tickets,
        probability: ((c.tickets / totalTickets) * 100).toFixed(2) + '%'
      }))
  })
}
