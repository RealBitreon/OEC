import { UserRole, DashboardSection } from './types'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  CEO: 2,
  LRC_MANAGER: 1,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canAccessSection(userRole: UserRole, section: DashboardSection): boolean {
  const sectionPermissions: Record<DashboardSection, UserRole> = {
    'overview': 'LRC_MANAGER',
    'current-competition': 'LRC_MANAGER',
    'competitions': 'LRC_MANAGER',
    'questions': 'LRC_MANAGER',
    'submissions': 'LRC_MANAGER',
    'tickets': 'LRC_MANAGER',
    'wheel': 'LRC_MANAGER',
    'archives': 'LRC_MANAGER',
    'settings': 'LRC_MANAGER',
    'users': 'CEO',
    'audit': 'CEO',
  }

  return hasRole(userRole, sectionPermissions[section])
}

export function getAccessibleSections(userRole: UserRole): DashboardSection[] {
  const allSections: DashboardSection[] = [
    'overview',
    'current-competition',
    'competitions',
    'questions',
    'submissions',
    'tickets',
    'wheel',
    'archives',
    'settings',
    'users',
    'audit',
  ]

  return allSections.filter(section => canAccessSection(userRole, section))
}

export function canCreateCompetition(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canEditCompetition(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canDeleteCompetition(role: UserRole): boolean {
  return hasRole(role, 'CEO')
}

export function canCreateQuestion(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canEditQuestion(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canDeleteQuestion(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canReviewSubmission(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canManageTickets(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canRunWheel(role: UserRole): boolean {
  return hasRole(role, 'LRC_MANAGER')
}

export function canManageUsers(role: UserRole): boolean {
  return hasRole(role, 'CEO')
}

export function canViewAuditLog(role: UserRole): boolean {
  return hasRole(role, 'CEO')
}
