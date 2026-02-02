'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('student_id')
  cookieStore.delete('student_role')
  redirect('/login')
}
