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

    // Get user profile
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const competitionId = searchParams.get('competition_id')

    // Build query
    let query = serviceClient
      .from('submissions')
      .select('is_winner, score, total_questions', { count: 'exact' })

    if (competitionId) {
      query = query.eq('competition_id', competitionId)
    }

    const { data, count } = await query

    const winners = data?.filter(s => s.is_winner === true).length || 0
    const losers = data?.filter(s => s.is_winner === false).length || 0
    const notReviewed = data?.filter(s => s.is_winner === null).length || 0

    // Calculate average score
    const totalScore = data?.reduce((sum, s) => sum + (s.score || 0), 0) || 0
    const totalPossible = data?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0
    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0

    return NextResponse.json({
      total: count || 0,
      winners,
      losers,
      notReviewed,
      averageScore
    })
  } catch (error: any) {
    console.error('Submissions stats API error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
