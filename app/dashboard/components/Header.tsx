'use client'

import Icons from '@/components/icons'
import { User } from '../core/types'

interface HeaderProps {
  profile: User
  onMenuClick: () => void
}

export default function Header({ profile, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Icons.menu className="w-6 h-6 text-neutral-700" />
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-neutral-800">لوحة التحكم</h1>
            <p className="text-sm text-neutral-600">إدارة المسابقات والأسئلة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-neutral-800">{profile.username}</p>
            <p className="text-xs text-neutral-600">
              {profile.role === 'CEO' ? 'المدير التنفيذي' : 'مشرف LRC'}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icons.user className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  )
}
