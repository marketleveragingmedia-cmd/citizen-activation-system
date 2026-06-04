'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MainAdminsClientProps {
  mainAdmins: any[]
}

export default function MainAdminsClient({ mainAdmins }: MainAdminsClientProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)

  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mainAdmins.map((mainAdmin) => {
            const teamAdmins = mainAdmin.teamsCreated.filter((t: any) => t.tierType === 'FullSystem').length
            const orgAdmins = mainAdmin.teamsCreated.filter((t: any) => t.tierType === 'SoloOrg').length

            return (
              <tr key={mainAdmin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mainAdmin.status === 'Active' ? (
                    <span className="text-green-600 font-semibold">✅ Active</span>
                  ) : (
                    <span className="text-gray-600 font-semibold">⏸️ Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(mainAdmin)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                  >
                    {mainAdmin.firstName} {mainAdmin.lastName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{mainAdmin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {mainAdmin.subdomain || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mainAdmin.isFounder ? (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Founder
                    </span>
                  ) : (
                    <span className="text-gray-600 text-sm">Main Admin</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {mainAdmin.founderPaymentMethod || '-'}
                  </div>
                  {mainAdmin.founderPaymentMethod && (
                    <div className="text-xs text-gray-500">
                      {mainAdmin.isFounder ? '$997' : '$1,497'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {teamAdmins} Team, {orgAdmins} Org
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(mainAdmin.createdDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(mainAdmin)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* View Details Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Main Admin Account Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="text-lg">
                    {selectedAdmin.isFounder ? (
                      <span className="text-yellow-600 font-bold">⭐ Founder</span>
                    ) : (
                      <span className="text-gray-700">Main Admin</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="text-gray-900">{selectedAdmin.email}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Phone</div>
                <div className="text-gray-900">{selectedAdmin.phone || 'N/A'}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Subdomain</div>
                <div className="text-gray-900">
                  {selectedAdmin.subdomain ? (
                    <a 
                      href={`https://${selectedAdmin.subdomain}.citizenactivation.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedAdmin.subdomain}.citizenactivation.com
                    </a>
                  ) : 'N/A'}
                </div>
              </div>

              {selectedAdmin.moscaCode && (
                <div>
                  <div className="text-sm font-medium text-gray-500">MOSCA Strategic Partner Code</div>
                  <div className="text-gray-900 font-mono">{selectedAdmin.moscaCode}</div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Payment Information</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Method</div>
                    <div className="text-gray-900">{selectedAdmin.founderPaymentMethod || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-gray-900">
                      {selectedAdmin.isFounder ? '$997 (Founder)' : '$1,497 Y1'}
                    </div>
                  </div>
                </div>
                {selectedAdmin.founderPaymentDetails && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Payment Details</div>
                    <div className="text-gray-900 text-sm">{selectedAdmin.founderPaymentDetails}</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Network</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Team Admins</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAdmin.teamsCreated.filter((t: any) => t.tierType === 'FullSystem').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Org Admins</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAdmin.teamsCreated.filter((t: any) => t.tierType === 'SoloOrg').length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="text-gray-900">{selectedAdmin.status}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Created</div>
                    <div className="text-gray-900">
                      {new Date(selectedAdmin.createdDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {selectedAdmin.referralCode && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-gray-500">Strategic Partner Referral Code</div>
                  <div className="text-lg text-gray-900 font-mono font-bold">{selectedAdmin.referralCode}</div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {
                    // TODO: Open edit modal
                    alert('Edit functionality coming next')
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  ✏️ Edit Account
                </button>
                <button
                  onClick={() => {
                    if (confirm(`${selectedAdmin.status === 'Active' ? 'Pause' : 'Reactivate'} ${selectedAdmin.firstName} ${selectedAdmin.lastName}?`)) {
                      // TODO: API call to toggle status
                      alert('Pause/Reactivate functionality coming next')
                    }
                  }}
                  className={`${selectedAdmin.status === 'Active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-2 px-4 rounded-lg text-sm`}
                >
                  {selectedAdmin.status === 'Active' ? '⏸️ Pause Account' : '▶️ Reactivate'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {
                    if (confirm(`Reset password for ${selectedAdmin.firstName} ${selectedAdmin.lastName}?\n\nThey will receive an email with a new temporary password.`)) {
                      // TODO: API call to reset password
                      alert('Reset Password functionality coming next')
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  🔑 Reset Password
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Resend welcome email to ${selectedAdmin.email}?`)) {
                      // TODO: API call to resend welcome email
                      alert('Resend Welcome Email functionality coming next')
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  📧 Resend Welcome
                </button>
              </div>
              <div className="mb-3">
                <button
                  onClick={() => {
                    if (confirm(`⚠️ DELETE ${selectedAdmin.firstName} ${selectedAdmin.lastName}?\n\nThis will:\n- Delete the admin account\n- Preserve their network (Team Admins, Org Admins)\n- Keep Strategic Partners assigned\n\nThis action CANNOT be undone!`)) {
                      if (confirm('Are you ABSOLUTELY SURE? Type DELETE to confirm.')) {
                        // TODO: API call to delete account
                        alert('Delete Account functionality coming next')
                      }
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                  🗑️ Delete Account
                </button>
              </div>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
