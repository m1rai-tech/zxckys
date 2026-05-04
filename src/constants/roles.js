export const USER_ROLE = 'user'
export const MODERATOR_ROLE = 'moderator'
export const ADMIN_ROLE = 'admin'

export const ELEVATED_ROLES = [MODERATOR_ROLE, ADMIN_ROLE]

export function getPrimaryRoleLabel(role) {
  if (role === ADMIN_ROLE) return 'Admin'
  if (role === MODERATOR_ROLE) return 'Moderator'
  return ''
}

export function canModerateRole(role) {
  return ELEVATED_ROLES.includes(role)
}
