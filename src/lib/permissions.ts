export type UserRole = 'admin' | 'officer' | 'member'

export const USER_ROLES: UserRole[] = ['admin', 'officer', 'member']

export function canViewCompanies(role?: UserRole | null) {
  return Boolean(role)
}

export function canEditCompanies(role?: UserRole | null) {
  return role === 'admin' || role === 'officer'
}

export function canDeleteCompanies(role?: UserRole | null) {
  return role === 'admin'
}

export function canManageUsers(role?: UserRole | null) {
  return role === 'admin'
}
