import type { Metadata, Viewport } from 'next'
import { getSession } from '@/lib/auth/session'
import './globals.css'

export const metadata: Metadata = {
  title: 'مسابقة الموسوعة العُمانية',
  description: 'ابحث في الموسوعة… وثّق المصدر… واجمع فرصك للدخول في السحب',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'مسابقة الموسوعة العُمانية',
    description: 'ابحث في الموسوعة… وثّق المصدر… واجمع فرصك للدخول في السحب',
    locale: 'ar_OM',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  return (
    <html lang="ar" dir="rtl">
      <body className="overflow-x-hidden">
        <div data-session={session ? JSON.stringify(session) : null}>
          {children}
        </div>
      </body>
    </html>
  )
}
