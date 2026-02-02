import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    
    // Skip middleware for static files and API routes that handle their own errors
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Create Supabase client for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get user - ONLY check if user exists, nothing else
    const { data: { user }, error } = await supabase.auth.getUser()

    // Don't redirect on auth errors - most pages are public
    // Only log the error for debugging
    if (error) {
      console.log('Auth check (no user session):', error.message)
    }

    // Redirect to home if already logged in
    if ((pathname === '/login' || pathname === '/signup') && user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    // If middleware fails, redirect to error page instead of showing browser error
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/api-error', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
