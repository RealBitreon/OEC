'use client'

import { useState } from 'react'
import type { SessionPayload } from '@/lib/auth/types'
import type { Competition, Question, Submission, Winner, AuditLog, Ticket } from '@/lib/store/types'
import type { User } from '@/lib/auth/types'
import DashboardLayout from './components/DashboardLayout'
import OverviewTab from './components/OverviewTab'
import CompetitionsTab from './components/CompetitionsTab'
import QuestionsTab from './components/QuestionsTab'
import SubmissionsTab from './components/SubmissionsTab'
import WheelTab from './components/WheelTab'
import ArchivesTab from './components/ArchivesTab'
import SettingsTab from './components/SettingsTab'
import UsersTab from './components/UsersTab'
import AuditTab from './components/AuditTab'
import TicketsTab from './components/TicketsTab'

interface DashboardClientProps {
  session: SessionPayload
  initialCompetitions: Competition[]
  initialQuestions: Question[]
  initialSubmissions: Submission[]
  initialWinners: Winner[]
  initialUsers: User[]
  initialAuditLogs: AuditLog[]
  initialTickets: Ticket[]
}

export type TabType = 'overview' | 'competitions' | 'questions' | 'submissions' | 'wheel' | 'tickets' | 'archives' | 'settings' | 'users' | 'audit'

export default function DashboardClient({
  session,
  initialCompetitions,
  initialQuestions,
  initialSubmissions,
  initialWinners,
  initialUsers,
  initialAuditLogs,
  initialTickets
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [competitions, setCompetitions] = useState(initialCompetitions)
  const [questions, setQuestions] = useState(initialQuestions)
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [winners, setWinners] = useState(initialWinners)
  const [users, setUsers] = useState(initialUsers)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)
  const [tickets, setTickets] = useState(initialTickets)

  const refreshData = (type: 'competitions' | 'questions' | 'submissions' | 'winners' | 'users' | 'audit') => {
    // Trigger re-fetch by reloading the page or using SWR/React Query
    // For now, we'll use optimistic updates
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab session={session} competitions={competitions} submissions={submissions} winners={winners} />
      case 'competitions':
        return <CompetitionsTab session={session} competitions={competitions} setCompetitions={setCompetitions} />
      case 'questions':
        return <QuestionsTab session={session} competitions={competitions} questions={questions} setQuestions={setQuestions} />
      case 'submissions':
        return <SubmissionsTab session={session} competitions={competitions} questions={questions} submissions={submissions} setSubmissions={setSubmissions} />
      case 'wheel':
        return <WheelTab session={session} competitions={competitions} submissions={submissions} winners={winners} setWinners={setWinners} />
      case 'tickets':
        return <TicketsTab competitions={competitions} tickets={tickets} />
      case 'archives':
        return <ArchivesTab competitions={competitions} questions={questions} winners={winners} />
      case 'settings':
        return <SettingsTab session={session} />
      case 'users':
        return session.role === 'ceo' ? <UsersTab users={users} setUsers={setUsers} /> : null
      case 'audit':
        return session.role === 'ceo' ? <AuditTab auditLogs={auditLogs} isCEO={true} /> : null
      default:
        return <OverviewTab session={session} competitions={competitions} submissions={submissions} winners={winners} />
    }
  }

  return (
    <DashboardLayout session={session} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
    </DashboardLayout>
  )
}
