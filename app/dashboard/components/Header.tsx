'use client'

import { User } from '../core/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderProps {
  profile: User
  onMenuClick: () => void
}

export default function Header({ profile, onMenuClick }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all lg:hidden"
          aria-label="فتح القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Return to Home Button - Desktop */}
        <Link
          href="/"
          className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>العودة للرئيسية</span>
        </Link>

        <div className="flex-1" />

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Badge */}
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm
            ${profile.role === 'CEO' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }
          `}>
            {getRoleLabel(profile.role)}
          </div>

          {/* Username */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              {profile.username}
            </span>
          </div>

          {/* Return to Home - Mobile */}
          <Link
            href="/"
            className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
            aria-label="العودة للرئيسية"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <span className="hidden sm:inline">تسجيل الخروج</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    CEO: 'المدير التنفيذي',
    LRC_MANAGER: 'مدير المسابقة',
  }
  return labels[role] || role
}
