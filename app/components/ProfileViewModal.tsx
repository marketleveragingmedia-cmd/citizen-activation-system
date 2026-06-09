'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { dashboardStyles, getRoleBadge, getStatusBadge } from '@/app/lib/dashboardStyles'

interface ProfileViewModalProps {
  profileId: string
  onClose: () => void
}

export default function ProfileViewModal({ profileId, onClose }: ProfileViewModalProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  async function fetchProfile() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/profile/${profileId}`)
      const data = await res.json()

      if (res.ok) {
        setProfile(data)
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={dashboardStyles.modal.overlay}>
        <div className={dashboardStyles.modal.container + ' max-w-3xl'}>
          <div className="p-12 text-center">
            <div className="text-gray-600">Loading profile...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={dashboardStyles.modal.overlay}>
        <div className={dashboardStyles.modal.container + ' max-w-3xl'}>
          <div className="p-12 text-center">
            <div className="text-red-600 mb-4">{error || 'Profile not found'}</div>
            <button onClick={onClose} className={dashboardStyles.button.secondary}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = profile.type === 'admin'
  const data = profile.profile

  return (
    <div className={dashboardStyles.modal.overlay} onClick={onClose}>
      <div className={dashboardStyles.modal.container + ' max-w-3xl'} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={dashboardStyles.modal.header}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={dashboardStyles.modal.title}>
                {data.firstName} {data.lastName}
              </h2>
              <div className="flex gap-2 mt-2">
                {isAdmin && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(data.role)}`}>
                    {data.role.replace('_', ' ')}
                  </span>
                )}
                {!isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Strategic Partner
                  </span>
                )}
                <span className={getStatusBadge(data.status)}>
                  {data.status}
                </span>
                {data.isFounder && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Image src="/founder-badge.png" alt="Founder" width={14} height={14} className="inline mr-1" /> Founder
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={dashboardStyles.modal.body}>
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className={dashboardStyles.form.label}>Email</div>
              <div className="text-gray-900">{data.email}</div>
            </div>
            {data.phone && (
              <div>
                <div className={dashboardStyles.form.label}>Phone</div>
                <div className="text-gray-900">{data.phone}</div>
              </div>
            )}
          </div>

          {/* Subdomain & Referral Code */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {data.subdomain && (
              <div>
                <div className={dashboardStyles.form.label}>Subdomain</div>
                <div className="text-gray-900 font-mono">{data.subdomain}.citizenactivation.com</div>
              </div>
            )}
            {data.referralCode && (
              <div>
                <div className={dashboardStyles.form.label}>Referral Code</div>
                <div className="text-gray-900 font-mono font-bold">{data.referralCode}</div>
              </div>
            )}
          </div>

          {/* Connected By (Referral Chain) */}
          {data.createdBy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm font-medium text-blue-900 mb-2">Connected to Citizen Activation System by:</div>
              <div className="text-blue-800 font-semibold">
                {data.createdBy.firstName} {data.createdBy.lastName}
              </div>
              <div className="text-blue-700 text-sm">{data.createdBy.email}</div>
              {data.createdBy.role && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(data.createdBy.role)}`}>
                    {data.createdBy.role.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Network Stats (Admin only) */}
          {isAdmin && data.networkSize && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">Network Summary</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600">Team Admins</div>
                  <div className="text-xl font-bold text-gray-900">{data.networkSize.teamAdmins}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Org Admins</div>
                  <div className="text-xl font-bold text-gray-900">{data.networkSize.orgAdmins}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Strategic Partners</div>
                  <div className="text-xl font-bold text-[#1E8E5A]">{data.networkSize.partners}</div>
                </div>
              </div>
            </div>
          )}

          {/* Strategic Partner Stats */}
          {!isAdmin && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm font-medium text-gray-700 mb-3">Performance</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600">Activation Level</div>
                  <div className="text-lg font-bold text-gray-900">{data.activationLevel}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Slots Used</div>
                  <div className="text-lg font-bold text-gray-900">{data.slotsUsed} / {data.slotsAvailable}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Activations</div>
                  <div className="text-lg font-bold text-[#1E8E5A]">{data.totalActivated || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="text-sm text-gray-600">
            Member since {new Date(data.createdDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={dashboardStyles.modal.footer}>
          <button onClick={onClose} className={dashboardStyles.button.secondary}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
