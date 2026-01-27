'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logoutAction() {
  const cookieStore = await cookies()
  
  // Clear authentication cookies
  cookieStore.delete('student_id')
  cookieStore.delete('student_role')
  
  redirect('/login')
}
