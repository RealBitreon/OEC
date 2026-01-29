import { createServiceClient } from '@/lib/supabase/server'
import type { IUsersRepo } from '../interfaces'
import type { User } from '@/lib/store/types'

export class SupabaseUsersRepo implements IUsersRepo {
  async getById(id: string): Promise<User | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      role: data.role,
      displayName: data.username,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async getByUsername(username: string): Promise<User | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      role: data.role,
      displayName: data.username,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async create(user: User): Promise<User> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        password: '', // Password should be hashed before calling this
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      role: data.role,
      displayName: data.username,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const supabase = createServiceClient()
    const updateData: any = {}
    
    if (patch.username) updateData.username = patch.username
    if (patch.email) updateData.email = patch.email
    if (patch.role) updateData.role = patch.role

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      role: data.role,
      displayName: data.username,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async listAll(): Promise<User[]> {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list users: ${error.message}`)

    return (data || []).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email || '',
      role: u.role,
      displayName: u.username,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }))
  }
}
