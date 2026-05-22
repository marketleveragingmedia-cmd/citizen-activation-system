// Helper function to display full names throughout the system

export function getFullName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return ''
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export function getRequesterName(request: any): string {
  return getFullName(request.requesterFirstName, request.requesterLastName)
}

export function getPartnerName(partner: any): string {
  return getFullName(partner?.firstName, partner?.lastName)
}

export function getAdminName(admin: any): string {
  return getFullName(admin?.firstName, admin?.lastName)
}
