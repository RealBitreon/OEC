'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as crypto from 'crypto'

type SignupResult = {
  error?: string
  success?: boolean
}

// Hash password using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const roleCode = formData.get('roleCode') as string

  // Validation
  if (!username || !password) {
    return { error: 'اسم المستخدم وكلمة المرور مطلوبان.' }
  }

  if (password.length < 8) {
    return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' }
  }

  if (username.length < 3 || username.length > 30) {
    return { error: 'اسم المستخدم يجب أن يكون بين 3 و 30 حرف.' }
  }

  // Validate username format (alphanumeric and underscore only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { error: 'اسم المستخدم يجب أن يحتوي على حروف وأرقام وشرطة سفلية فقط.' }
  }

  // Determine role based on role code
  let role = 'student'
  const ceoCode = process.env.CEO_ROLE_CODE
  const managerCode = process.env.MANAGER_ROLE_CODE
  const adminCode = process.env.ADMIN_ROLE_CODE

  if (roleCode) {
    if (roleCode === ceoCode) {
      role = 'ceo'
    } else if (roleCode === managerCode) {
      role = 'manager'
    } else if (roleCode === adminCode) {
      role = 'admin'
    } else {
      return { error: 'رمز الدور غير صحيح.' }
    }
  }

  const supabase = await createClient()

  // Check if username already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('student_participants')
    .select('id, username')
    .eq('username', username)
    .maybeSingle()

  if (checkError) {
    console.error('Username check error:', checkError)
    console.error('Error details:', JSON.stringify(checkError, null, 2))
    return { error: 'حدث خطأ أثناء التحقق من اسم المستخدم. تأكد من إعدادات قاعدة البيانات.' }
  }

  if (existingUser) {
    return { error: 'اسم المستخدم مستخدم بالفعل. اختر اسم آخر.' }
  }

  // Hash the password
  const passwordHash = hashPassword(password)

  // Create student participant with password
  const { data: newStudent, error: insertError } = await supabase
    .from('student_participants')
    .insert({
      username,
      password_hash: passwordHash,
      role,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    console.error('Student creation error:', insertError)
    console.error('Error code:', insertError.code)
    console.error('Error message:', insertError.message)
    console.error('Error details:', JSON.stringify(insertError, null, 2))
    
    // Provide more specific error messages
    if (insertError.code === '23505') {
      return { error: 'اسم المستخدم مستخدم بالفعل. اختر اسم آخر.' }
    }
    if (insertError.code === '42501') {
      return { error: 'خطأ في الصلاحيات. يرجى تحديث إعدادات قاعدة البيانات (RLS policies).' }
    }
    
    return { error: `حدث خطأ أثناء إنشاء الحساب: ${insertError.message}` }
  }

  if (!newStudent) {
    console.error('No student data returned after insert')
    return { error: 'حدث خطأ أثناء إنشاء الحساب. لم يتم إرجاع بيانات المستخدم.' }
  }

  // Store student ID and role in cookie for session management
  const cookieStore = await cookies()
  cookieStore.set('student_id', newStudent.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
  
  cookieStore.set('student_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  console.log('✅ Account created successfully for:', username)
  
  // Success - redirect to dashboard
  // Note: redirect() throws a NEXT_REDIRECT error which is expected behavior
  redirect('/dashboard')
}
