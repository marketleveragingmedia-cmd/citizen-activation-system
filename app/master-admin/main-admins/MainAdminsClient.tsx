'use client'

import { useState } from 'react'
import { btn } from '@/app/lib/buttonStyles'

interface MainAdminsClientProps {
  mainAdmins: any[]
}

export default function MainAdminsClient({ mainAdmins }: MainAdminsClientProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [adminList, setAdminList] = useState(mainAdmins)
  const [loading, setLoading] = useState(false)

  async function handleToggleStatus() {
    if (!selectedAdmin) return
    setLoading(true)
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
        alert(`Account ${data.newStatus === 'Active' ? 'reactivated' : 'paused'} successfully!`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!selectedAdmin) return
    if (!confirm(`Reset password for ${selectedAdmin.firstName} ${selectedAdmin.lastName}?\n\nThey will receive an email with a new temporary password.`)) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Password reset email sent successfully!')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleResendWelcome() {
    if (!selectedAdmin) return
    if (!confirm(`Resend welcome email to ${selectedAdmin.email}?`)) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Welcome email sent successfully!')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedAdmin) return
    if (!confirm(`⚠️ DELETE ${selectedAdmin.firstName} ${selectedAdmin.lastName}?\n\nThis will:\n- Delete the admin account\n- Preserve their network (Team Admins, Org Admins)\n- Keep Strategic Partners assigned\n\nThis action CANNOT be undone!`)) return
    
    const confirmText = prompt('Type DELETE to confirm:')
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id, confirmText })
      })
      const data = await res.json()
      if (res.ok) {
        setAdminList(prev => prev.filter(a => a.id !== selectedAdmin.id))
        setSelectedAdmin(null)
        alert('Admin account deleted successfully')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
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

      {/* Modal */}
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
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? 'Working...' : (selectedAdmin.status === 'Active' ? '⏸️ Pause' : '▶️ Reactivate')}
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? 'Working...' : '🔑 Reset Password'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={handleResendWelcome}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? 'Working...' : '📧 Resend Welcome'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                >
                  {loading ? 'Working...' : '🗑️ Delete'}
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
