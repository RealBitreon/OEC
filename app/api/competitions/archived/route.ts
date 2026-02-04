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
    
    // Get archived competitions
    const { data: competitions, error: dbError } = await supabase
      .from('competitions')
      .select('*')
      .eq('status', 'archived')
      .order('end_at', { ascending: false });

    if (dbError) {
      console.error(`[${correlationId}] Database query error:`, dbError);
      
      return NextResponse.json(
        { 
          ok: false,
          code: 'DATABASE_ERROR',
          error: 'فشل جلب المسابقات المؤرشفة',
          hint: dbError.message,
          correlationId,
          meta: { duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true,
      data: { competitions: competitions || [] },
      correlationId,
      meta: { 
        duration: Date.now() - startTime,
        count: competitions?.length || 0
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
