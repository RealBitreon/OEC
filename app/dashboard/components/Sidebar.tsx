'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icons from '@/components/icons'
import { DashboardSection, User } from '../core/types'
import { config } from '@/lib/config/site'

interface SidebarProps {
  profile: User
  activeSection: DashboardSection
  onSectionChange: (section: DashboardSection) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({
  profile,
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}: SidebarProps) {
  const router = useRouter()

  const handleSectionChange = (section: DashboardSection) => {
    onSectionChange(section)
    router.push(`/dashboard?section=${section}`)
    onClose()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    { id: 'overview' as DashboardSection, label: 'نظرة عامة', icon: Icons.home },
    { id: 'competitions' as DashboardSection, label: 'المسابقات', icon: Icons.trophy },
    { id: 'question-bank' as DashboardSection, label: 'بنك الأسئلة', icon: Icons.help },
    { id: 'training-questions' as DashboardSection, label: 'أسئلة التدريب', icon: Icons.book },
  ]

  return (
    <>
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-neutral-200 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">م</span>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{config.site.title}</div>
                <div className="text-xs text-neutral-600">{config.school.shortName}</div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icons.user className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800 truncate">{profile.username}</p>
                <p className="text-xs text-neutral-600">
                  {profile.role === 'CEO' ? 'المدير التنفيذي' : 'مشرف LRC'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-xs font-semibold text-neutral-500 mb-3 px-4">روابط سريعة</p>
              <div className="space-y-1">
                <Link
                  href="/admin/simulator"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Icons.settings className="w-5 h-5" />
                  <span className="font-medium">محاكي العجلة</span>
                </Link>
                <Link
                  href="/wheel"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Icons.target className="w-5 h-5" />
                  <span className="font-medium">عجلة الحظ</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Icons.home className="w-5 h-5" />
                  <span className="font-medium">الصفحة الرئيسية</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Icons.logout className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
