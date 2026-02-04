import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection
 * CRITICAL: Does NOT redirect to "/" - only to /login when unauthorized
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - API routes (handled by route handlers)
  // - Static files
  // - Next.js internals
  // - Public routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') || // Files with extensions
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/' ||
    pathname.startsWith('/competition/') ||
    pathname.startsWith('/questions/') ||
    pathname.startsWith('/wheel/') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/guide') ||
    pathname.startsWith('/rules') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')
  ) {
    return NextResponse.next();
  }

  // For dashboard routes, let the layout handle auth
  // Middleware should NOT redirect - layout will redirect to /login if needed
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg (favicon files)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\..*|public).*)',
  ],
};
