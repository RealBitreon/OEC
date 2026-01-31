import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get winners from archived competitions
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
      return NextResponse.json({ winners: [] }, { status: 200 });
    }

    return NextResponse.json({ winners: winners || [] });
  } catch (error) {
    console.error('Winners error:', error);
    return NextResponse.json({ winners: [] }, { status: 200 });
  }
}
