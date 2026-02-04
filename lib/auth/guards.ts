/**
 * Centralized Auth Guards for API Routes
 * Use these in all API routes to enforce authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export interface AuthContext {
  user: {
    id: string
    authId: string
    username: string
    email?: string
    role: 'CEO' | 'LRC_MANAGER' | 'student'
  }
}

export interface ApiError {
  ok: false
  code: string
  message: string
  hint?: string
  correlationId?: string
}

/**
 * Require authentication - returns user or throws
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    throw new AuthError('UNAUTHORIZED', 'يجب تسجيل الدخول أولاً')
  }
  
  // Get user profile
  const serviceClient = createServiceClient()
  const { data: profile, error: profileError } = await serviceClient
    .from('users')
    .select('id, username, email, role')
    .eq('auth_id', authUser.id)
    .single()
  
  if (profileError || !profile) {
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
 */
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
    
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
 */
export interface ApiResponse<T = any> {
  ok: true
  data: T
  correlationId?: string
}

/**
 * Create success response
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
