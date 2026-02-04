import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const correlationId = randomUUID();
  const startTime = Date.now();
  
  try {
    const supabase = createServiceClient();
    
    // Get winners from submissions with is_winner = true
    const { data: winners, error: dbError } = await supabase
      .from('submissions')
      .select(`
        *,
        competition:competitions(id, title, slug, status)
      `)
      .eq('is_winner', true)
      .order('submitted_at', { ascending: false })
      .limit(10);

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
      data: { winners: winners || [] },
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
