import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from './components/DashboardShell'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // SINGLE AUTH CHECK - Supabase only
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // User exists - render dashboard
  // DO NOT redirect based on profile/role
  return <DashboardShell />
}
