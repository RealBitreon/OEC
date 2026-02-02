/**
 * Custom error handler utilities for API routes
 * Provides consistent Arabic error messages and proper HTTP status codes
 */

export interface ApiError {
  error: string
  message?: string
  correlationId?: string
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public correlationId?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorMessages = {
  // 400 Bad Request
  MISSING_FIELDS: 'بيانات غير مكتملة',
  INVALID_DATA: 'البيانات المدخلة غير صحيحة',
  INVALID_FORMAT: 'تنسيق البيانات غير صحيح',
  
  // 401 Unauthorized
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  INVALID_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  
  // 403 Forbidden
  FORBIDDEN: 'ليس لديك صلاحية للوصول',
  MAX_ATTEMPTS: 'تم الوصول للحد الأقصى من المحاولات',
  INVALID_CODE: 'الرمز غير صحيح',
  
  // 404 Not Found
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  COMPETITION_NOT_FOUND: 'المسابقة غير موجودة',
  QUESTION_NOT_FOUND: 'السؤال غير موجود',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  
  // 409 Conflict
  ALREADY_EXISTS: 'العنصر موجود بالفعل',
  DUPLICATE_ENTRY: 'البيانات مكررة',
  
  // 500 Internal Server Error
  INTERNAL_ERROR: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
  DATABASE_ERROR: 'خطأ في قاعدة البيانات',
  PROCESSING_ERROR: 'حدث خطأ أثناء معالجة الطلب',
} as const

export function createErrorResponse(
  statusCode: number,
  message: string,
  correlationId?: string
): Response {
  const error: ApiError = {
    error: message,
    ...(correlationId && { correlationId })
  }
  
  return Response.json(error, { status: statusCode })
}

export function handleApiError(error: unknown, correlationId?: string): Response {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return createErrorResponse(error.statusCode, error.message, error.correlationId || correlationId)
  }
  
  // Default to 500 for unknown errors
  return createErrorResponse(500, ErrorMessages.INTERNAL_ERROR, correlationId)
}
