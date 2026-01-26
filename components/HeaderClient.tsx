'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnnouncementBar from './AnnouncementBar'
import type { SessionPayload } from '@/lib/auth/types'

export default function HeaderClient() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const [session, setSession] = useState<SessionPayload | null>(null)

  useEffect(() => {
    // Read session from data attribute set by layout
    const sessionData = document.querySelector('[data-session]')?.getAttribute('data-session')
    if (sessionData && sessionData !== 'null') {
      try {
        setSession(JSON.parse(sessionData))
      } catch {}
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />
      <header
        className={`fixed right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm py-4'
        }`}
        style={{ top: announcementVisible ? '48px' : '0' }}
      >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Logo - Right side for RTL */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">م</span>
            </div>
            <div className="hidden md:block">
              <div className="text-lg font-bold text-primary">الموسوعة العُمانية</div>
              <div className="text-xs text-neutral-600">مسابقة البحث والتوثيق</div>
            </div>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-primary font-semibold relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              الرئيسية
            </Link>
            <Link
              href="/questions"
              className="text-neutral-700 font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              تدرّب على الأسئلة
            </Link>
            <Link
              href="/rules"
              className="text-neutral-700 font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              القواعد
            </Link>
            <Link
              href="/wheel"
              className="text-neutral-700 font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              عجلة الحظ
            </Link>
            <Link
              href="/about"
              className="text-neutral-700 font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              عن المسابقة
            </Link>
          </nav>

          {/* Auth Buttons - Left side for RTL */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-neutral-700 font-medium hover:text-primary transition-colors px-4 py-2"
                >
                  لوحة التحكم
                </Link>
                <Link
                  href="/logout"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold px-5 py-2.5 rounded-button transition-all duration-300"
                >
                  تسجيل الخروج
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-button transition-all duration-300 hover:scale-105 shadow-button"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  )
}
