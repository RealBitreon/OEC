'use client'

// ============================================
// SIDEBAR - NAVIGATION
// ============================================

// Navigation handled via onSectionChange callback
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
  { id: 'competitions', label: 'إدارة المسابقات', icon: '🏆', minRole: 'LRC_MANAGER' },
  { id: 'training-questions', label: 'الأسئلة التدريبية', icon: '❓', minRole: 'LRC_MANAGER' },
  { id: 'question-bank', label: 'مكتبة الأسئلة', icon: '📚', minRole: 'LRC_MANAGER' },
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

  const handleNavigation = (section: DashboardSection) => {
    // Update section and URL
    onSectionChange(section)
    
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('section', section)
      window.history.pushState({}, '', url.toString())
    }
    
    onClose()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 xl:w-72 lg:flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-center h-14 lg:h-16 px-3 lg:px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-base lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1.5 lg:space-y-2 overflow-y-auto">
            {visibleItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3.5 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-200 animate-fade-in group
                  ${activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md hover:scale-[1.01]'
                  }
                `}
              >
                <span className={`text-lg lg:text-2xl transition-transform group-hover:scale-110 flex-shrink-0 ${activeSection === item.id ? 'animate-pulse' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-right truncate">{item.label}</span>
                {activeSection === item.id && (
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-3 lg:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse flex-shrink-0">
                <span className="text-base lg:text-lg font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {profile.username}
                </p>
                <p className="text-[10px] lg:text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">
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
          fixed inset-y-0 right-0 z-40 w-[280px] sm:w-80 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl transform transition-transform duration-300 lg:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0 h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              aria-label="إغلاق القائمة"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 sm:space-y-2 overflow-y-auto">
            {visibleItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 animate-fade-in group
                  ${activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md'
                  }
                `}
              >
                <span className={`text-lg sm:text-2xl transition-transform group-hover:scale-110 ${activeSection === item.id ? 'animate-pulse' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-right truncate">{item.label}</span>
                {activeSection === item.id && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-base sm:text-lg font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {profile.username}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">
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
