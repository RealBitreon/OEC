/**
 * Error Messages Dictionary
 * 
 * Maps technical errors to user-friendly Arabic messages
 * with actionable guidance
 */

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'لا يوجد اتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى',
  TIMEOUT: 'استغرقت العملية وقتاً طويلاً. يرجى المحاولة مرة أخرى',
  
  // Server errors
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني',
  SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً. يرجى المحاولة بعد قليل',
  
  // Client errors
  NOT_FOUND: 'لم يتم العثور على البيانات المطلوبة',
  UNAUTHORIZED: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى',
  
  // Data errors
  DUPLICATE_ENTRY: 'هذه البيانات موجودة مسبقاً',
  INVALID_DATA: 'البيانات المدخلة غير صحيحة',
  
  // Generic
  UNKNOWN: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني',
  
  // Specific operations
  SUBMIT_FAILED: 'فشل إرسال البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
  LOAD_FAILED: 'فشل تحميل البيانات. يرجى تحديث الصفحة أو المحاولة لاحقاً',
  UPDATE_FAILED: 'فشل تحديث البيانات. يرجى المحاولة مرة أخرى',
  DELETE_FAILED: 'فشل حذف البيانات. يرجى المحاولة مرة أخرى',
} as const

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: any): string {
  // Check if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  // Check error type
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT
  }
  
  // Check HTTP status
  const status = error?.status || error?.response?.status
  if (status) {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 403:
        return ERROR_MESSAGES.FORBIDDEN
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 409:
        return ERROR_MESSAGES.DUPLICATE_ENTRY
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR
      case 503:
        return ERROR_MESSAGES.SERVICE_UNAVAILABLE
      case 500:
      case 502:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR
    }
  }
  
  // Check for specific error messages
  if (error?.message) {
    const msg = error.message.toLowerCase()
    
    if (msg.includes('network') || msg.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }
    
    if (msg.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT
    }
    
    if (msg.includes('unauthorized') || msg.includes('authentication')) {
      return ERROR_MESSAGES.UNAUTHORIZED
    }
    
    if (msg.includes('forbidden') || msg.includes('permission')) {
      return ERROR_MESSAGES.FORBIDDEN
    }
    
    if (msg.includes('not found')) {
      return ERROR_MESSAGES.NOT_FOUND
    }
    
    if (msg.includes('validation') || msg.includes('invalid')) {
      return ERROR_MESSAGES.VALIDATION_ERROR
    }
    
    // If error message is already in Arabic, return it
    if (/[\u0600-\u06FF]/.test(error.message)) {
      return error.message
    }
  }
  
  // Default fallback
  return ERROR_MESSAGES.UNKNOWN
}

/**
 * Get error message for specific operation
 */
export function getOperationErrorMessage(
  operation: 'submit' | 'load' | 'update' | 'delete',
  error: any
): string {
  // First try to get specific error message
  const specificMessage = getErrorMessage(error)
  
  // If it's a generic error, use operation-specific message
  if (specificMessage === ERROR_MESSAGES.UNKNOWN) {
    switch (operation) {
      case 'submit':
        return ERROR_MESSAGES.SUBMIT_FAILED
      case 'load':
        return ERROR_MESSAGES.LOAD_FAILED
      case 'update':
        return ERROR_MESSAGES.UPDATE_FAILED
      case 'delete':
        return ERROR_MESSAGES.DELETE_FAILED
    }
  }
  
  return specificMessage
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: any): boolean {
  const status = error?.status || error?.response?.status
  
  // These errors are recoverable (user can retry)
  const recoverableStatuses = [408, 429, 500, 502, 503, 504]
  if (status && recoverableStatuses.includes(status)) {
    return true
  }
  
  // Network errors are recoverable
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return true
  }
  
  // Timeout errors are recoverable
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return true
  }
  
  // These errors are NOT recoverable (user needs to fix something)
  const nonRecoverableStatuses = [400, 401, 403, 404, 409, 422]
  if (status && nonRecoverableStatuses.includes(status)) {
    return false
  }
  
  // Default: assume recoverable
  return true
}
