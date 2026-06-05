'use client'
import { btn } from '@/app/lib/buttonStyles'
import EditAdminModal from '../components/EditAdminModal'

import { useState } from 'react'

interface TeamAdminsClientProps {
  teamAdmins: any[]
}

export default function TeamAdminsClient({ teamAdmins }: TeamAdminsClientProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminList, setAdminList] = useState(teamAdmins)
  const [showEdit, setShowEdit] = useState(false)

  function handleEditSave(updated: any) {
    setAdminList(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelectedAdmin(updated)
    setShowEdit(false)
  }

  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Admin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {adminList.map((teamAdmin) => {
            const parentAdmin = teamAdmin.team?.createdBy

            return (
              <tr key={teamAdmin.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {teamAdmin.status === 'Active' ? (
                    <span className="text-green-600 font-semibold">✅ Active</span>
                  ) : (
                    <span className="text-gray-600 font-semibold">⏸️ Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(teamAdmin)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                  >
                    {teamAdmin.firstName} {teamAdmin.lastName}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{teamAdmin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{teamAdmin.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parentAdmin ? (
                    <div className="text-sm text-gray-900">
                      {parentAdmin.firstName} {parentAdmin.lastName}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(teamAdmin.createdDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAdmin(teamAdmin)}
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
              <h2 className="text-xl font-bold text-gray-900">Team Admin Account Details</h2>
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
                  <div className="text-lg text-gray-700">Team Admin</div>
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

              {selectedAdmin.team?.createdBy && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Parent Admin (Created By)</div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">
                      {selectedAdmin.team.createdBy.firstName} {selectedAdmin.team.createdBy.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{selectedAdmin.team.createdBy.email}</div>
                  </div>
                </div>
              )}

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
