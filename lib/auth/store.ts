import { promises as fs } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'
import type { User, UserRole } from './types'

const USERS_FILE = join(process.cwd(), 'data', 'users.json')
let writeLock = Promise.resolve()

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function ensureUsersFile() {
  await ensureDataDir()
  try {
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf-8')
  }
}

export async function readUsers(): Promise<User[]> {
  await ensureUsersFile()
  const data = await fs.readFile(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir()
  writeLock = writeLock.then(async () => {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  })
  await writeLock
}

export async function findUser(username: string): Promise<User | null> {
  const users = await readUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null
}

export async function createUser(
  username: string,
  password: string,
  code?: string
): Promise<User> {
  // Validate username uniqueness
  const existing = await findUser(username)
  if (existing) {
    throw new Error('اسم المستخدم موجود بالفعل')
  }

  // Validate password strength
  if (password.length < 6) {
    throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  }

  // Determine role from code
  let role: UserRole = 'student'
  if (code === 'CE@') {
    role = 'ceo'
  } else if (code === '$RC') {
    role = 'lrc_manager'
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  const user: User = {
    username: username.trim(),
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  }

  const users = await readUsers()
  users.push(user)
  await writeUsers(users)

  return user
}

export async function verifyPassword(username: string, password: string): Promise<User | null> {
  const user = await findUser(username)
  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  return isValid ? user : null
}
