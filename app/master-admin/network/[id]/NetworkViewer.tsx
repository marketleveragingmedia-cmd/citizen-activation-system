'use client'

import { useState } from 'react'
import { dashboardStyles, getRoleBadge } from '@/app/lib/dashboardStyles'
import ProfileViewModal from '@/app/components/ProfileViewModal'

interface NetworkViewerProps {
  admin: any
}

export default function NetworkViewer({ admin }: NetworkViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  function toggleNode(nodeId: string) {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  function renderTeamNode(team: any) {
    const teamAdmin = team.admins && team.admins.length > 0 ? team.admins[0] : null
    const hasPartners = team.strategicPartners && team.strategicPartners.length > 0
    const isExpanded = expandedNodes.has(team.id)

    return (
      <div key={team.id} className="mb-3">
        <div className="flex items-center gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-[#1E8E5A] transition">
          {/* Expand/Collapse Button */}
          {hasPartners && (
            <button
              onClick={() => toggleNode(team.id)}
              className="text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasPartners && <div className="w-6" />}

          {/* Team Admin Info */}
          {teamAdmin && (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProfile(teamAdmin.id)}
                  className="font-semibold text-blue-700 hover:underline text-base"
                >
                  {teamAdmin.firstName} {teamAdmin.lastName}
                </button>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(teamAdmin.role)}`}>
                  {teamAdmin.role.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{teamAdmin.email}</div>
              {teamAdmin.subdomain && (
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {teamAdmin.subdomain}.citizenactivation.com
                </div>
              )}
              {hasPartners && (
                <div className="text-sm text-gray-600 mt-2">
                  {team.strategicPartners.length} Strategic Partner{team.strategicPartners.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Status */}
          {teamAdmin && (
            <div className="text-sm">
              {teamAdmin.status === 'Active' ? (
                <span className="text-green-600 font-semibold">✅ Active</span>
              ) : (
                <span className="text-gray-600">⏸️ Inactive</span>
              )}
            </div>
          )}
        </div>

        {/* Strategic Partners */}
        {hasPartners && isExpanded && (
          <div className="mt-3 ml-8 space-y-2">
            {team.strategicPartners.map((partner: any) => (
              <div
                key={partner.id}
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:border-[#1E8E5A] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProfile(partner.id)}
                      className="font-semibold text-[#1E8E5A] hover:underline"
                    >
                      {partner.firstName} {partner.lastName}
                    </button>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Strategic Partner
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{partner.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {partner.activationLevel} • {partner.slotsUsed}/{partner.slotsAvailable} slots • {partner.assignedRequests?.length || 0} activations
                  </div>
                </div>
                <div className="text-sm">
                  {partner.status === 'Active' ? (
                    <span className="text-green-600 font-semibold">✅ Active</span>
                  ) : partner.status === 'Paused' ? (
                    <span className="text-yellow-600">⏸️ Paused</span>
                  ) : (
                    <span className="text-gray-600">Full</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const teamAdmins = admin.teamsCreated.filter((t: any) => t.tierType === 'FullSystem')
  const orgAdmins = admin.teamsCreated.filter((t: any) => t.tierType === 'SoloOrg')

  return (
    <div>
      {teamAdmins.length === 0 && orgAdmins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No network created yet</p>
          <p className="text-sm mt-2">This admin hasn't recruited any Team or Organization Admins</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team Admins Section */}
          {teamAdmins.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Team Admins ({teamAdmins.length})
              </h3>
              <div className="space-y-3">
                {teamAdmins.map((team: any) => renderTeamNode(team))}
              </div>
            </div>
          )}

          {/* Organization Admins Section */}
          {orgAdmins.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Organization Admins ({orgAdmins.length})
              </h3>
              <div className="space-y-3">
                {orgAdmins.map((team: any) => renderTeamNode(team))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileViewModal
          profileId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  )
}
