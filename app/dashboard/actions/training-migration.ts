'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

/**
 * Training Question Migration System
 * 
 * When a competition ends, this system:
 * 1. Takes all questions from the competition
 * 2. Attaches the correct answers with evidence (source references)
 * 3. If CEO/LRC hasn't set answers, uses winner answers
 * 4. If multiple winners exist, CEO can choose which answer to use
 * 5. Migrates everything to training questions
 */

export interface WinnerAnswer {
  submissionId: string
  participantName: string
  participantEmail: string
  questionId: string
  answer: string
  proof?: any
  submittedAt: string
  isWinner: boolean
}

export interface QuestionMigrationData {
  questionId: string
  questionText: string
  type: string
  category: string
  difficulty: string
  options: any[]
  correctAnswer: string | null // From CEO/LRC
  sourceRef: {
    volume: string
    page: string
    lineFrom: string
    lineTo: string
  }
  winnerAnswers: WinnerAnswer[] // Multiple winner answers if wheel was used
  hasOfficialAnswer: boolean // Whether CEO/LRC set the answer
  needsReview: boolean // True if multiple winner answers and no official answer
}

/**
 * Get all questions from an ended competition with their answers
 */
export async function getCompetitionQuestionsForMigration(competitionId: string) {
  const supabase = createServiceClient()
  
  // Get competition details
  const { data: competition, error: compError } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', competitionId)
    .single()
  
  if (compError || !competition) {
    throw new Error('المسابقة غير موجودة')
  }
  
  // Only allow migration for ended/archived competitions
  if (competition.status === 'active') {
    throw new Error('لا يمكن نقل أسئلة مسابقة نشطة')
  }
  
  // Get all questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('created_at', { ascending: true })
  
  if (questionsError) {
    throw new Error(`فشل جلب الأسئلة: ${questionsError.message}`)
  }
  
  // Get all winner submissions
  const { data: winnerSubmissions, error: winnersError } = await supabase
    .from('submissions')
    .select('*')
    .eq('competition_id', competitionId)
    .eq('is_winner', true)
    .order('submitted_at', { ascending: true })
  
  if (winnersError) {
    console.error('Error fetching winners:', winnersError)
  }
  
  // Build migration data for each question
  const migrationData: QuestionMigrationData[] = []
  
  for (const question of questions || []) {
    // Extract winner answers for this question
    const winnerAnswers: WinnerAnswer[] = []
    
    for (const submission of winnerSubmissions || []) {
      const answers = submission.answers || []
      const questionAnswer = answers.find((a: any) => a.question_id === question.id)
      
      if (questionAnswer) {
        winnerAnswers.push({
          submissionId: submission.id,
          participantName: submission.participant_name,
          participantEmail: submission.participant_email,
          questionId: question.id,
          answer: questionAnswer.answer,
          proof: questionAnswer.proof,
          submittedAt: submission.submitted_at,
          isWinner: true
        })
      }
    }
    
    const hasOfficialAnswer = !!question.correct_answer
    const needsReview = !hasOfficialAnswer && winnerAnswers.length > 1
    
    migrationData.push({
      questionId: question.id,
      questionText: question.question_text,
      type: question.type,
      category: question.category,
      difficulty: question.difficulty,
      options: question.options || [],
      correctAnswer: question.correct_answer,
      sourceRef: {
        volume: question.volume || '',
        page: question.page || '',
        lineFrom: question.line_from || '',
        lineTo: question.line_to || ''
      },
      winnerAnswers,
      hasOfficialAnswer,
      needsReview
    })
  }
  
  return {
    competition: {
      id: competition.id,
      title: competition.title,
      status: competition.status
    },
    questions: migrationData,
    totalQuestions: migrationData.length,
    questionsNeedingReview: migrationData.filter(q => q.needsReview).length,
    questionsWithOfficialAnswers: migrationData.filter(q => q.hasOfficialAnswer).length
  }
}

/**
 * Set the correct answer for a question (CEO/LRC decision)
 */
export async function setQuestionCorrectAnswer(
  questionId: string,
  correctAnswer: string,
  sourceRef?: {
    volume?: string
    page?: string
    lineFrom?: string
    lineTo?: string
  }
) {
  const supabase = createServiceClient()
  
  const updateData: any = {
    correct_answer: correctAnswer,
    updated_at: new Date().toISOString()
  }
  
  if (sourceRef) {
    if (sourceRef.volume) updateData.volume = sourceRef.volume
    if (sourceRef.page) updateData.page = sourceRef.page
    if (sourceRef.lineFrom) updateData.line_from = sourceRef.lineFrom
    if (sourceRef.lineTo) updateData.line_to = sourceRef.lineTo
  }
  
  const { error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', questionId)
  
  if (error) {
    throw new Error(`فشل تحديث الإجابة: ${error.message}`)
  }
  
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Choose a winner's answer as the correct answer
 */
export async function chooseWinnerAnswer(
  questionId: string,
  submissionId: string
) {
  const supabase = createServiceClient()
  
  // Get the submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()
  
  if (subError || !submission) {
    throw new Error('الإجابة غير موجودة')
  }
  
  // Find the answer for this question
  const answers = submission.answers || []
  const questionAnswer = answers.find((a: any) => a.question_id === questionId)
  
  if (!questionAnswer) {
    throw new Error('الإجابة للسؤال غير موجودة')
  }
  
  // Update the question with this answer
  const { error } = await supabase
    .from('questions')
    .update({
      correct_answer: questionAnswer.answer,
      updated_at: new Date().toISOString()
    })
    .eq('id', questionId)
  
  if (error) {
    throw new Error(`فشل تحديث الإجابة: ${error.message}`)
  }
  
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Migrate all questions from a competition to training questions
 */
export async function migrateCompetitionToTraining(
  competitionId: string,
  options: {
    useWinnerAnswersIfMissing?: boolean // Auto-use first winner answer if no official answer
    skipQuestionsWithoutAnswers?: boolean // Skip questions that have no answer set
  } = {}
) {
  const supabase = createServiceClient()
  
  // Get migration data
  const migrationData = await getCompetitionQuestionsForMigration(competitionId)
  
  // Check if any questions need review
  if (migrationData.questionsNeedingReview > 0 && !options.skipQuestionsWithoutAnswers) {
    throw new Error(
      `يوجد ${migrationData.questionsNeedingReview} أسئلة تحتاج مراجعة. ` +
      'يرجى تحديد الإجابات الصحيحة أولاً أو استخدام خيار تخطي الأسئلة بدون إجابات.'
    )
  }
  
  const migratedQuestions: string[] = []
  const skippedQuestions: string[] = []
  const errors: Array<{ questionId: string; error: string }> = []
  
  for (const question of migrationData.questions) {
    try {
      let correctAnswer = question.correctAnswer
      
      // If no official answer, try to use winner answer
      if (!correctAnswer && options.useWinnerAnswersIfMissing && question.winnerAnswers.length > 0) {
        correctAnswer = question.winnerAnswers[0].answer
      }
      
      // Skip if still no answer
      if (!correctAnswer) {
        if (options.skipQuestionsWithoutAnswers) {
          skippedQuestions.push(question.questionId)
          continue
        } else {
          throw new Error('لا توجد إجابة صحيحة محددة')
        }
      }
      
      // Update question to be a training question
      const { error } = await supabase
        .from('questions')
        .update({
          competition_id: null, // Remove from competition
          is_training: true, // Mark as training
          status: 'PUBLISHED', // Make it available
          correct_answer: correctAnswer,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.questionId)
      
      if (error) {
        throw error
      }
      
      migratedQuestions.push(question.questionId)
    } catch (error: any) {
      errors.push({
        questionId: question.questionId,
        error: error.message
      })
    }
  }
  
  // Log the migration
  await supabase.from('audit_logs').insert({
    action: 'migrate_to_training',
    entity_type: 'competition',
    entity_id: competitionId,
    details: {
      total_questions: migrationData.totalQuestions,
      migrated: migratedQuestions.length,
      skipped: skippedQuestions.length,
      errors: errors.length
    }
  })
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/training-questions')
  revalidatePath('/dashboard/question-bank')
  
  return {
    success: true,
    migrated: migratedQuestions.length,
    skipped: skippedQuestions.length,
    errors,
    details: {
      migratedQuestions,
      skippedQuestions,
      errors
    }
  }
}

/**
 * Auto-migrate: Use first winner answer for all questions without official answers
 */
export async function autoMigrateWithWinnerAnswers(competitionId: string) {
  const supabase = createServiceClient()
  
  // Get migration data
  const migrationData = await getCompetitionQuestionsForMigration(competitionId)
  
  // Auto-set winner answers for questions without official answers
  for (const question of migrationData.questions) {
    if (!question.hasOfficialAnswer && question.winnerAnswers.length > 0) {
      await setQuestionCorrectAnswer(
        question.questionId,
        question.winnerAnswers[0].answer
      )
    }
  }
  
  // Now migrate everything
  return await migrateCompetitionToTraining(competitionId, {
    skipQuestionsWithoutAnswers: true
  })
}

/**
 * Get training questions statistics
 */
export async function getTrainingQuestionsStats() {
  const supabase = createServiceClient()
  
  const { data, error, count } = await supabase
    .from('questions')
    .select('category, difficulty, type', { count: 'exact' })
    .eq('is_training', true)
    .is('competition_id', null)
    .eq('status', 'PUBLISHED')
  
  if (error) {
    throw new Error(`فشل جلب الإحصائيات: ${error.message}`)
  }
  
  // Group by category
  const byCategory: Record<string, number> = {}
  const byDifficulty: Record<string, number> = {}
  const byType: Record<string, number> = {}
  
  for (const q of data || []) {
    byCategory[q.category || 'غير محدد'] = (byCategory[q.category || 'غير محدد'] || 0) + 1
    byDifficulty[q.difficulty || 'غير محدد'] = (byDifficulty[q.difficulty || 'غير محدد'] || 0) + 1
    byType[q.type || 'غير محدد'] = (byType[q.type || 'غير محدد'] || 0) + 1
  }
  
  return {
    total: count || 0,
    byCategory,
    byDifficulty,
    byType
  }
}
