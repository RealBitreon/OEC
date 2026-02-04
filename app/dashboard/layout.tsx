import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import DashboardShell from './components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Preserve the current path for redirect after login
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('referer')
    const currentPath = pathname ? new URL(pathname, 'http://localhost').pathname : '/dashboard'
    
    // Only redirect to login with current path if it's a dashboard route
    if (currentPath.startsWith('/dashboard')) {
      redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
    
    redirect('/login')
  }

  // Get user profile using service client to bypass RLS
  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('id, username, email, role, created_at')
    .eq('auth_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile not found for user:', user.id, profileError)
    redirect('/login')
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
