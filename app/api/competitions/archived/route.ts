import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Validate environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[/api/competitions/archived] Missing Supabase environment variables');
      return NextResponse.json(
        { 
          ok: false,
          error: 'CONFIGURATION_ERROR',
          message: 'Database configuration missing',
          hint: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
          data: { competitions: [] },
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
      console.error('[/api/competitions/archived] Failed to create Supabase client:', clientError);
      return NextResponse.json(
        { 
          ok: false,
          error: 'DATABASE_CONNECTION_ERROR',
          message: 'Failed to connect to database',
          hint: 'Supabase client initialization failed',
          data: { competitions: [] },
          meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    // Check authentication (optional - remove if endpoint should be public)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // If you want this endpoint to be protected, uncomment:
    // if (authError || !user) {
    //   return NextResponse.json(
    //     { 
    //       ok: false,
    //       error: 'UNAUTHORIZED',
    //       message: 'Authentication required',
    //       meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
    //     },
    //     { status: 401 }
    //   );
    // }
    
    // Get archived competitions
    const { data: competitions, error: dbError } = await supabase
      .from('competitions')
      .select(`
        *,
        submissions:submissions(count)
      `)
      .eq('status', 'archived')
      .order('end_at', { ascending: false });

    if (dbError) {
      console.error('[/api/competitions/archived] Database query error:', {
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
            message: 'Competitions table not found',
            hint: 'Run database migrations',
            data: { competitions: [] },
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
            message: 'Required column not found',
            hint: 'Check database schema for end_at column',
            data: { competitions: [] },
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
          message: dbError.message || 'Failed to fetch archived competitions',
          hint: dbError.hint || 'Check database schema and permissions',
          data: { competitions: [] },
          meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
        },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({ 
      ok: true,
      data: { competitions: competitions || [] },
      meta: { 
        timestamp: new Date().toISOString(), 
        duration: Date.now() - startTime,
        count: competitions?.length || 0
      }
    });

  } catch (error: any) {
    console.error('[/api/competitions/archived] Unexpected error:', {
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
        data: { competitions: [] },
        meta: { timestamp: new Date().toISOString(), duration: Date.now() - startTime }
      },
      { status: 500 }
    );
  }
}
