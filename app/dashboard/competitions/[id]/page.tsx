import { redirect, notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import CompetitionHub from './CompetitionHub'

export default async function CompetitionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params in Next.js 15+
  const { id } = await params
  console.log('=== Competition Page ===')
  console.log('Competition ID:', id)
  
  const supabase = await createClient()
  
  // Check user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('User:', user?.id, user?.email)
  console.log('User error:', userError)

  if (!user || userError) {
    console.error('❌ No user, redirecting to login')
    redirect('/login')
  }

  // Get profile from users table (consistent with session API)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  console.log('Profile:', profile)
  console.log('Profile error:', profileError)

  if (!profile) {
    console.error('❌ No profile found, redirecting to dashboard')
    redirect('/dashboard')
  }

  // Check role
  console.log('Profile role:', profile.role)
  const allowedRoles = ['CEO', 'LRC_MANAGER']
  if (!allowedRoles.includes(profile.role)) {
    console.error('❌ Insufficient role:', profile.role)
    redirect('/dashboard')
  }

  // Get competition using service client (after authorization)
  const serviceClient = createServiceClient()
  const { data: competition, error: compError } = await serviceClient
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  console.log('Competition:', competition)
  console.log('Competition error:', compError)

  if (!competition || compError) {
    console.error('❌ Competition not found:', id, compError)
    notFound()
  }

  console.log('✅ All checks passed, rendering CompetitionHub')
  
  // Map profile to User type
  const userProfile = {
    id: profile.id,
    username: profile.username,
    role: profile.role as 'CEO' | 'LRC_MANAGER',
    createdAt: profile.created_at
  }
  
  return <CompetitionHub competition={competition} profile={userProfile} />
}
