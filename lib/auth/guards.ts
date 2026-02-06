/**
 * Centralized Auth Guards for API Routes
 * 
 * This module solves a critical security problem: every API route needs
 * authentication and authorization, but we don't want to copy-paste the
 * same auth logic everywhere. That's error-prone and a maintenance nightmare.
 * 
 * Instead, we centralize it here. Every API route calls requireAuth() or
 * requireAdmin() at the top, and we handle all the complexity:
 * - Checking if the user is logged in
 * - Fetching their profile from the database
 * - Verifying their role/permissions
 * - Returning consistent error responses
 * 
 * This is inspired by middleware patterns in Express/Koa, but adapted
 * for Next.js App Router's async model.
 * 
 * Security note: We use the service client (bypasses RLS) to fetch profiles
 * because the auth check happens before we know who the user is. This is
 * safe because we're only reading, not writing, and we validate the auth
 * token first.
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export interface AuthContext {
  user: {
    id: string // Database user ID
    authId: string // Supabase auth ID
    username: string
    email?: string
    role: 'CEO' | 'LRC_MANAGER' | 'student'
  }
}

export interface ApiError {
  ok: false
  code: string // Machine-readable error code
  message: string // Human-readable message (Arabic)
  hint?: string // Optional debugging hint
  correlationId?: string // For tracing requests across logs
}

/**
 * Require authentication - returns user or throws
 * 
 * This is the base auth check. Use this when you need to know who the
 * user is, but don't care about their role.
 * 
 * Example: A user viewing their own submissions
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient()
  
  // Check if they have a valid session
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    throw new AuthError('UNAUTHORIZED', 'يجب تسجيل الدخول أولاً')
  }
  
  // Get their profile from our database
  // We use the service client here because RLS policies might block this
  // query before we know who the user is. This is safe because we've
  // already validated their auth token above.
  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('id, username, email, role')
    .eq('auth_id', authUser.id)
    .single()
  
  if (profileError || !profile) {
    // This shouldn't happen in normal operation - it means they have an
    // auth account but no profile. Could be a race condition during signup
    // or a data integrity issue.
    throw new AuthError('PROFILE_NOT_FOUND', 'الملف الشخصي غير موجود')
  }
  
  return {
    user: {
      id: profile.id,
      authId: authUser.id,
      username: profile.username,
      email: profile.email || undefined,
      role: profile.role as 'CEO' | 'LRC_MANAGER' | 'student'
    }
  }
}

/**
 * Require admin role (CEO or LRC_MANAGER)
 * 
 * Use this for operations that modify competition data, review submissions,
 * or access sensitive information.
 * 
 * Example: Approving a submission, running a draw, viewing audit logs
 */
export async function requireAdmin(): Promise<AuthContext> {
  const context = await requireAuth()
  
  if (!['CEO', 'LRC_MANAGER'].includes(context.user.role)) {
    throw new AuthError('FORBIDDEN', 'يتطلب صلاحيات مدير')
  }
  
  return context
}

/**
 * Require CEO role
 * 
 * Use this for super-sensitive operations that only the top admin should do.
 * 
 * Example: Deleting competitions, modifying system settings, viewing all audit logs
 */
export async function requireCEO(): Promise<AuthContext> {
  const context = await requireAuth()
  
  if (context.user.role !== 'CEO') {
    throw new AuthError('FORBIDDEN', 'يتطلب صلاحيات المدير التنفيذي')
  }
  
  return context
}

/**
 * Custom Auth Error
 * 
 * We use a custom error class so we can distinguish auth failures from
 * other types of errors (validation, database, etc.) and handle them
 * appropriately.
 */
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
    
    // FORBIDDEN gets 403, everything else gets 401
    if (code === 'FORBIDDEN') {
      this.statusCode = 403
    }
  }
}

/**
 * Handle auth errors and return proper response
 */
export function handleAuthError(error: unknown, correlationId?: string): NextResponse<ApiError> {
  if (error instanceof AuthError) {
    return NextResponse.json<ApiError>(
      {
        ok: false,
        code: error.code,
        message: error.message,
        correlationId
      },
      { status: error.statusCode }
    )
  }
  
  // Unknown error
  return NextResponse.json<ApiError>(
    {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'حدث خطأ غير متوقع',
      correlationId
    },
    { status: 500 }
  )
}

/**
 * Standard API response envelope
 * 
 * We wrap all API responses in a consistent structure:
 * - Success: { ok: true, data: {...}, correlationId: "..." }
 * - Error: { ok: false, code: "...", message: "...", correlationId: "..." }
 * 
 * Why? Makes client-side error handling trivial. Just check `ok` and
 * you know if the request succeeded. No need to parse status codes or
 * guess at response shapes.
 * 
 * The correlationId ties together all logs for a single request, making
 * debugging way easier. When a user reports an error, they can give us
 * the correlationId and we can trace exactly what happened.
 */
export interface ApiResponse<T = any> {
  ok: true
  data: T
  correlationId?: string
}

/**
 * Create success response
 * 
 * Use this for all successful API responses. It ensures consistency
 * and makes it easy to add global response handling later (like
 * compression, caching headers, etc.)
 */
export function successResponse<T>(data: T, correlationId?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({
    ok: true,
    data,
    correlationId
  })
}

/**
 * Create error response
 * 
 * Use this for all error responses. The code should be a machine-readable
 * constant (like 'VALIDATION_ERROR'), and the message should be human-readable
 * Arabic text for the user.
 * 
 * Status codes follow HTTP standards:
 * - 400: Client error (bad input, validation failure)
 * - 401: Not authenticated
 * - 403: Not authorized (authenticated but lacking permissions)
 * - 404: Resource not found
 * - 409: Conflict (version mismatch, duplicate entry)
 * - 500: Server error (database failure, unexpected exception)
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  correlationId?: string
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      code,
      message,
      correlationId
    },
    { status: statusCode }
  )
}
