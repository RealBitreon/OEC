import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuestionsManagement from '../components/sections/QuestionsManagement'

export default async function TrainingQuestionsPage() {
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

  if (!profile || (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER')) {
    redirect('/dashboard')
  }

  return <QuestionsManagement profile={profile} mode="training" />
}
