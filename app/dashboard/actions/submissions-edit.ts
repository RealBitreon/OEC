'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSubmissionAnswers(
  submissionId: string,
  answers: Record<string, string>,
  proofs: Record<string, string>
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      throw new Error('غير مصرح')
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', authUser.id)
      .single()
    
    if (!profile || !['LRC_MANAGER', 'CEO'].includes(profile.role)) {
      throw new Error('غير مصرح - يتطلب صلاحيات مدير')
    }
    
    // Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*, competition:competitions(id)')
      .eq('id', submissionId)
      .single()
    
    if (fetchError || !submission) {
      throw new Error('الإجابة غير موجودة')
    }

    // Get questions for this competition
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('competition_id', submission.competition_id)
      .eq('is_active', true)

    // Recalculate score based on new answers
    let score = 0
    for (const question of questions || []) {
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer === question.correct_answer) {
        score++
      }
    }
    
    // Update submission
    const { error } = await supabase
      .from('submissions')
      .update({
        answers,
        proofs,
        score,
        total_questions: questions?.length || 0
      })
      .eq('id', submissionId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: profile.id,
      action: 'submission_edited',
      details: { 
        submission_id: submissionId,
        old_score: submission.score,
        new_score: score
      }
    })
    
    revalidatePath('/dashboard')
    return { success: true, newScore: score }
  } catch (error: any) {
    console.error('Error in updateSubmissionAnswers:', error)
    throw error
  }
}
