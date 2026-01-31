import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CompetitionsManagement from '../components/sections/CompetitionsManagement'

export default async function CompetitionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile from users table (consistent with session API)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return <CompetitionsManagement profile={profile} />
}
