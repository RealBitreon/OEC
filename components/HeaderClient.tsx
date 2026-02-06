'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnnouncementBar from './AnnouncementBar'
import { config } from '@/lib/config/site'
import { useAuth } from '@/lib/auth/AuthProvider'

export default function HeaderClient() {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />
      <header
        className={`fixed right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2 sm:py-2.5 md:py-3' : 'bg-white/95 backdrop-blur-sm py-2.5 sm:py-3 md:py-4'
        }`}
        style={{ top: announcementVisible ? '40px' : '0' }}
      >
      <div className="section-container">
        <div className="flex items-center justify-between gap-2">
          {/* Logo - Right side for RTL */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">م</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs sm:text-sm md:text-lg font-bold text-primary leading-tight">{config.site.title}</div>
              <div className="text-[10px] sm:text-xs text-neutral-600">{config.school.shortName}</div>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-center">
            <Link
              href="/"
              className="text-primary font-semibold text-sm relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full whitespace-nowrap"
            >
              الرئيسية
            </Link>
            <Link
              href="/questions"
              className="text-neutral-700 font-medium text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full whitespace-nowrap"
            >
              تدرّب على الأسئلة
            </Link>
            <Link
              href="/rules"
              className="text-neutral-700 font-medium text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full whitespace-nowrap"
            >
              القواعد
            </Link>
            <Link
              href="/wheel"
              className="text-neutral-700 font-medium text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full whitespace-nowrap"
            >
              السحب
            </Link>
            <Link
              href="/about"
              className="text-neutral-700 font-medium text-sm hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full whitespace-nowrap"
            >
              عن المسابقة
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <Link
                href="/dashboard"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-primary text-white rounded-lg font-medium text-[10px] sm:text-xs md:text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
              >
                الداشبورد
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-primary text-white rounded-lg font-medium text-[10px] sm:text-xs md:text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
              >
                تسجيل الدخول
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-neutral-700 hover:text-primary transition-colors flex-shrink-0"
              aria-label="القائمة"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <nav className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-80 bg-white shadow-2xl p-4 sm:p-6 overflow-y-auto animate-slide-in-right">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-primary">القائمة</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-primary font-semibold bg-primary/5 rounded-lg"
            >
              الرئيسية
            </Link>
            <Link
              href="/questions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-neutral-700 font-medium hover:bg-neutral-50 rounded-lg transition-colors"
            >
              تدرّب على الأسئلة
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-neutral-700 font-medium hover:bg-neutral-50 rounded-lg transition-colors"
            >
              القواعد
            </Link>
            <Link
              href="/wheel"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-neutral-700 font-medium hover:bg-neutral-50 rounded-lg transition-colors"
            >
              السحب
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-neutral-700 font-medium hover:bg-neutral-50 rounded-lg transition-colors"
            >
              عن المسابقة
            </Link>
            
            {/* Login/Dashboard Button in Mobile Menu */}
            <div className="pt-3 sm:pt-4 border-t border-neutral-200">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  اذهب للداشبورد
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-primary text-white font-semibold rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    )}
    </>
  )
}
