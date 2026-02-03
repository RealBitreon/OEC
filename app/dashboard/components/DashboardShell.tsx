'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { DashboardSection } from '../core/types'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider'
import Sidebar from './Sidebar'
import Header from './Header'
import Overview from './sections/Overview'
import CompetitionsManagement from './sections/CompetitionsManagement'
import QuestionsManagement from './sections/QuestionsManagement'
import Archives from './sections/Archives'
import UsersManagement from './sections/UsersManagement'
import AuditLog from './sections/AuditLog'
import Settings from './sections/Settings'

function DashboardContent({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user: profile } = useAuth()
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if we're on a sub-route (not the main dashboard page)
  const isSubRoute = pathname !== '/dashboard'

  // Update active section based on URL search params
  useEffect(() => {
    const section = searchParams.get('section') as DashboardSection
    if (section && section !== activeSection) {
      setActiveSection(section)
    }
  }, [searchParams])
  
  // Update URL when section changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isSubRoute) {
      const currentSection = searchParams.get('section')
      if (currentSection !== activeSection) {
        const url = new URL(window.location.href)
        url.searchParams.set('section', activeSection)
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [activeSection, isSubRoute, searchParams])

  // Always render dashboard - auth is checked at layout level
  // Use profile from AuthProvider (passed as initialUser from server)
  const currentProfile = profile || {
    id: 'temp',
    username: 'User',
    role: 'LRC_MANAGER' as const,
    createdAt: new Date().toISOString()
  }

  const renderSection = () => {
    const props = { profile: currentProfile }
    switch (activeSection) {
      case 'overview':
        return <Overview {...props} />
      case 'competitions':
        return <CompetitionsManagement {...props} />
      case 'training-questions':
        return <QuestionsManagement {...props} mode="training" />
      case 'question-bank':
        return <QuestionsManagement {...props} mode="bank" />
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors" dir="rtl">
      <Sidebar
        profile={currentProfile}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pr-72">
        <Header
          profile={currentProfile}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">
          {isSubRoute ? children : renderSection()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function DashboardShell({ children, initialUser }: { children?: React.ReactNode; initialUser?: any }) {
  console.log('[DashboardShell] Rendering with initialUser:', initialUser?.username)
  
  return (
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        <DashboardContent>{children}</DashboardContent>
      </AuthProvider>
    </ThemeProvider>
  )
}
