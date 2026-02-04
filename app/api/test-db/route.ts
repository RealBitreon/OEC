import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // Test 1: Environment variables
    results.tests.envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    };

    // Test 2: Create client
    let supabase;
    try {
      supabase = await createClient();
      results.tests.clientCreation = { success: true };
    } catch (error: any) {
      results.tests.clientCreation = { 
        success: false, 
        error: error.message 
      };
      return NextResponse.json(results, { status: 500 });
    }

    // Test 3: Check submissions table structure
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .limit(1);
      
      results.tests.submissionsTable = {
        success: !error,
        error: error?.message,
        columns: data && data.length > 0 ? Object.keys(data[0]) : [],
        hasIsWinner: data && data.length > 0 ? 'is_winner' in data[0] : 'no data to check'
      };
    } catch (error: any) {
      results.tests.submissionsTable = {
        success: false,
        error: error.message
      };
    }

    // Test 4: Check competitions table structure
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .limit(1);
      
      results.tests.competitionsTable = {
        success: !error,
        error: error?.message,
        columns: data && data.length > 0 ? Object.keys(data[0]) : [],
        hasStatus: data && data.length > 0 ? 'status' in data[0] : 'no data to check'
      };
    } catch (error: any) {
      results.tests.competitionsTable = {
        success: false,
        error: error.message
      };
    }

    // Test 5: Try the actual winners query
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, title, slug, status),
          user:users(id, username)
        `)
        .eq('is_winner', true)
        .limit(1);
      
      results.tests.winnersQuery = {
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        dataCount: data?.length || 0
      };
    } catch (error: any) {
      results.tests.winnersQuery = {
        success: false,
        error: error.message
      };
    }

    // Test 6: Try the actual archived competitions query
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          submissions:submissions(count)
        `)
        .eq('status', 'archived')
        .limit(1);
      
      results.tests.archivedQuery = {
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
        dataCount: data?.length || 0
      };
    } catch (error: any) {
      results.tests.archivedQuery = {
        success: false,
        error: error.message
      };
    }

    return NextResponse.json(results);

  } catch (error: any) {
    results.tests.unexpectedError = {
      message: error.message,
      stack: error.stack
    };
    return NextResponse.json(results, { status: 500 });
  }
}
