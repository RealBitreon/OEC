import { User, UserRole } from '../core/types'

// Re-export for backward compatibility
export type UserProfile = User

/**
 * Check if user has required role (client-side utility)
 * Hierarchy: CEO > LRC_MANAGER
 * Note: This is for UI filtering only, NOT for security
 */
export const hasRole = (userRole: UserProfile['role'], requiredRole: UserProfile['role']): boolean => {
  const hierarchy: Record<UserRole, number> = {
    'CEO': 3,
    'LRC_MANAGER': 2,
  }
  
  return hierarchy[userRole] >= hierarchy[requiredRole]
}
