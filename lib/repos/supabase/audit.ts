import type { IAuditRepo } from '../interfaces'
import type { AuditLog } from '@/lib/store/types'

export class SupabaseAuditRepo implements IAuditRepo {
  async list(filters?: {
    action?: string
    performedBy?: string
    limit?: number
  }): Promise<AuditLog[]> {
    throw new Error('Supabase repo not enabled')
  }

  async append(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    throw new Error('Supabase repo not enabled')
  }
}
