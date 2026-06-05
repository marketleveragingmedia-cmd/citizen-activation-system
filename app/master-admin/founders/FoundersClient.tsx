'use client'
import { btn } from '@/app/lib/buttonStyles'
import EditAdminModal from '../components/EditAdminModal'

import { useState } from 'react'

interface FoundersClientProps {
  founders: any[]
}

export default function FoundersClient({ founders }: FoundersClientProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminList, setAdminList] = useState(founders)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [paymentFilter, setPaymentFilter] = useState<string>('All')
  const [showEdit, setShowEdit] = useState(false)

  function handleEditSave(updated: any) {
    setAdminList(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelectedAdmin(updated)
    setShowEdit(false)
  }

  // Filter founders
  const filteredFounders = adminList.filter(founder => {
    if (statusFilter !== 'All' && founder.status !== statusFilter) return false
    if (paymentFilter !== 'All' && founder.founderPaymentMethod !== paymentFilter) return false
    return true
  })

  return (
    <>
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50 flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Payment Method:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="All">All Payment Methods</option>
            <option value="Stripe">Stripe</option>
            <option value="MOSCA">MOSCA Wallet</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredFounders.length} of {adminList.length} founders
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founded</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredFounders.map((founder) => {
            const teamAdmins = founder.teamsCreated.filter((t: any) => t.tierType === 'FullSystem').length
            const orgAdmins = founder.teamsCreated.filter((t: any) => t.tierType === 'SoloOrg').length

            return (
              <tr key={founder.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {founder.status === 'Active' ? (
                    <span className="text-green-600 font-semibold">✅ Active</span>
                  ) : (
                    <span className="text-gray-600 font-semibold">⏸️ Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(founder)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                  >
                    {founder.firstName} {founder.lastName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{founder.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {founder.subdomain || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {founder.founderPaymentMethod || '-'}
                  </div>
                  <div className="text-xs text-gray-500">$997</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {teamAdmins} Team, {orgAdmins} Org
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {founder.founderDate ? new Date(founder.founderDate).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(founder)}
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

      {filteredFounders.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <p className="text-lg">No founders match the selected filters</p>
        </div>
      )}

      {/* View Details Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">⭐ Founder Account Details</h2>
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
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Founder
                    </span>
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
                    <div className="text-gray-900 font-semibold">$997 (One-Time)</div>
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
                    <div className="text-sm font-medium text-gray-500">Founded</div>
                    <div className="text-gray-900">
                      {selectedAdmin.founderDate ? new Date(selectedAdmin.founderDate).toLocaleString() : 'N/A'}
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
                  onClick={() => setShowEdit(true)}
                  className={btn.primary}
                >
                  ✏️ Edit Account
                </button>
                <button
                  onClick={() => {
                    console.log('Pause/Reactivate functionality coming next')
                  }}
                  className={selectedAdmin.status === 'Active' ? btn.warning : btn.success}
                  disabled
                >
                  {selectedAdmin.status === 'Active' ? '⏸️ Pause Account' : '▶️ Reactivate'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {
                    console.log('Reset Password functionality coming next')
                  }}
                  className={btn.purple}
                  disabled
                >
                  🔑 Reset Password
                </button>
                <button
                  onClick={() => {
                    console.log('Resend Welcome Email functionality coming next')
                  }}
                  className={btn.indigo}
                  disabled
                >
                  📧 Resend Welcome
                </button>
              </div>
              <div className="mb-3">
                <button
                  onClick={() => {
                    console.log('Delete Account functionality coming next')
                  }}
                  className={`w-full ${btn.danger}`}
                  disabled
                >
                  🗑️ Delete Account
                </button>
              </div>
              <button
                onClick={() => setSelectedAdmin(null)}
                className={`w-full ${btn.secondary}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEdit && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onSave={handleEditSave}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
