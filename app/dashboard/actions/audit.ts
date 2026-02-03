'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface AuditFilters {
  user_id?: string
  action?: string
  date_from?: string
  date_to?: string
}

export async function getAuditLogs(filters: AuditFilters = {}, page = 1, limit = 50) {
  const supabase = await createClient()
  
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:users!audit_logs_user_id_fkey(id, username, display_name, role)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
  
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }
  
  if (filters.action) {
    query = query.eq('action', filters.action)
  }
  
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }
  
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await query.range(from, to)
  
  if (error) {
    console.error('Error fetching audit logs:', error)
    return { logs: [], total: 0, pages: 0 }
  }
  
  return {
    logs: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit)
  }
}

export async function getAuditStats() {
  const supabase = await createClient()
  
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('action, created_at')
  
  if (!logs) {
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      byAction: {}
    }
  }
  
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const today = logs.filter(l => new Date(l.created_at) >= todayStart).length
  const thisWeek = logs.filter(l => new Date(l.created_at) >= weekStart).length
  
  const byAction: Record<string, number> = {}
  logs.forEach(l => {
    byAction[l.action] = (byAction[l.action] || 0) + 1
  })
  
  return {
    total: logs.length,
    today,
    thisWeek,
    byAction
  }
}

export async function getUniqueActions() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('audit_logs')
    .select('action')
  
  if (!data) return []
  
  const actions = new Set(data.map(d => d.action))
  return Array.from(actions).sort()
}

export async function exportAuditLogs(filters: AuditFilters = {}) {
  const supabase = await createClient()
  
  // Get current user from auth
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    throw new Error('غير مصرح')
  }
  
  // Verify user role
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', authUser.id)
    .single()
  
  if (!user || user.role !== 'CEO') {
    throw new Error('غير مصرح - يتطلب صلاحيات المدير التنفيذي')
  }
  
  // Get all logs matching filters
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:users!audit_logs_user_id_fkey(username, display_name)
    `)
    .order('created_at', { ascending: false })
  
  if (filters.user_id) query = query.eq('user_id', filters.user_id)
  if (filters.action) query = query.eq('action', filters.action)
  if (filters.date_from) query = query.gte('created_at', filters.date_from)
  if (filters.date_to) query = query.lte('created_at', filters.date_to)
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data || []
}
