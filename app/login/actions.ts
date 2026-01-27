'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as crypto from 'crypto'

// Hash password using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'اسم المستخدم وكلمة المرور مطلوبان.' }
  }

  if (username.length < 3) {
    return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل.' }
  }

  const supabase = await createClient()

  // Hash the password
  const passwordHash = hashPassword(password)

  // Check if student exists with matching username and password
  const { data: student, error } = await supabase
    .from('student_participants')
    .select('id, username, role, password_hash')
    .eq('username', username)
    .eq('password_hash', passwordHash)
    .single()

  if (error || !student) {
    return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }
  }

  // Store student ID and role in cookie for session management
  const cookieStore = await cookies()
  cookieStore.set('student_id', student.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
  
  cookieStore.set('student_role', student.role || 'student', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  // Redirect to dashboard
  redirect('/dashboard')
}
