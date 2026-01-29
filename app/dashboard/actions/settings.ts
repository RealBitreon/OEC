'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export interface SystemSettings {
  site_name: string
  site_description: string
  contact_email: string
  maintenance_mode: boolean
  allow_registration: boolean
  require_email_verification: boolean
  max_submissions_per_user: number
  competition_auto_archive: boolean
}

export interface NotificationSettings {
  email_notifications: boolean
  submission_notifications: boolean
  competition_notifications: boolean
  wheel_notifications: boolean
  weekly_digest: boolean
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const supabase = await createClient()
  
  // For now, return default settings
  // In production, fetch from database
  return {
    site_name: 'منصة المسابقات',
    site_description: 'منصة تفاعلية للمسابقات والأسئلة',
    contact_email: 'support@example.com',
    maintenance_mode: false,
    allow_registration: true,
    require_email_verification: false,
    max_submissions_per_user: 100,
    competition_auto_archive: true
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userId = cookieStore.get('student_id')?.value
  
  if (!userId) {
    throw new Error('غير مصرح')
  }

  // Verify admin role (LRC_MANAGER only, not CEO)
  const { data: user } = await supabase
    .from('student_participants')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'LRC_MANAGER') {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير LRC')
  }

  // Store system settings (in production, use a dedicated settings table)
  // For now, log the change
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'system_settings_updated',
    details: settings
  })

  revalidatePath('/dashboard')
}

export async function updateUserProfile(userId: string, data: {
  display_name?: string
  email?: string
  phone?: string
  bio?: string
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  fontSize?: string
}) {
  const supabase = await createClient()
  
  const updateData: any = {}
  if (data.display_name) updateData.display_name = data.display_name
  if (data.email) updateData.email = data.email
  if (data.phone) updateData.phone = data.phone
  if (data.bio) updateData.bio = data.bio
  if (data.theme) updateData.theme = data.theme
  if (data.language) updateData.language = data.language
  if (data.fontSize) updateData.font_size = data.fontSize

  const { error } = await supabase
    .from('student_participants')
    .update(updateData)
    .eq('id', userId)
  
  if (error) {
    throw new Error(error.message)
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'profile_updated',
    details: updateData
  })

  revalidatePath('/dashboard')
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  
  // Verify current password by attempting to get user
  const { data: user } = await supabase
    .from('student_participants')
    .select('password')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('المستخدم غير موجود')
  }

  // In production, verify current password hash
  // For now, just update the password
  const { error } = await supabase
    .from('student_participants')
    .update({ password: newPassword })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'password_changed',
    details: { timestamp: new Date().toISOString() }
  })

  revalidatePath('/dashboard')
}

export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  // For now, return default settings
  return {
    email_notifications: true,
    submission_notifications: true,
    competition_notifications: true,
    wheel_notifications: true,
    weekly_digest: false
  }
}

export async function updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>) {
  const supabase = await createClient()
  
  // Store notification settings in user preferences or separate table
  const { error } = await supabase
    .from('student_participants')
    .update({
      notification_settings: settings
    })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'notification_settings_updated',
    details: settings
  })
  
  revalidatePath('/dashboard')
}
