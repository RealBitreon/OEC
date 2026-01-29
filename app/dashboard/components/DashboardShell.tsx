'use client'

import { useState, useEffect } from 'react'
import { User, DashboardSection } from '../core/types'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import Sidebar from './Sidebar'
import Header from './Header'
import Overview from './sections/Overview'
import CompetitionsManagement from './sections/CompetitionsManagement'
import QuestionsManagement from './sections/QuestionsManagement'
import SubmissionsReview from './sections/SubmissionsReview'
import TicketsManagement from './sections/TicketsManagement'
import WheelManagement from './sections/WheelManagement'
import Archives from './sections/Archives'
import UsersManagement from './sections/UsersManagement'
import AuditLog from './sections/AuditLog'
import Settings from './sections/Settings'

export default function DashboardShell() {
  const [profile, setProfile] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => {
        console.log('Session response:', data)
        if (data.user) {
          setProfile({
            ...data.user,
            createdAt: data.user.createdAt || new Date().toISOString()
          })
        } else {
          console.error('No user in session data')
          console.error('Error:', data.error)
          console.error('Debug info:', data.debug)
          
          // Show helpful error message
          if (data.debug?.message) {
            alert(`Auth Error: ${data.debug.message}\n\nPlease run fix_auth_complete.sql in Supabase SQL Editor`)
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch session:', err)
        alert('Failed to load session. Please check console for details.')
      })
  }, [])

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    const props = { profile }
    switch (activeSection) {
      case 'overview':
        return <Overview {...props} />
      case 'competitions':
        return <CompetitionsManagement {...props} />
      case 'questions':
        return <QuestionsManagement {...props} />
      case 'submissions':
        return <SubmissionsReview {...props} />
      case 'tickets':
        return <TicketsManagement {...props} />
      case 'wheel':
        return <WheelManagement {...props} />
      case 'archives':
        return <Archives {...props} />
      case 'users':
        return <UsersManagement {...props} />
      case 'audit':
        return <AuditLog {...props} />
      case 'settings':
        return <Settings {...props} />
      default:
        return <Overview {...props} />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors" dir="rtl">
        <Sidebar
          profile={profile}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pr-64">
          <Header
            profile={profile}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="p-4 lg:p-8">
            {renderSection()}
          </main>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
