'use client'

// ============================================
// SIDEBAR - NAVIGATION
// ============================================

import { User, DashboardSection } from '../core/types'
import { canAccessSection } from '../core/permissions'

interface SidebarProps {
  profile: User
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: DashboardSection
  label: string
  icon: string
  minRole: 'LRC_MANAGER' | 'CEO'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'نظرة عامة', icon: '📊', minRole: 'LRC_MANAGER' },
  { id: 'current-competition', label: 'المسابقة الحالية', icon: '🎯', minRole: 'LRC_MANAGER' },
  { id: 'competitions', label: 'إدارة المسابقات', icon: '🏆', minRole: 'LRC_MANAGER' },
  { id: 'questions', label: 'الأسئلة', icon: '❓', minRole: 'LRC_MANAGER' },
  { id: 'submissions', label: 'إجابات الطلاب', icon: '📝', minRole: 'LRC_MANAGER' },
  { id: 'tickets', label: 'التذاكر', icon: '🎫', minRole: 'LRC_MANAGER' },
  { id: 'wheel', label: 'عجلة الحظ', icon: '🎡', minRole: 'LRC_MANAGER' },
  { id: 'archives', label: 'الإصدارات السابقة', icon: '📦', minRole: 'LRC_MANAGER' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️', minRole: 'LRC_MANAGER' },
  { id: 'users', label: 'المستخدمون', icon: '👥', minRole: 'CEO' },
  { id: 'audit', label: 'سجل التدقيق', icon: '📋', minRole: 'CEO' },
]

export default function Sidebar({
  profile,
  activeSection,
  onSectionChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter(item => 
    canAccessSection(profile.role, item.id)
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 lg:flex-col bg-white border-l border-neutral-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
            <h1 className="text-xl font-bold text-neutral-900">
              لوحة التحكم
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${activeSection === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-700 hover:bg-neutral-50'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-700">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {profile.username}
                </p>
                <p className="text-xs text-neutral-500">
                  {getRoleLabel(profile.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-neutral-200 transform transition-transform duration-300 lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0 h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
            <h1 className="text-xl font-bold text-neutral-900">
              لوحة التحكم
            </h1>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  onClose()
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${activeSection === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-700 hover:bg-neutral-50'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-700">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {profile.username}
                </p>
                <p className="text-xs text-neutral-500">
                  {getRoleLabel(profile.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    CEO: 'المدير التنفيذي',
    LRC_MANAGER: 'مدير المسابقة',
  }
  return labels[role] || role
}
