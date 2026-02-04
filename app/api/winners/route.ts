import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get winners from submissions with is_winner = true
    const { data: winners, error } = await supabase
      .from('submissions')
      .select(`
        *,
        competition:competitions(id, title, slug, status),
        user:users(id, username)
      `)
      .eq('is_winner', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Winners fetch error:', error);
      // Return empty array gracefully for any error to prevent 500s
      return NextResponse.json({ 
        winners: [],
        message: error.message || 'No winners data available'
      });
    }

    return NextResponse.json({ winners: winners || [] });
  } catch (error) {
    console.error('Winners error:', error);
    // Return empty array instead of 500 error
    return NextResponse.json({ 
      winners: [],
      message: 'Failed to fetch winners'
    });
  }
}
