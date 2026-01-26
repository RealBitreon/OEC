import type { Participant } from '@/lib/store/types'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const PARTICIPANTS_PATH = join(process.cwd(), 'data', 'participants.json')

export function readParticipants(): Participant[] {
  try {
    const data = readFileSync(PARTICIPANTS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeParticipants(participants: Participant[]): void {
  writeFileSync(PARTICIPANTS_PATH, JSON.stringify(participants, null, 2), 'utf-8')
}

export function createParticipant(data: Omit<Participant, 'id' | 'createdAt'>): Participant {
  const participants = readParticipants()
  
  const participant: Participant = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  }
  
  participants.push(participant)
  writeParticipants(participants)
  
  return participant
}

export function getParticipantById(id: string): Participant | null {
  const participants = readParticipants()
  return participants.find(p => p.id === id) || null
}

export function listParticipantsByCompetition(competitionId: string): Participant[] {
  const participants = readParticipants()
  return participants.filter(p => p.competitionId === competitionId)
}
