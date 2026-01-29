'use client'

import { User } from '../core/types'
import { useRouter } from 'next/navigation'

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
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <button
          onClick={onMenuClick}
          className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 lg:hidden"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${profile.role === 'CEO' ? 'bg-purple-100 text-purple-700' : ''}
            ${profile.role === 'LRC_MANAGER' ? 'bg-blue-100 text-blue-700' : ''}
            ${profile.role === 'STUDENT' ? 'bg-green-100 text-green-700' : ''}
          `}>
            {getRoleLabel(profile.role)}
          </div>

          <div className="hidden sm:block text-sm font-medium text-neutral-900">
            {profile.username}
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            تسجيل الخروج
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
    STUDENT: 'طالب',
  }
  return labels[role] || role
}
