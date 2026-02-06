/**
 * Review Draft API (Autosave)
 * POST /api/submissions/[id]/review-draft
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, successResponse, errorResponse } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = randomUUID()
  
  try {
    const { user } = await requireAdmin()
    const { corrections } = await request.json()
    
    if (!corrections || typeof corrections !== 'object') {
      return errorResponse('INVALID_INPUT', 'البيانات غير صحيحة', 400, correlationId)
    }
    
    const supabase = createServiceClient()
    
    // Upsert draft (insert or update)
    const { error } = await supabase
      .from('submission_review_drafts')
      .upsert({
        submission_id: params.id,
        reviewer_id: user.id,
        draft_corrections: corrections,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }, {
        onConflict: 'submission_id,reviewer_id'
      })
    
    if (error) {
      console.error(`[${correlationId}] Draft save error:`, error)
      return errorResponse('SAVE_FAILED', error.message, 500, correlationId)
    }
    
    return successResponse({
      saved: true,
      timestamp: new Date().toISOString()
    }, correlationId)
    
  } catch (error: any) {
    console.error(`[${correlationId}] Draft save exception:`, error)
    return errorResponse('SERVER_ERROR', error.message, 500, correlationId)
  }
}

/**
 * GET /api/submissions/[id]/review-draft
 * Retrieve saved draft
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = randomUUID()
  
  try {
    const { user } = await requireAdmin()
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('submission_review_drafts')
      .select('*')
      .eq('submission_id', params.id)
      .eq('reviewer_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      return errorResponse('FETCH_FAILED', error.message, 500, correlationId)
    }
    
    return successResponse({
      draft: data || null
    }, correlationId)
    
  } catch (error: any) {
    console.error(`[${correlationId}] Draft fetch exception:`, error)
    return errorResponse('SERVER_ERROR', error.message, 500, correlationId)
  }
}
