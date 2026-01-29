'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface UserFilters {
  role?: string
  search?: string
}

export async function getUsers(filters: UserFilters = {}, page = 1, limit = 20) {
  const supabase = await createClient()
  
  let query = supabase
    .from('student_participants')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
  
  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  
  if (filters.search) {
    query = query.or(`username.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await query.range(from, to)
  
  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], total: 0, pages: 0 }
  }
  
  return {
    users: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit)
  }
}

export async function getUserStats() {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('student_participants')
    .select('role, created_at')
  
  if (!users) {
    return {
      total: 0,
      students: 0,
      managers: 0,
      ceos: 0,
      thisMonth: 0
    }
  }
  
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    managers: users.filter(u => u.role === 'LRC_MANAGER').length,
    ceos: users.filter(u => u.role === 'CEO').length,
    thisMonth: users.filter(u => new Date(u.created_at) >= monthStart).length
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  display_name: string
  role: 'STUDENT' | 'LRC_MANAGER' | 'CEO'
  phone?: string
}) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify user role
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات المدير التنفيذي')
  }
  
  // Check if username or email already exists
  const { data: existing } = await supabase
    .from('student_participants')
    .select('id')
    .or(`username.eq.${userData.username},email.eq.${userData.email}`)
    .single()
  
  if (existing) {
    throw new Error('اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل')
  }
  
  // Create user
  const { data: newUser, error } = await supabase
    .from('student_participants')
    .insert({
      username: userData.username,
      email: userData.email,
      password_hash: userData.password, // In production, hash this properly
      display_name: userData.display_name,
      role: userData.role,
      phone: userData.phone || null
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'user_created',
    details: { 
      new_user_id: newUser.id,
      username: userData.username,
      role: userData.role
    }
  })
  
  revalidatePath('/dashboard')
  return newUser
}

export async function updateUser(
  targetUserId: string,
  updates: {
    display_name?: string
    email?: string
    phone?: string
    role?: 'STUDENT' | 'LRC_MANAGER' | 'CEO'
  }
) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify user role
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات المدير التنفيذي')
  }
  
  // Update user
  const { error } = await supabase
    .from('student_participants')
    .update(updates)
    .eq('id', targetUserId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'user_updated',
    details: { 
      target_user_id: targetUserId,
      updates
    }
  })
  
  revalidatePath('/dashboard')
}

export async function deleteUser(targetUserId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify user role
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات المدير التنفيذي')
  }
  
  // Prevent self-deletion
  if (userId === targetUserId) {
    throw new Error('لا يمكنك حذف حسابك الخاص')
  }
  
  // Get user info before deletion
  const { data: targetUser } = await supabase
    .from('student_participants')
    .select('username, role')
    .eq('id', targetUserId)
    .single()
  
  // Delete user
  const { error } = await supabase
    .from('student_participants')
    .delete()
    .eq('id', targetUserId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'user_deleted',
    details: { 
      deleted_user_id: targetUserId,
      username: targetUser?.username,
      role: targetUser?.role
    }
  })
  
  revalidatePath('/dashboard')
}

export async function resetUserPassword(targetUserId: string, newPassword: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify user role
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات المدير التنفيذي')
  }
  
  // Update password (in production, hash this properly)
  const { error } = await supabase
    .from('student_participants')
    .update({ password_hash: newPassword })
    .eq('id', targetUserId)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'password_reset',
    details: { 
      target_user_id: targetUserId
    }
  })
  
  revalidatePath('/dashboard')
}
