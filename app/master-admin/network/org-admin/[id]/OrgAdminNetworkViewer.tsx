'use client'

import { useState } from 'react'
import ProfileViewModal from '@/app/components/ProfileViewModal'

interface OrgAdminNetworkViewerProps {
  partners: any[]
  organizationName?: string | null
}

export default function OrgAdminNetworkViewer({ partners, organizationName }: OrgAdminNetworkViewerProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  if (partners.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No Strategic Partners yet</p>
        <p className="text-sm mt-2">
          {organizationName ? `${organizationName} hasn't` : 'This Organization Admin hasn\'t'} added any Strategic Partners
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {organizationName ? `${organizationName} - ` : ''}Strategic Partners ({partners.length})
      </h3>

      <div className="space-y-3">
        {partners.map((partner: any) => (
          <div
            key={partner.id}
            className="flex items-center gap-2 p-4 bg-teal-50 border-2 border-teal-200 rounded-lg hover:border-[#1E8E5A] transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProfile(partner.id)}
                  className="font-semibold text-[#1E8E5A] hover:underline text-base"
                >
                  {partner.firstName} {partner.lastName}
                </button>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
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

      {selectedProfile && (
        <ProfileViewModal
          profileId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  )
}
