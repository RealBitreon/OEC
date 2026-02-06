/**
 * Submissions API - List Endpoint
 * GET /api/submissions
 * 
 * This endpoint powers the admin dashboard's submission review interface.
 * It supports filtering, searching, and pagination to handle large datasets.
 * 
 * Query parameters:
 * - competition_id: Filter by specific competition
 * - status: Filter by winner/loser/not_reviewed
 * - search: Search by participant name or email
 * - page: Page number (1-indexed)
 * - limit: Items per page (default 20)
 * 
 * Performance considerations:
 * - We use .select() with count to get total in one query
 * - Pagination via .range() to avoid loading everything
 * - Indexes on competition_id, status, and submitted_at for fast queries
 * 
 * Security:
 * - Requires admin role (CEO or LRC_MANAGER)
 * - Uses service client after auth check (bypasses RLS)
 * - No sensitive data exposed (passwords, tokens, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    // Get user profile and check role
    // We need admin privileges to view all submissions
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || !['CEO', 'LRC_MANAGER'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'غير مصرح - يتطلب صلاحيات مدير' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const competitionId = searchParams.get('competition_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query with filters
    // We join with competitions to get the title for display
    let query = serviceClient
      .from('submissions')
      .select(`
        *,
        competition:competitions(id, title)
      `, { count: 'exact' }) // count: 'exact' gives us total for pagination
      .order('submitted_at', { ascending: false }) // Newest first

    // Apply filters if provided
    if (competitionId) {
      query = query.eq('competition_id', competitionId)
    }

    if (status) {
      // Map friendly status names to database values
      if (status === 'winner') {
        query = query.eq('is_winner', true)
      } else if (status === 'loser') {
        query = query.eq('is_winner', false)
      } else if (status === 'not_reviewed') {
        query = query.is('is_winner', null)
      }
    }

    if (search) {
      // Search across name and email using Postgres full-text search
      // The .or() creates a (name LIKE %search% OR email LIKE %search%) query
      query = query.or(`participant_name.ilike.%${search}%,participant_email.ilike.%${search}%`)
    }

    // Apply pagination
    // Postgres uses 0-indexed ranges, so we convert from 1-indexed pages
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { error: 'فشل في جلب البيانات' },
        { status: 500 }
      )
    }

    // Return paginated results with metadata
    return NextResponse.json({
      submissions: data || [],
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    })
  } catch (error: any) {
    console.error('Submissions API error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
