import type { IUsersRepo } from '../interfaces'
import type { User } from '@/lib/auth/types'

export class SupabaseUsersRepo implements IUsersRepo {
  async findByUsername(username: string): Promise<User | null> {
    throw new Error('Supabase repo not enabled')
  }

  async listAll(): Promise<User[]> {
    throw new Error('Supabase repo not enabled')
  }

  async create(data: User): Promise<User> {
    throw new Error('Supabase repo not enabled')
  }

  async updateRole(username: string, role: 'ceo' | 'lrc_manager' | 'student'): Promise<User> {
    throw new Error('Supabase repo not enabled')
  }
}
