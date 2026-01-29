import { createServiceClient } from '@/lib/supabase/server'
import type { IAuditRepo } from '../interfaces'
import type { AuditLog } from '@/lib/store/types'

export class SupabaseAuditRepo implements IAuditRepo {
  private transformFromDb(data: any): AuditLog {
    return {
      id: data.id,
      userId: data.user_id,
      action: data.action,
      details: data.details || {},
      createdAt: data.created_at,
    }
  }

  async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: log.userId,
        action: log.action,
        details: log.details,
        entity_type: 'general',
        entity_id: null,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create audit log: ${error.message}`)
    return this.transformFromDb(data)
  }

  async listByUser(userId: string): Promise<AuditLog[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list audit logs: ${error.message}`)
    return (data || []).map(l => this.transformFromDb(l))
  }

  async listAll(limit: number = 100): Promise<AuditLog[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to list audit logs: ${error.message}`)
    return (data || []).map(l => this.transformFromDb(l))
  }
}
