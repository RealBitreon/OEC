import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from './components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, username, email, role, created_at')
    .eq('auth_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile not found for user:', user.id, profileError)
    redirect('/login')
  }

  // Check if user is CEO or LRC_MANAGER
  const allowedRoles = ['CEO', 'LRC_MANAGER']
  if (!allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }

  const userProfile = {
    id: profile.id,
    username: profile.username,
    email: profile.email || undefined,
    role: profile.role as 'CEO' | 'LRC_MANAGER',
    createdAt: profile.created_at
  }

  return <DashboardShell initialUser={userProfile}>{children}</DashboardShell>
}
