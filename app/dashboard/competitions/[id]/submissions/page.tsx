import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import CompetitionSubmissions from './CompetitionSubmissions'

export default async function CompetitionSubmissionsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile using service client to bypass RLS
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!profile || (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER')) {
    redirect('/dashboard')
  }

  // Get competition
  const { data: competition } = await serviceClient
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  if (!competition) {
    redirect('/dashboard/competitions')
  }

  // Map profile to User type
  const userProfile = {
    id: profile.id,
    username: profile.username,
    role: profile.role as 'CEO' | 'LRC_MANAGER',
    createdAt: profile.created_at
  }

  return <CompetitionSubmissions competition={competition} profile={userProfile} />
}
