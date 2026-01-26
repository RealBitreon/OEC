'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SessionPayload } from '@/lib/auth/types'
import type { TabType } from '../DashboardClient'

interface DashboardLayoutProps {
  session: SessionPayload
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  children: React.ReactNode
}

export default function DashboardLayout({ session, activeTab, setActiveTab, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getRoleBadge = () => {
    switch (session.role) {
      case 'ceo':
        return { label: 'CEO', color: 'bg-purple-100 text-purple-700' }
      case 'lrc_manager':
        return { label: 'مسؤول LRC', color: 'bg-blue-100 text-blue-700' }
      case 'student':
        return { label: 'طالب', color: 'bg-green-100 text-green-700' }
    }
  }

  const roleBadge = getRoleBadge()

  const navItems: { id: TabType; label: string; icon: string; roles: string[] }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊', roles: ['ceo', 'lrc_manager', 'student'] },
    { id: 'competitions', label: 'المسابقات', icon: '🏆', roles: ['ceo', 'lrc_manager'] },
    { id: 'questions', label: 'الأسئلة', icon: '❓', roles: ['ceo', 'lrc_manager'] },
    { id: 'submissions', label: 'إجابات الطلاب', icon: '📝', roles: ['ceo', 'lrc_manager'] },
    { id: 'wheel', label: 'عجلة الحظ', icon: '🎡', roles: ['ceo', 'lrc_manager'] },
    { id: 'tickets', label: 'التذاكر', icon: '🎫', roles: ['ceo', 'lrc_manager'] },
    { id: 'archives', label: 'الإصدارات السابقة', icon: '📦', roles: ['ceo', 'lrc_manager', 'student'] },
    { id: 'users', label: 'المستخدمون', icon: '👥', roles: ['ceo'] },
    { id: 'audit', label: 'سجل التدقيق', icon: '📋', roles: ['ceo'] },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', roles: ['ceo', 'lrc_manager', 'student'] },
  ]

  const visibleNavItems = navItems.filter(item => item.roles.includes(session.role))

  return (
    <div className="min-h-screen bg-neutral-50" dir="rtl">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 z-30 bg-white border-b border-neutral-200 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Right: Logo + Menu Toggle */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">م</span>
              </div>
              <span className="hidden md:block font-bold text-primary">لوحة التحكم</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>

          {/* Left: User Info */}
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-neutral-900">{session.username}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${roleBadge.color}`}>
                {roleBadge.label}
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">{session.username[0].toUpperCase()}</span>
            </div>
            <Link
              href="/logout"
              className="text-sm text-neutral-600 hover:text-primary transition-colors px-3 py-2 hover:bg-neutral-50 rounded-lg"
            >
              تسجيل الخروج
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-neutral-200 z-20 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-1">
          {visibleNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full text-right px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeTab === item.id
                  ? 'bg-primary text-white font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pr-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
