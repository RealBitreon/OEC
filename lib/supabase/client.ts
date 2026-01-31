import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

/**
 * Client for browser/server with RLS
 * CRITICAL: Configured to prevent auto-refresh and polling
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // CRITICAL: Disable auto-refresh to prevent background requests
        autoRefreshToken: false,
        // CRITICAL: Disable session persistence to prevent storage polling
        persistSession: false,
        // CRITICAL: Disable detect session in URL to prevent unnecessary checks
        detectSessionInUrl: false,
      },
    })
  : null

/**
 * Service client for admin operations (bypasses RLS)
 * ONLY use in server-side code, NEVER in frontend
 */
export function getServiceSupabase() {
  if (!supabaseServiceKey || !supabaseUrl) {
    console.warn('Missing Supabase service credentials')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
