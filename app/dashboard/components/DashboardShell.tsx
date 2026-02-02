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

function DashboardContent({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user: profile } = useAuth()
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if we're on a sub-route
  const isSubRoute = pathname !== '/dashboard'

  // Update active section based on URL search params
  useEffect(() => {
    const section = searchParams.get('section') as DashboardSection
    if (section) {
      setActiveSection(section)
    }
  }, [searchParams])

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
      default:
        return <Overview {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50" dir="rtl">
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

        <main className="p-4 lg:p-8">
          {isSubRoute ? children : renderSection()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function DashboardShell({ 
  children, 
  initialUser 
}: { 
  children?: React.ReactNode
  initialUser?: any 
}) {
  return (
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        <DashboardContent>{children}</DashboardContent>
      </AuthProvider>
    </ThemeProvider>
  )
}
