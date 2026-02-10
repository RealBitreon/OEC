import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/competitions/[id]/winners
 * 
 * Fetches all winners for a specific competition.
 * Used in the Answer Details modal TAB B to show existing winners.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = randomUUID();
  const startTime = Date.now();
  
  try {
    const supabase = createServiceClient();
    
    // Get winners for this competition
    const { data: winners, error: dbError } = await supabase
      .from('submissions')
      .select(`
        id,
        participant_name,
        participant_email,
        first_name,
        father_name,
        family_name,
        grade,
        score,
        total_questions,
        tickets_earned,
        submitted_at,
        reviewed_at,
        reviewed_by
      `)
      .eq('competition_id', params.id)
      .eq('is_winner', true)
      .order('reviewed_at', { ascending: false });

    if (dbError) {
      console.error(`[${correlationId}] Database query error:`, dbError);
      
      return NextResponse.json(
        { 
          ok: false,
          code: 'DATABASE_ERROR',
          error: 'فشل جلب الفائزين',
          hint: dbError.message,
          correlationId,
          meta: { duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true,
      data: winners || [],
      correlationId,
      meta: { 
        duration: Date.now() - startTime,
        count: winners?.length || 0
      }
    });

  } catch (error: any) {
    console.error(`[${correlationId}] Unexpected error:`, error);
    
    return NextResponse.json(
      { 
        ok: false,
        code: 'INTERNAL_ERROR',
        error: 'حدث خطأ غير متوقع',
        correlationId,
        meta: { duration: Date.now() - startTime }
      },
      { status: 500 }
    );
  }
}
