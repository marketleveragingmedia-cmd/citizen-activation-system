'use client'

import MainAdminDashboard from './MainAdminDashboard'

interface Props {
  stats: any
  recentRequests: any[]
  userName: string
  isWhiteLabel: boolean
}

export default function MainAdminDashboardClient({ stats, recentRequests, userName, isWhiteLabel }: Props) {
  return <MainAdminDashboard stats={stats} recentRequests={recentRequests} userName={userName} isWhiteLabel={isWhiteLabel} />
}
