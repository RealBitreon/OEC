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
  
  try {
    // Fetch from system_settings table
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
    
    if (error) throw error
    
    // Convert array of key-value pairs to object
    const settings: any = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })
    
    return {
      site_name: settings.site_name || 'منصة المسابقات',
      site_description: settings.site_description || 'منصة تفاعلية للمسابقات والأسئلة',
      contact_email: settings.contact_email || 'support@example.com',
      maintenance_mode: settings.maintenance_mode || false,
      allow_registration: settings.allow_registration !== false,
      require_email_verification: settings.require_email_verification || false,
      max_submissions_per_user: settings.max_submissions_per_user || 100,
      competition_auto_archive: settings.competition_auto_archive !== false
    }
  } catch (error) {
    console.error('Failed to load system settings:', error)
    // Return defaults on error
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
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user || user.role !== 'LRC_MANAGER') {
    throw new Error('غير مصرح - يتطلب صلاحيات مدير LRC')
  }

  // Update each setting in system_settings table
  const updates = Object.entries(settings).map(([key, value]) => 
    supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        updated_by: userId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
  )

  await Promise.all(updates)

  // Log audit
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
  compact_mode?: boolean
}) {
  const supabase = await createClient()
  
  const updateData: any = {}
  if (data.display_name !== undefined) updateData.display_name = data.display_name
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.theme !== undefined) updateData.theme = data.theme
  if (data.language !== undefined) updateData.language = data.language
  if (data.fontSize !== undefined) updateData.font_size = data.fontSize
  if (data.compact_mode !== undefined) updateData.compact_mode = data.compact_mode

  const { error } = await supabase
    .from('users')
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
  
  // Validate new password strength
  if (newPassword.length < 8) {
    throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }

  // Check password complexity
  const hasLower = /[a-z]/.test(newPassword)
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword)
  
  const complexityScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  
  if (complexityScore < 2) {
    throw new Error('كلمة المرور ضعيفة جداً. استخدم مزيجاً من الأحرف الكبيرة والصغيرة والأرقام والرموز')
  }

  // Get user's auth_id
  const { data: user } = await supabase
    .from('users')
    .select('auth_id')
    .eq('id', userId)
    .single()

  if (!user || !user.auth_id) {
    throw new Error('المستخدم غير موجود')
  }

  // Use Supabase Auth to update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    throw new Error(error.message)
  }

  // Update last_password_change in users table
  await supabase
    .from('users')
    .update({ last_password_change: new Date().toISOString() })
    .eq('id', userId)
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'password_changed',
    details: { 
      timestamp: new Date().toISOString(),
      complexity_score: complexityScore
    }
  })

  revalidatePath('/dashboard')
}

export async function getUserPreferences(userId: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('theme, language, font_size, compact_mode, notification_settings')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    return {
      theme: data?.theme || 'light',
      language: data?.language || 'ar',
      fontSize: data?.font_size || 'medium',
      compactMode: data?.compact_mode || false,
      notificationSettings: data?.notification_settings || {
        email_notifications: true,
        submission_notifications: true,
        competition_notifications: true,
        wheel_notifications: true,
        weekly_digest: false
      }
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error)
    return {
      theme: 'light',
      language: 'ar',
      fontSize: 'medium',
      compactMode: false,
      notificationSettings: {
        email_notifications: true,
        submission_notifications: true,
        competition_notifications: true,
        wheel_notifications: true,
        weekly_digest: false
      }
    }
  }
}

export async function getUserSessions(userId: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Failed to load user sessions:', error)
    return []
  }
}

export async function terminateSession(sessionId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)
  
  if (error) {
    throw new Error('فشل إنهاء الجلسة')
  }
  
  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'session_terminated',
    details: { session_id: sessionId }
  })
  
  revalidatePath('/dashboard')
}

export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('notification_settings')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    // Return stored settings or defaults
    return data?.notification_settings || {
      email_notifications: true,
      submission_notifications: true,
      competition_notifications: true,
      wheel_notifications: true,
      weekly_digest: false
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error)
    // Return defaults on error
    return {
      email_notifications: true,
      submission_notifications: true,
      competition_notifications: true,
      wheel_notifications: true,
      weekly_digest: false
    }
  }
}

export async function updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>) {
  const supabase = await createClient()
  
  // Store notification settings in user preferences or separate table
  const { error } = await supabase
    .from('users')
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
