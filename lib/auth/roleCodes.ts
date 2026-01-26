import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const CODES_PATH = join(process.cwd(), 'data', 'role_codes.json')

export interface RoleCode {
  id: string
  role: 'ceo' | 'lrc_manager' | 'student'
  codeHash: string
  createdAt: string
  createdBy: string
  isActive: boolean
}

export function readRoleCodes(): RoleCode[] {
  try {
    const data = readFileSync(CODES_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeRoleCodes(codes: RoleCode[]): void {
  writeFileSync(CODES_PATH, JSON.stringify(codes, null, 2), 'utf-8')
}

export async function verifyRoleCode(code: string): Promise<'ceo' | 'lrc_manager' | 'student' | null> {
  const codes = readRoleCodes()
  
  for (const roleCode of codes) {
    if (!roleCode.isActive) continue
    
    const isMatch = await bcrypt.compare(code, roleCode.codeHash)
    if (isMatch) {
      return roleCode.role
    }
  }
  
  return null
}

export async function createRoleCode(
  role: 'ceo' | 'lrc_manager' | 'student',
  rawCode: string,
  createdBy: string
): Promise<RoleCode> {
  const codes = readRoleCodes()
  
  const codeHash = await bcrypt.hash(rawCode, 10)
  
  const newCode: RoleCode = {
    id: crypto.randomUUID(),
    role,
    codeHash,
    createdAt: new Date().toISOString(),
    createdBy,
    isActive: true
  }
  
  codes.push(newCode)
  writeRoleCodes(codes)
  
  return newCode
}

export function deactivateRoleCode(id: string): void {
  const codes = readRoleCodes()
  const code = codes.find(c => c.id === id)
  
  if (code) {
    code.isActive = false
    writeRoleCodes(codes)
  }
}

export function listRoleCodes(): RoleCode[] {
  return readRoleCodes()
}
