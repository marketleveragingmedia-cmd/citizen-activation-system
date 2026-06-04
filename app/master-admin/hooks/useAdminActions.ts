'use client'

import { useState } from 'react'

export function useAdminActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleStatus(adminId: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle status')
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(adminId: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function resendWelcome(adminId: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend welcome email')
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function deleteAdmin(adminId: string, confirmText: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, confirmText })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete admin')
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleStatus,
    resetPassword,
    resendWelcome,
    deleteAdmin,
    loading,
    error
  }
}
