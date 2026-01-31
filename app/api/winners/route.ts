import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get winners from wheel_winners table
    const { data: winners, error } = await supabase
      .from('wheel_winners')
      .select(`
        *,
        competition:competitions(id, title, slug, status),
        user:users(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Winners fetch error:', error);
      // If wheel_winners table doesn't exist yet, return empty array gracefully
      if (error.code === '42P01') {
        return NextResponse.json({ 
          winners: [],
          message: 'Winners feature not yet configured'
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
