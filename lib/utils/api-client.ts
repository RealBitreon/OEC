/**
 * API client utility with custom error handling
 * Redirects to custom error pages instead of showing browser defaults
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Handle different status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Redirect to custom error pages based on status
      if (typeof window !== 'undefined') {
        switch (response.status) {
          case 401:
            // Don't auto-redirect - let the page handle it
            console.log('Unauthorized API call')
            break
          case 404:
            // Let the page handle 404s
            break
          case 500:
          case 502:
          case 503:
            window.location.href = '/500'
            break
        }
      }
      
      throw new ApiError(
        response.status,
        errorData.error || errorData.message || 'حدث خطأ في الطلب',
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof ApiError) {
      throw error
    }
    
    // Redirect to API error page for network failures
    if (typeof window !== 'undefined') {
      console.error('Network error:', error)
      window.location.href = '/api-error'
    }
    
    throw new ApiError(0, 'فشل الاتصال بالخادم')
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  return apiClient<T>(url, { method: 'GET' })
}

/**
 * Helper for POST requests
 */
export async function apiPost<T = any>(
  url: string,
  data?: any
): Promise<T> {
  return apiClient<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T = any>(
  url: string,
  data?: any
): Promise<T> {
  return apiClient<T>(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T = any>(url: string): Promise<T> {
  return apiClient<T>(url, { method: 'DELETE' })
}
