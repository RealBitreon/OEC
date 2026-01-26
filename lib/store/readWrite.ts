import { promises as fs } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
let writeLocks = new Map<string, Promise<void>>()

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  const filePath = join(DATA_DIR, filename)
  
  try {
    await fs.access(filePath)
    const data = await fs.readFile(filePath, 'utf-8')
    
    // Validate JSON before parsing
    if (!data.trim()) {
      console.warn(`[readJson] Empty file ${filename}, using default`)
      await writeJson(filename, defaultValue)
      return defaultValue
    }
    
    try {
      const parsed = JSON.parse(data)
      return parsed
    } catch (parseError) {
      console.error(`[readJson] Invalid JSON in ${filename}:`, parseError)
      // Backup corrupted file
      const backupPath = join(DATA_DIR, `${filename}.corrupted.${Date.now()}`)
      await fs.copyFile(filePath, backupPath)
      console.warn(`[readJson] Backed up corrupted file to ${backupPath}`)
      
      // Return default and overwrite
      await writeJson(filename, defaultValue)
      return defaultValue
    }
  } catch (error) {
    // File doesn't exist, create with default
    console.log(`[readJson] File ${filename} not found, creating with default`)
    await writeJson(filename, defaultValue)
    return defaultValue
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = join(DATA_DIR, filename)
  const tempPath = `${filePath}.tmp`
  
  // Use lock to prevent concurrent writes
  const lockKey = filename
  const currentLock = writeLocks.get(lockKey) || Promise.resolve()
  
  const newLock = currentLock.then(async () => {
    try {
      // Validate that data can be stringified
      const jsonString = JSON.stringify(data, null, 2)
      
      // Write to temp file first with UTF-8 encoding
      await fs.writeFile(tempPath, jsonString, { encoding: 'utf-8' })
      
      // Atomic rename
      await fs.rename(tempPath, filePath)
    } catch (error) {
      console.error(`[writeJson] Failed to write ${filename}:`, error)
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath)
      } catch {}
      throw error
    }
  })
  
  writeLocks.set(lockKey, newLock)
  await newLock
  writeLocks.delete(lockKey)
}

// Specific data file helpers
export async function readUsers() {
  return readJson('users.json', [])
}

export async function writeUsers(data: any) {
  return writeJson('users.json', data)
}

export async function readCompetitions() {
  return readJson('competitions.json', [])
}

export async function writeCompetitions(data: any) {
  return writeJson('competitions.json', data)
}

export async function readQuestions() {
  return readJson('questions.json', [])
}

export async function writeQuestions(data: any) {
  return writeJson('questions.json', data)
}

export async function readSubmissions() {
  return readJson('submissions.json', [])
}

export async function writeSubmissions(data: any) {
  return writeJson('submissions.json', data)
}

export async function readAudit() {
  return readJson('audit.json', [])
}

export async function writeAudit(data: any) {
  return writeJson('audit.json', data)
}

export async function readWinners() {
  return readJson('winners.json', [])
}

export async function writeWinners(data: any) {
  return writeJson('winners.json', data)
}

export async function readTrainingSubmissions() {
  return readJson('training_submissions.json', [])
}

export async function writeTrainingSubmissions(data: any) {
  return writeJson('training_submissions.json', data)
}

export async function readTickets() {
  return readJson('tickets.json', [])
}

export async function writeTickets(data: any) {
  return writeJson('tickets.json', data)
}

export async function readWheelRuns() {
  return readJson('wheel_runs.json', [])
}

export async function writeWheelRuns(data: any) {
  return writeJson('wheel_runs.json', data)
}
