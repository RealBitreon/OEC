import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/ui'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مسابقة الموسوعة العُمانية',
  description: 'ابحث في الموسوعة… وثّق المصدر… واجمع فرصك للدخول في السحب',
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
  themeColor: '#10b981',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>
        <body className="overflow-x-hidden antialiased">
          <ToastProvider>
            {children}
          </ToastProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
  )
}
