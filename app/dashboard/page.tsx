import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardRedirectPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  // Get role from Clerk public metadata
  const role = user.publicMetadata?.role as string | undefined
  
  console.log('[DASHBOARD-REDIRECT] User:', userId, 'Role:', role)
  
  // Redirect based on role
  if (role === 'CEO' || role === 'DEV') {
    redirect('/ceo')
  } else if (role === 'LRC_MANAGER') {
    redirect('/manager')
  } else {
    // Default to home for students or users without role
    redirect('/')
  }
}
