/**
 * Root Layout Component
 * 
 * This is the top-level layout for the entire app. Every page wraps through here.
 * 
 * Key responsibilities:
 * - Set up HTML structure (lang, dir for RTL)
 * - Configure metadata (SEO, Open Graph, viewport)
 * - Load global providers (Toast, ErrorBoundary)
 * - Include analytics and monitoring
 * - Apply global styles
 * 
 * Why RTL (dir="rtl")?
 * This is an Arabic app, so we need right-to-left layout. This single
 * attribute flips the entire UI - text alignment, flex direction, margins, etc.
 * 
 * Performance optimizations:
 * - Preconnect to Google Fonts (reduces DNS lookup time)
 * - DNS prefetch for external resources
 * - Vercel Analytics and Speed Insights for monitoring
 * 
 * Error handling:
 * - ErrorBoundary catches React errors and shows fallback UI
 * - Prevents the entire app from crashing due to a single component error
 */

import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/ui'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineBanner } from '@/components/OfflineBanner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { config } from '@/lib/config/site'
import './globals.css'

// SEO metadata - shows up in search results and social media shares
export const metadata: Metadata = {
  title: `${config.site.title} - ${config.school.name}`,
  description: config.site.description,
  openGraph: {
    title: `${config.site.title} - ${config.school.name}`,
    description: config.site.description,
    locale: 'ar_OM', // Arabic (Oman)
  },
}

// Viewport configuration for mobile responsiveness
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Don't disable pinch-to-zoom
  themeColor: '#1a5f4f', // Browser chrome color on mobile
  viewportFit: 'cover', // Handle notches on iPhone X+
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
        <head>
          {/* Preconnect to Google Fonts for faster loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>
        <body className="overflow-x-hidden antialiased">
          {/* ErrorBoundary catches React errors and prevents full app crash */}
          <ErrorBoundary>
            {/* ToastProvider enables toast notifications throughout the app */}
            <ToastProvider>
              {/* Show banner when user goes offline */}
              <OfflineBanner />
              {children}
            </ToastProvider>
          </ErrorBoundary>
          {/* Vercel Analytics - track page views and performance */}
          <Analytics />
          {/* Speed Insights - monitor Core Web Vitals */}
          <SpeedInsights />
        </body>
      </html>
  )
}
