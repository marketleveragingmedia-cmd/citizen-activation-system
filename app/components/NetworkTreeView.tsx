'use client'

import { useState } from 'react'
import Image from 'next/image'
import { dashboardStyles, getRoleBadge } from '@/app/lib/dashboardStyles'
import ProfileViewModal from './ProfileViewModal'

interface NetworkTreeViewProps {
  network: any
  role: string
}

export default function NetworkTreeView({ network, role }: NetworkTreeViewProps) {
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

  function renderAdminNode(admin: any, level: number = 0) {
    const hasChildren = admin.teamsCreated && admin.teamsCreated.length > 0
    const isExpanded = expandedNodes.has(admin.id)
    const indent = level * 24

    return (
      <div key={admin.id} className="mb-2">
        <div 
          className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#1E8E5A] transition"
          style={{ marginLeft: `${indent}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(admin.id)}
              className="text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Admin Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedProfile(admin.id)}
                className="font-semibold text-[#1E8E5A] hover:underline"
              >
                {admin.firstName} {admin.lastName}
              </button>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(admin.role)}`}>
                {admin.role.replace('_', ' ')}
              </span>
              {admin.isFounder && (
                <span className="text-yellow-600 text-xs font-semibold inline-flex items-center gap-1">
                  <Image src="/founder-badge.png" alt="Founder" width={14} height={14} className="inline" /> Founder
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1">{admin.email}</div>
            {hasChildren && (
              <div className="text-xs text-gray-500 mt-1">
                {admin.teamsCreated.filter((t: any) => t.tierType === 'FullSystem').length} Team, {' '}
                {admin.teamsCreated.filter((t: any) => t.tierType === 'SoloOrg').length} Org
              </div>
            )}
          </div>

          {/* Status */}
          <div className="text-sm">
            {admin.status === 'Active' ? (
              <span className="text-green-600 font-semibold">✅ Active</span>
            ) : (
              <span className="text-gray-600">⏸️ Inactive</span>
            )}
          </div>
        </div>

        {/* Child Teams */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {admin.teamsCreated.map((team: any) => renderTeamNode(team, level + 1))}
          </div>
        )}
      </div>
    )
  }

  function renderTeamNode(team: any, level: number) {
    const teamAdmin = team.admins && team.admins.length > 0 ? team.admins[0] : null
    const hasPartners = team.strategicPartners && team.strategicPartners.length > 0
    const isExpanded = expandedNodes.has(team.id)
    const indent = level * 24

    return (
      <div key={team.id} className="mb-2">
        <div 
          className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#1E8E5A] transition"
          style={{ marginLeft: `${indent}px` }}
        >
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
                  className="font-semibold text-blue-700 hover:underline"
                >
                  {teamAdmin.firstName} {teamAdmin.lastName}
                </button>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(teamAdmin.role)}`}>
                  {teamAdmin.role.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{teamAdmin.email}</div>
              {hasPartners && (
                <div className="text-xs text-gray-500 mt-1">
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
          <div className="mt-2">
            {team.strategicPartners.map((partner: any) => renderPartnerNode(partner, level + 1))}
          </div>
        )}
      </div>
    )
  }

  function renderPartnerNode(partner: any, level: number) {
    const indent = level * 24

    return (
      <div 
        key={partner.id}
        className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:border-[#1E8E5A] transition mb-2"
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="w-6" /> {/* Spacer for alignment */}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProfile(partner.id)}
              className="font-semibold text-[#1E8E5A] hover:underline"
            >
              {partner.firstName} {partner.lastName}
            </button>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Strategic Partner
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">{partner.email}</div>
          <div className="text-xs text-gray-500 mt-1">
            {partner.activationLevel} • {partner.slotsUsed}/{partner.slotsAvailable} slots used
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
    )
  }

  return (
    <div>
      {/* Master Admin View */}
      {role === 'MASTER_ADMIN' && network.mainAdmins && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Platform Network Hierarchy</h3>
            <p className="text-sm text-gray-600 mt-1">
              Click names to view profiles • Click arrows to expand/collapse networks
            </p>
          </div>
          {network.mainAdmins.map((mainAdmin: any) => renderAdminNode(mainAdmin, 0))}
        </div>
      )}

      {/* Main Admin View */}
      {role === 'MAIN_ADMIN' && network.createdTeams && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Network</h3>
            <p className="text-sm text-gray-600 mt-1">
              {network.totalTeamAdmins} Team Admin{network.totalTeamAdmins !== 1 ? 's' : ''}, {' '}
              {network.totalOrgAdmins} Organization Admin{network.totalOrgAdmins !== 1 ? 's' : ''}, {' '}
              {network.totalPartners} Strategic Partner{network.totalPartners !== 1 ? 's' : ''}
            </p>
          </div>
          {network.createdTeams.map((team: any) => renderTeamNode(team, 0))}
        </div>
      )}

      {/* Team/Org Admin View */}
      {(role === 'TEAM_ADMIN' || role === 'ORG_ADMIN') && network.partners && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Strategic Partners</h3>
            <p className="text-sm text-gray-600 mt-1">
              {network.totalPartners} Strategic Partner{network.totalPartners !== 1 ? 's' : ''}
            </p>
          </div>
          {network.partners.map((partner: any) => renderPartnerNode(partner, 0))}
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
