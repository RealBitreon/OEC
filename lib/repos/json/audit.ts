import type { IAuditRepo } from '../interfaces'
import type { AuditLog } from '@/lib/store/types'
import { readAudit, writeAudit } from '@/lib/store/readWrite'
import { randomUUID } from 'crypto'

export class JsonAuditRepo implements IAuditRepo {
  async list(filters?: {
    action?: string
    performedBy?: string
    limit?: number
  }): Promise<AuditLog[]> {
    let logs = await readAudit()

    if (filters?.action) {
      logs = logs.filter((log: AuditLog) => log.action === filters.action)
    }
    if (filters?.performedBy) {
      logs = logs.filter((log: AuditLog) => log.performedBy === filters.performedBy)
    }
    if (filters?.limit) {
      logs = logs.slice(-filters.limit)
    }

    return logs
  }

  async append(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const logs = await readAudit() as AuditLog[]
    const newLog: AuditLog = {
      id: randomUUID(),
      ...entry,
      timestamp: new Date().toISOString()
    }
    logs.push(newLog)
    await writeAudit(logs)
    return newLog
  }
}
