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
      // If is_winner column doesn't exist yet, return empty array gracefully
      if (error.code === '42703') {
        return NextResponse.json({ 
          winners: [],
          message: 'Winners feature not yet configured. Run add_is_winner_column.sql migration.'
        });
      }
      return NextResponse.json(
        { error: error.message, winners: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ winners: winners || [] });
  } catch (error) {
    console.error('Winners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners', winners: [] },
      { status: 500 }
    );
  }
}
