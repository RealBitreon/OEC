import type { IUsersRepo } from '../interfaces'
import type { User } from '@/lib/auth/types'
import { readUsers, writeUsers } from '@/lib/store/readWrite'

export class JsonUsersRepo implements IUsersRepo {
  async findByUsername(username: string): Promise<User | null> {
    const users = await readUsers() as User[]
    return users.find((u: User) => u.username === username) || null
  }

  async listAll(): Promise<User[]> {
    return await readUsers() as User[]
  }

  async create(data: User): Promise<User> {
    const users = await readUsers() as User[]
    users.push(data)
    await writeUsers(users)
    return data
  }

  async updateRole(username: string, role: 'ceo' | 'lrc_manager' | 'student'): Promise<User> {
    const users = await readUsers() as User[]
    const index = users.findIndex((u: User) => u.username === username)
    
    if (index === -1) {
      throw new Error('User not found')
    }

    users[index].role = role
    await writeUsers(users)
    return users[index]
  }
}
