import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/rules',
  '/api/webhooks(.*)',
])

const isCEORoute = createRouteMatcher(['/ceo(.*)'])
const isManagerRoute = createRouteMatcher(['/manager(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // Require auth for protected routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Role-based redirects are handled by the layout auth guards
  // This middleware just ensures authentication
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
