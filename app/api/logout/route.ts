import { logout } from '@/lib/auth/supabase-auth-v2'
import { NextResponse } from 'next/server'

export async function POST() {
  await logout()
  return NextResponse.json({ success: true })
}
