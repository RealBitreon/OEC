import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create Supabase client for server-side operations
 * 
 * CRITICAL PERFORMANCE FIX:
 * We disable auto-refresh and polling to prevent background network requests.
 * Without these settings, Supabase would constantly ping the server to check
 * if the session is still valid, causing unnecessary load and slowing down
 * the app.
 * 
 * Why is this safe?
 * - Sessions last 1 hour by default (plenty of time for a single request)
 * - We refresh sessions in middleware when needed
 * - API routes are stateless - each request gets a fresh client
 * 
 * This is a common gotcha with Supabase SSR - the defaults are optimized
 * for long-lived browser sessions, not server-side request handlers.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        // CRITICAL: Disable auto-refresh to prevent background requests
        autoRefreshToken: false,
        // IMPORTANT: Keep persistSession true for login to work
        // This just means "use cookies", not "keep polling"
        persistSession: true,
        // CRITICAL: Disable detect session in URL to prevent unnecessary checks
        // We don't use URL-based auth (like magic links with #access_token)
        detectSessionInUrl: false,
      },
    }
  )
}

/**
 * Service role client for admin operations (bypasses RLS)
 * 
 * SECURITY WARNING:
 * This client has god-mode access to the database. It bypasses all
 * Row Level Security policies. Use it ONLY after manual authorization
 * checks (like requireAdmin()).
 * 
 * NEVER expose this to the client or use it without auth checks.
 * 
 * When to use:
 * - After requireAuth/requireAdmin to perform privileged operations
 * - For system operations that need to read/write across all users
 * - When RLS policies would block legitimate admin actions
 * 
 * When NOT to use:
 * - In client components (use the regular client)
 * - Before checking authentication
 * - For user-facing operations (use RLS instead)
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // Same performance optimizations as above
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    }
  )
}
