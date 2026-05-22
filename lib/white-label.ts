// White-Label Mode Detection and Configuration

export function isWhiteLabelMode(): boolean {
  return process.env.WHITE_LABEL_MODE === 'true'
}

export function getWhiteLabelConfig() {
  return {
    isWhiteLabel: isWhiteLabelMode(),
    customerName: process.env.WHITE_LABEL_CUSTOMER || '',
    logoUrl: process.env.WHITE_LABEL_LOGO || '',
    // White-Label systems CAN add Team Admins (that's the value!)
    canAddTeams: true,
    // White-Label systems CANNOT add Solo Orgs (different tier)
    canAddSoloOrgs: !isWhiteLabelMode()
  }
}
