import { promises as fs } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'
import type { User, UserRole } from './types'
import { verifyRoleCode } from './roleCodes'

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
  code: string
): Promise<User> {
  // Validate username uniqueness
  const existing = await findUser(username)
  if (existing) {
    throw new Error('اسم المستخدم موجود بالفعل')
  }

  // Validate username format
  if (username.length < 3) {
    throw new Error('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  }

  // Validate password strength
  if (password.length < 6) {
    throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
  }

  // Verify role code (REQUIRED - no signup without code)
  if (!code || code.trim().length < 12) {
    throw new Error('رمز الدور مطلوب ويجب أن يكون 12 حرفاً على الأقل')
  }

  const role = await verifyRoleCode(code.trim())
  if (!role) {
    throw new Error('رمز الدور غير صحيح')
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

  console.log(`✅ ${role.toUpperCase()} account created: ${username}`)

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
