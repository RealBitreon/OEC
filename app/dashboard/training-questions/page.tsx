import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import QuestionsManagement from '../components/sections/QuestionsManagement'

export default async function TrainingQuestionsPage() {
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

  return <QuestionsManagement profile={profile} mode="training" />
}
