import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * API endpoint to migrate competition questions to training
 * POST /api/competitions/[id]/migrate-training
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = params.id
    const body = await request.json()
    const { mode = 'auto' } = body // 'auto' or 'manual'
    
    const supabase = createServiceClient()
    
    // Get competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()
    
    if (compError || !competition) {
      return NextResponse.json(
        { error: 'المسابقة غير موجودة' },
        { status: 404 }
      )
    }
    
    // Only allow for ended/archived competitions
    if (competition.status === 'active') {
      return NextResponse.json(
        { error: 'لا يمكن نقل أسئلة مسابقة نشطة' },
        { status: 400 }
      )
    }
    
    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('competition_id', competitionId)
    
    if (questionsError) {
      return NextResponse.json(
        { error: `فشل جلب الأسئلة: ${questionsError.message}` },
        { status: 500 }
      )
    }
    
    // Get winner submissions if auto mode
    let winnerAnswers: Record<string, string> = {}
    
    if (mode === 'auto') {
      const { data: winners } = await supabase
        .from('submissions')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('is_winner', true)
        .order('submitted_at', { ascending: true })
        .limit(1)
      
      if (winners && winners.length > 0) {
        const firstWinner = winners[0]
        const answers = firstWinner.answers || []
        
        for (const answer of answers) {
          winnerAnswers[answer.question_id] = answer.answer
        }
      }
    }
    
    // Migrate questions
    const migrated: string[] = []
    const skipped: string[] = []
    const errors: Array<{ questionId: string; error: string }> = []
    
    for (const question of questions || []) {
      try {
        let correctAnswer = question.correct_answer
        
        // Use winner answer if no official answer
        if (!correctAnswer && mode === 'auto') {
          correctAnswer = winnerAnswers[question.id]
        }
        
        // Skip if no answer
        if (!correctAnswer) {
          skipped.push(question.id)
          continue
        }
        
        // Update question
        const { error } = await supabase
          .from('questions')
          .update({
            competition_id: null,
            is_training: true,
            status: 'PUBLISHED',
            correct_answer: correctAnswer,
            updated_at: new Date().toISOString()
          })
          .eq('id', question.id)
        
        if (error) throw error
        
        migrated.push(question.id)
      } catch (err: any) {
        errors.push({
          questionId: question.id,
          error: err.message
        })
      }
    }
    
    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'migrate_to_training',
      entity_type: 'competition',
      entity_id: competitionId,
      details: {
        mode,
        total: questions?.length || 0,
        migrated: migrated.length,
        skipped: skipped.length,
        errors: errors.length
      }
    })
    
    return NextResponse.json({
      success: true,
      migrated: migrated.length,
      skipped: skipped.length,
      errors: errors.length,
      details: {
        migrated,
        skipped,
        errors
      }
    })
    
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Get migration preview
 * GET /api/competitions/[id]/migrate-training
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = params.id
    const supabase = createServiceClient()
    
    // Get competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()
    
    if (compError || !competition) {
      return NextResponse.json(
        { error: 'المسابقة غير موجودة' },
        { status: 404 }
      )
    }
    
    // Get questions count
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId)
    
    // Get questions with official answers
    const { count: withAnswers } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId)
      .not('correct_answer', 'is', null)
    
    // Get winner count
    const { count: winnerCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId)
      .eq('is_winner', true)
    
    return NextResponse.json({
      competition: {
        id: competition.id,
        title: competition.title,
        status: competition.status
      },
      stats: {
        totalQuestions: totalQuestions || 0,
        withOfficialAnswers: withAnswers || 0,
        withoutAnswers: (totalQuestions || 0) - (withAnswers || 0),
        winnerCount: winnerCount || 0
      }
    })
    
  } catch (error: any) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
