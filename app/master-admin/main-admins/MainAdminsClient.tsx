'use client'

import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import SuccessToast from '../components/SuccessToast'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'
import EditAdminModal from '../components/EditAdminModal'
import ProfileViewModal from '@/app/components/ProfileViewModal'
import { useRouter } from 'next/navigation'

interface MainAdminsClientProps {
  mainAdmins: any[]
}

export default function MainAdminsClient({ mainAdmins }: MainAdminsClientProps) {
  const router = useRouter()
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminList, setAdminList] = useState(mainAdmins)
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showResendConfirm, setShowResendConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [viewProfile, setViewProfile] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  function handleEditSave(updated: any) {
    setAdminList(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelectedAdmin(updated)
    setShowEdit(false)
    setSuccessMessage('Account updated successfully!')
  }

  async function handleToggleStatus() {
    if (!selectedAdmin) return
    setShowToggleConfirm(false)
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id })
      })
      const data = await res.json()
      
      if (res.ok) {
        const updated = { ...selectedAdmin, status: data.newStatus }
        setAdminList(prev => prev.map(a => a.id === updated.id ? updated : a))
        setSelectedAdmin(updated)
        setSuccessMessage(`Account ${data.newStatus === 'Active' ? 'reactivated' : 'paused'} successfully!`)
      } else {
        setError(data.error || 'Failed to toggle status')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!selectedAdmin) return
    setShowResetConfirm(false)
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccessMessage('Password reset email sent successfully!')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResendWelcome() {
    if (!selectedAdmin) return
    setShowResendConfirm(false)
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccessMessage('Welcome email sent successfully!')
      } else {
        setError(data.error || 'Failed to send welcome email')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedAdmin) return
    setShowDeleteConfirm(false)
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id, confirmText: 'DELETE' })
      })
      const data = await res.json()
      
      if (res.ok) {
        setAdminList(prev => prev.filter(a => a.id !== selectedAdmin.id))
        setSuccessMessage('Admin account deleted successfully')
        setSelectedAdmin(null)
      } else {
        setError(data.error || 'Failed to delete account')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {adminList.map((mainAdmin) => {
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
                  <div className="text-sm text-gray-900">{mainAdmin.subdomain || '-'}</div>
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
                  <div className="text-sm text-gray-600">{teamAdmins} Team, {orgAdmins} Org</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(mainAdmin.createdDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewProfile(mainAdmin.id)}
                      className="text-[#1E8E5A] hover:text-[#177349] font-medium text-sm"
                    >
                      View Profile
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => router.push(`/master-admin/network/${mainAdmin.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Network
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setSelectedAdmin(mainAdmin)}
                      className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Detail Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Main Admin Account</h2>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="text-gray-900">{selectedAdmin.status}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="text-gray-900">{selectedAdmin.email}</div>
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
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setShowToggleConfirm(true)}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  {selectedAdmin.status === 'Active' ? '⏸️ Pause' : '▶️ Reactivate'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  🔑 Reset Password
                </button>
                <button
                  onClick={() => setShowResendConfirm(true)}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  📧 Resend Welcome
                </button>
              </div>
              <div className="mb-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
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

      {/* Edit Modal */}
      {showEdit && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onSave={handleEditSave}
          onCancel={() => setShowEdit(false)}
        />
      )}

      {/* Confirm Dialogs */}
      {showToggleConfirm && selectedAdmin && (
        <ConfirmDialog
          title={selectedAdmin.status === 'Active' ? 'Pause Account' : 'Reactivate Account'}
          message={`${selectedAdmin.status === 'Active' ? 'Pause' : 'Reactivate'} ${selectedAdmin.firstName} ${selectedAdmin.lastName}?`}
          confirmText={selectedAdmin.status === 'Active' ? 'Pause' : 'Reactivate'}
          confirmColor={selectedAdmin.status === 'Active' ? 'yellow' : 'green'}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowToggleConfirm(false)}
        />
      )}

      {showResetConfirm && selectedAdmin && (
        <ConfirmDialog
          title="Reset Password"
          message={`Reset password for ${selectedAdmin.firstName} ${selectedAdmin.lastName}?\n\nThey will receive an email with a new temporary password.`}
          confirmText="Reset Password"
          confirmColor="purple"
          onConfirm={handleResetPassword}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {showResendConfirm && selectedAdmin && (
        <ConfirmDialog
          title="Resend Welcome Email"
          message={`Resend welcome email to ${selectedAdmin.email}?`}
          confirmText="Send Email"
          confirmColor="blue"
          onConfirm={handleResendWelcome}
          onCancel={() => setShowResendConfirm(false)}
        />
      )}

      {showDeleteConfirm && selectedAdmin && (
        <DeleteConfirmDialog
          adminName={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Success Toast */}
      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Profile View Modal */}
      {viewProfile && (
        <ProfileViewModal
          profileId={viewProfile}
          onClose={() => setViewProfile(null)}
        />
      )}
    </>
  )
}
