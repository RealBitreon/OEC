import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Validate environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[/api/winners] Missing Supabase environment variables');
      return NextResponse.json(
        { 
          ok: false,
          error: 'CONFIGURATION_ERROR',
          message: 'Database configuration missing',
          hint: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
          data: { winners: [] },
          meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError: any) {
      console.error('[/api/winners] Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { 
          ok: false,
          error: 'DATABASE_CONNECTION_ERROR',
          message: 'Failed to connect to database',
          hint: 'Supabase client initialization failed',
          data: { winners: [] },
          meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }
    
    // Get winners from submissions with is_winner = true
    const { data: winners, error: dbError } = await supabase
      .from('submissions')
      .select(`
        *,
        competition:competitions(id, title, slug, status),
        user:users(id, username)
      `)
      .eq('is_winner', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (dbError) {
      console.error('[/api/winners] Database query error:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      
      // Check for specific error codes
      if (dbError.code === '42P01') {
        // Table doesn't exist
        return NextResponse.json(
          { 
            ok: false,
            error: 'TABLE_NOT_FOUND',
            message: 'Submissions table not found',
            hint: 'Run database migrations',
            data: { winners: [] },
            meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
          },
          { status: 500 }
        );
      }
      
      if (dbError.code === '42703') {
        // Column doesn't exist
        return NextResponse.json(
          { 
            ok: false,
            error: 'COLUMN_NOT_FOUND',
            message: 'is_winner column not found',
            hint: 'Run add_is_winner_column.sql migration',
            data: { winners: [] },
            meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
          },
          { status: 500 }
        );
      }

      // Generic database error
      return NextResponse.json(
        { 
          ok: false,
          error: 'DATABASE_QUERY_ERROR',
          message: dbError.message || 'Failed to fetch winners',
          hint: dbError.hint || 'Check database schema and permissions',
          data: { winners: [] },
          meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({ 
      ok: true,
      data: { winners: winners || [] },
      meta: { 
        timestamp: new Date().toISOString(), 
        duration: Date.now() - startTime,
        count: winners?.length || 0
      }
    });

  } catch (error: any) {
    console.error('[/api/winners] Unexpected error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { 
        ok: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        hint: 'Check server logs for details',
        data: { winners: [] },
        meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
      },
      { status: 500 }
    );
  }
}
