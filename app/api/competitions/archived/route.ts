import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get archived competitions
    const { data: competitions, error } = await supabase
      .from('competitions')
      .select(`
        *,
        submissions:submissions(count)
      `)
      .eq('status', 'archived')
      .order('end_at', { ascending: false }); // Fixed: end_date → end_at

    if (error) {
      console.error('Archived competitions fetch error:', error);
      // Return empty array gracefully instead of 500 error
      return NextResponse.json({ 
        competitions: [],
        message: error.message || 'No archived competitions available'
      });
    }

    return NextResponse.json({ competitions: competitions || [] });
  } catch (error) {
    console.error('Archived competitions error:', error);
    // Return empty array instead of 500 error
    return NextResponse.json({ 
      competitions: [],
      message: 'Failed to fetch archived competitions'
    });
  }
}
