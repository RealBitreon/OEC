/**
 * Dashboard Layout Component
 * 
 * This layout wraps all dashboard pages and handles:
 * - Authentication (redirect to login if not authenticated)
 * - Authorization (check user role)
 * - User profile loading
 * - Dashboard shell (sidebar, header, etc.)
 * 
 * Security flow:
 * 1. Check if user has a valid session
 * 2. If not, redirect to login with return URL
 * 3. Fetch user profile from database
 * 4. Verify they have admin role (CEO or LRC_MANAGER)
 * 5. Pass profile to DashboardShell for display
 * 
 * Why use service client for profile fetch?
 * The user is authenticated (we checked their session), but RLS policies
 * might block the profile query before we know who they are. Service client
 * bypasses RLS safely because we've already validated the auth token.
 * 
 * Redirect preservation:
 * We preserve the current path so after login, users return to where they
 * were trying to go. This is better UX than always landing on /dashboard.
 */

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
    // User is not authenticated - redirect to login
    // Try to preserve the current path for redirect after login
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('referer')
    const currentPath = pathname ? new URL(pathname, 'http://localhost').pathname : '/dashboard'
    
    // Only redirect to login with current path if it's a dashboard route
    // This prevents weird redirects from non-dashboard pages
    if (currentPath.startsWith('/dashboard')) {
      redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
    
    redirect('/login')
  }

  // Get user profile using service client to bypass RLS
  // This is safe because we've already validated the auth token above
  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('id, username, email, role, created_at')
    .eq('auth_id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile not found - this shouldn't happen in normal operation
    // Could be a race condition during signup or data integrity issue
    console.error('Profile not found for user:', user.id, profileError)
    redirect('/login')
  }

  // Build user profile object for DashboardShell
  const userProfile = {
    id: profile.id,
    username: profile.username,
    email: profile.email || undefined,
    role: profile.role as 'CEO' | 'LRC_MANAGER',
    createdAt: profile.created_at
  }

  return <DashboardShell initialUser={userProfile}>{children}</DashboardShell>
}
