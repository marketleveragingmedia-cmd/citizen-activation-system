'use client'

import { useState } from 'react'
import { dashboardStyles, getRoleBadge } from '@/app/lib/dashboardStyles'
import ProfileViewModal from '@/app/components/ProfileViewModal'

interface MyNetworkClientProps {
  admin: any
  network: any
  createdBy: any
}

export default function MyNetworkClient({ admin, network, createdBy }: MyNetworkClientProps) {
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

  // Main Admin View
  if (admin.role === 'MAIN_ADMIN') {
    return (
      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={dashboardStyles.card.stat}>
            <div className={dashboardStyles.statCard.label}>Team Admins</div>
            <div className={dashboardStyles.statCard.value}>{network.totalTeamAdmins}</div>
          </div>
          <div className={dashboardStyles.card.stat}>
            <div className={dashboardStyles.statCard.label}>Organization Admins</div>
            <div className={dashboardStyles.statCard.value}>{network.totalOrgAdmins}</div>
          </div>
          <div className={dashboardStyles.card.stat}>
            <div className={dashboardStyles.statCard.label}>Strategic Partners</div>
            <div className={dashboardStyles.statCard.valueGreen}>{network.totalPartners}</div>
          </div>
          <div className={dashboardStyles.card.stat}>
            <div className={dashboardStyles.statCard.label}>Total Activations</div>
            <div className={dashboardStyles.statCard.valueGreen}>{network.totalActivations}</div>
          </div>
        </div>

        {/* Network Tree */}
        <div className={dashboardStyles.card.base + ' p-6'}>
          {network.createdTeams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Your network is empty</p>
              <p className="text-sm mt-2">Add Team Admins or Organization Admins to grow your network</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Team Admins */}
              {network.teamAdmins.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Team Admins ({network.teamAdmins.length})
                  </h3>
                  <div className="space-y-3">
                    {network.teamAdmins.map((team: any) => {
                      const teamAdmin = team.admins[0]
                      const hasPartners = team.strategicPartners.length > 0
                      const isExpanded = expandedNodes.has(team.id)

                      return (
                        <div key={team.id}>
                          <div className="flex items-center gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-[#1E8E5A] transition">
                            {hasPartners && (
                              <button
                                onClick={() => toggleNode(team.id)}
                                className="text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            )}
                            {!hasPartners && <div className="w-6" />}

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedProfile(teamAdmin.id)}
                                  className="font-semibold text-blue-700 hover:underline text-base"
                                >
                                  {teamAdmin.firstName} {teamAdmin.lastName}
                                </button>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge('TEAM_ADMIN')}`}>
                                  Team Admin
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

                            <div className="text-sm">
                              {teamAdmin.status === 'Active' ? (
                                <span className="text-green-600 font-semibold">✅ Active</span>
                              ) : (
                                <span className="text-gray-600">⏸️ Inactive</span>
                              )}
                            </div>
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
                                      <span className="text-green-600 font-semibold">✅</span>
                                    ) : partner.status === 'Paused' ? (
                                      <span className="text-yellow-600">⏸️</span>
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
                    })}
                  </div>
                </div>
              )}

              {/* Organization Admins */}
              {network.orgAdmins.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Organization Admins ({network.orgAdmins.length})
                  </h3>
                  <div className="space-y-3">
                    {network.orgAdmins.map((team: any) => {
                      const orgAdmin = team.admins[0]
                      const hasPartners = team.strategicPartners.length > 0
                      const isExpanded = expandedNodes.has(team.id)

                      return (
                        <div key={team.id}>
                          <div className="flex items-center gap-2 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg hover:border-[#1E8E5A] transition">
                            {hasPartners && (
                              <button
                                onClick={() => toggleNode(team.id)}
                                className="text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            )}
                            {!hasPartners && <div className="w-6" />}

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedProfile(orgAdmin.id)}
                                  className="font-semibold text-teal-700 hover:underline text-base"
                                >
                                  {orgAdmin.firstName} {orgAdmin.lastName}
                                </button>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge('ORG_ADMIN')}`}>
                                  Organization Admin
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{orgAdmin.email}</div>
                              {team.organizationName && (
                                <div className="text-sm text-teal-700 font-medium mt-1">
                                  {team.organizationName}
                                </div>
                              )}
                              {orgAdmin.subdomain && (
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                  {orgAdmin.subdomain}.citizenactivation.com
                                </div>
                              )}
                              {hasPartners && (
                                <div className="text-sm text-gray-600 mt-2">
                                  {team.strategicPartners.length} Strategic Partner{team.strategicPartners.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>

                            <div className="text-sm">
                              {orgAdmin.status === 'Active' ? (
                                <span className="text-green-600 font-semibold">✅ Active</span>
                              ) : (
                                <span className="text-gray-600">⏸️ Inactive</span>
                              )}
                            </div>
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
                                      <span className="text-green-600 font-semibold">✅</span>
                                    ) : partner.status === 'Paused' ? (
                                      <span className="text-yellow-600">⏸️</span>
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
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedProfile && (
          <ProfileViewModal
            profileId={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    )
  }

  // Team Admin / Org Admin View
  return (
    <div>
      {/* Connected By Section */}
      {createdBy && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-blue-900 mb-2">
            You were connected to the Citizen Activation System by:
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProfile(createdBy.id)}
              className="font-semibold text-blue-700 hover:underline text-lg"
            >
              {createdBy.firstName} {createdBy.lastName}
            </button>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(createdBy.role)}`}>
              {createdBy.role.replace('_', ' ')}
            </span>
          </div>
          <div className="text-blue-700 text-sm mt-1">{createdBy.email}</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={dashboardStyles.card.stat}>
          <div className={dashboardStyles.statCard.label}>Team Admins Referred</div>
          <div className={dashboardStyles.statCard.value}>{network.totalTeamAdmins || 0}</div>
        </div>
        <div className={dashboardStyles.card.stat}>
          <div className={dashboardStyles.statCard.label}>Org Admins Referred</div>
          <div className={dashboardStyles.statCard.value}>{network.totalOrgAdmins || 0}</div>
        </div>
        <div className={dashboardStyles.card.stat}>
          <div className={dashboardStyles.statCard.label}>Strategic Partners</div>
          <div className={dashboardStyles.statCard.valueGreen}>{network.totalPartners}</div>
        </div>
        <div className={dashboardStyles.card.stat}>
          <div className={dashboardStyles.statCard.label}>Total Activations</div>
          <div className={dashboardStyles.statCard.valueGreen}>{network.totalActivations}</div>
        </div>
      </div>

      {/* Team Admins Referred (Flat List for Payment Tracking) */}
      {network.teamAdmins && network.teamAdmins.length > 0 && (
        <div className={dashboardStyles.card.base + ' p-6 mb-6'}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Team Admins You Referred ({network.totalTeamAdmins})</h3>
          <p className="text-sm text-gray-600 mb-4">Payment tracking - you receive payments when they make sales</p>
          <div className="space-y-3">
            {network.teamAdmins.map((team: any) => {
              const teamAdmin = team.admins[0]
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProfile(teamAdmin.id)}
                        className="font-semibold text-blue-700 hover:underline text-base"
                      >
                        {teamAdmin.firstName} {teamAdmin.lastName}
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge('TEAM_ADMIN')}`}>
                        Team Admin
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{teamAdmin.email}</div>
                    {teamAdmin.subdomain && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {teamAdmin.subdomain}.citizenactivation.com
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    {teamAdmin.status === 'Active' ? (
                      <span className="text-green-600 font-semibold">✅ Active</span>
                    ) : (
                      <span className="text-gray-600">⏸️ Inactive</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Organization Admins Referred (Flat List for Payment Tracking) */}
      {network.orgAdmins && network.orgAdmins.length > 0 && (
        <div className={dashboardStyles.card.base + ' p-6 mb-6'}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Admins You Referred ({network.totalOrgAdmins})</h3>
          <p className="text-sm text-gray-600 mb-4">Payment tracking - you receive payments when they make sales</p>
          <div className="space-y-3">
            {network.orgAdmins.map((team: any) => {
              const orgAdmin = team.admins[0]
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProfile(orgAdmin.id)}
                        className="font-semibold text-teal-700 hover:underline text-base"
                      >
                        {orgAdmin.firstName} {orgAdmin.lastName}
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge('ORG_ADMIN')}`}>
                        Organization Admin
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{orgAdmin.email}</div>
                    {team.organizationName && (
                      <div className="text-sm text-teal-700 font-medium mt-1">
                        {team.organizationName}
                      </div>
                    )}
                    {orgAdmin.subdomain && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {orgAdmin.subdomain}.citizenactivation.com
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    {orgAdmin.status === 'Active' ? (
                      <span className="text-green-600 font-semibold">✅ Active</span>
                    ) : (
                      <span className="text-gray-600">⏸️ Inactive</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Strategic Partners List */}
      <div className={dashboardStyles.card.base + ' p-6'}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Strategic Partners ({network.totalPartners})</h3>

        {network.partners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No Strategic Partners yet</p>
            <p className="text-sm mt-2">Add Strategic Partners to start growing your network</p>
          </div>
        ) : (
          <div className="space-y-3">
            {network.partners.map((partner: any) => (
              <div
                key={partner.id}
                className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:border-[#1E8E5A] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProfile(partner.id)}
                      className="font-semibold text-[#1E8E5A] hover:underline text-base"
                    >
                      {partner.firstName} {partner.lastName}
                    </button>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Strategic Partner
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{partner.email}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {partner.activationLevel} • {partner.slotsUsed}/{partner.slotsAvailable} slots used • {partner.assignedRequests?.length || 0} activations
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

      {selectedProfile && (
        <ProfileViewModal
          profileId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  )
}
