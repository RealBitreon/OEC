import { requireSession } from '@/lib/auth/requireSession'
import DashboardClient from './DashboardClient'
import { readJson } from '@/lib/store/readWrite'
import type { Competition, Question, Submission, Winner, AuditLog, Ticket } from '@/lib/store/types'
import { User } from '@/lib/auth/types'

export default async function DashboardPage() {
  const session = await requireSession()
  
  // Load all data
  const competitions = await readJson<Competition[]>('competitions.json', [])
  const questions = await readJson<Question[]>('questions.json', [])
  const submissions = await readJson<Submission[]>('submissions.json', [])
  const winners = await readJson<Winner[]>('winners.json', [])
  const users = await readJson<User[]>('users.json', [])
  const tickets = await readJson<Ticket[]>('tickets.json', [])
  const auditLogs = session.role === 'ceo' ? await readJson<AuditLog[]>('audit.json', []) : []

  return (
    <DashboardClient
      session={session}
      initialCompetitions={competitions}
      initialQuestions={questions}
      initialSubmissions={submissions}
      initialWinners={winners}
      initialUsers={users}
      initialAuditLogs={auditLogs}
      initialTickets={tickets}
    />
  )
}
