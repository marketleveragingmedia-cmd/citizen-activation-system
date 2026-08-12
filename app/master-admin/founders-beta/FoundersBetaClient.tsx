'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FounderBeta {
  id: string
  fullName: string
  companyName: string | null
  email: string
  phone: string
  address1: string
  address2: string | null
  city: string
  state: string
  zip: string
  country: string
  founderLevel: string
  amountPaid: number
  paymentStatus: string
  intakeCompleted: boolean
  intakeCompletedAt: Date | null
  subdomainOption1: string | null
  subdomainOption2: string | null
  casAccountCreated: boolean
  casAccountCreatedAt: Date | null
  casAdminId: string | null
  createdAt: Date
}

interface Stats {
  totalFounders: number
  citizenCount: number
  enterpriseCount: number
  totalRevenue: number
  intakeComplete: number
  casAccountsCreated: number
}

interface Props {
  founders: FounderBeta[]
  stats: Stats
}

export default function FoundersBetaClient({ founders, stats }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<'all' | 'citizen' | 'enterprise'>('all')
  const [filterIntake, setFilterIntake] = useState<'all' | 'complete' | 'pending'>('all')
  const [filterCAS, setFilterCAS] = useState<'all' | 'created' | 'pending'>('all')
  const [provisioningId, setProvisioningId] = useState<string | null>(null)
  const [provisionResult, setProvisionResult] = useState<any>(null)

  // Filter founders
  const filteredFounders = founders.filter(founder => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      founder.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      founder.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (founder.companyName && founder.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

    // Tier filter
    const matchesTier = filterTier === 'all' || 
      (filterTier === 'citizen' && founder.founderLevel.includes('Citizen')) ||
      (filterTier === 'enterprise' && founder.founderLevel.includes('Enterprise'))

    // Intake filter
    const matchesIntake = filterIntake === 'all' ||
      (filterIntake === 'complete' && founder.intakeCompleted) ||
      (filterIntake === 'pending' && !founder.intakeCompleted)

    // CAS filter
    const matchesCAS = filterCAS === 'all' ||
      (filterCAS === 'created' && founder.casAccountCreated) ||
      (filterCAS === 'pending' && !founder.casAccountCreated)

    return matchesSearch && matchesTier && matchesIntake && matchesCAS
  })

  const provisionAccount = async (founderId: string) => {
    if (!confirm('Create CAS account for this Founder?')) return

    setProvisioningId(founderId)
    setProvisionResult(null)

    try {
      const response = await fetch('/api/founders-beta/provision-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderBetaId: founderId })
      })

      const result = await response.json()

      if (response.ok) {
        setProvisionResult({ success: true, ...result })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setProvisionResult({ success: false, error: result.error })
      }
    } catch (error) {
      setProvisionResult({ success: false, error: 'Network error' })
    } finally {
      setProvisioningId(null)
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Tier', 'Amount', 'Payment Date', 'Intake', 'Subdomain 1', 'Subdomain 2', 'CAS Account']
    const rows = filteredFounders.map(f => [
      f.fullName,
      f.email,
      f.phone,
      f.companyName || '',
      f.founderLevel,
      `$${(f.amountPaid / 100).toFixed(2)}`,
      new Date(f.createdAt).toLocaleDateString(),
      f.intakeCompleted ? 'Complete' : 'Pending',
      f.subdomainOption1 || '',
      f.subdomainOption2 || '',
      f.casAccountCreated ? 'Created' : 'Pending'
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `founders-beta-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Founders Beta</h1>
        <p className="text-gray-600">Manage Cash Flow Visionaries Founders Beta members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-semibold mb-1">Total Founders</div>
          <div className="text-3xl font-bold text-green-900">{stats.totalFounders}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-semibold mb-1">Citizen</div>
          <div className="text-3xl font-bold text-gray-900">{stats.citizenCount}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-semibold mb-1">Enterprise</div>
          <div className="text-3xl font-bold text-gray-900">{stats.enterpriseCount}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-semibold mb-1">Revenue</div>
          <div className="text-2xl font-bold text-blue-900">${stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-semibold mb-1">Intake Complete</div>
          <div className="text-3xl font-bold text-gray-900">{stats.intakeComplete}/{stats.totalFounders}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-semibold mb-1">CAS Accounts</div>
          <div className="text-3xl font-bold text-gray-900">{stats.casAccountsCreated}/{stats.totalFounders}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="citizen">Citizen</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Intake Status</label>
            <select
              value={filterIntake}
              onChange={(e) => setFilterIntake(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CAS Account</label>
            <select
              value={filterCAS}
              onChange={(e) => setFilterCAS(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="created">Created</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportCSV}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            Export CSV ({filteredFounders.length})
          </button>
        </div>
      </div>

      {/* Provision Result */}
      {provisionResult && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          provisionResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {provisionResult.success ? (
            <div>
              <p className="font-semibold text-green-900 mb-2">✅ CAS Account Created!</p>
              <p className="text-sm text-green-800">Email: {provisionResult.admin?.email}</p>
              <p className="text-sm text-green-800">Role: {provisionResult.admin?.role}</p>
              <p className="text-sm text-green-800">Subdomain: {provisionResult.admin?.subdomain}.citizenactivation.com</p>
              <p className="text-sm text-green-800 mt-2 font-semibold">Temp Password: {provisionResult.admin?.tempPassword}</p>
              <p className="text-xs text-green-700 mt-1">Save this password - it won't be shown again!</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-red-900 mb-1">❌ Error</p>
              <p className="text-sm text-red-800">{provisionResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Founders List */}
      <div className="space-y-4">
        {filteredFounders.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No founders found matching your filters</p>
          </div>
        ) : (
          filteredFounders.map(founder => (
            <div key={founder.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Founder Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{founder.fullName}</h3>
                  {founder.companyName && (
                    <p className="text-sm text-gray-600 mb-2">{founder.companyName}</p>
                  )}
                  <p className="text-sm text-gray-700">{founder.email}</p>
                  <p className="text-sm text-gray-700">{founder.phone}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      founder.founderLevel.includes('Enterprise')
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {founder.founderLevel}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Payment:</span>
                      <span className="text-sm font-bold text-green-600">${(founder.amountPaid / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Intake:</span>
                      <span className={`text-sm font-semibold ${founder.intakeCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                        {founder.intakeCompleted ? '✅ Complete' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">CAS Account:</span>
                      <span className={`text-sm font-semibold ${founder.casAccountCreated ? 'text-green-600' : 'text-orange-600'}`}>
                        {founder.casAccountCreated ? '✅ Created' : '⏳ Pending'}
                      </span>
                    </div>
                    {founder.subdomainOption1 && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-500">Subdomain 1:</span>
                        <p className="text-sm font-mono text-gray-700">{founder.subdomainOption1}.citizenactivation.com</p>
                      </div>
                    )}
                    {founder.subdomainOption2 && (
                      <div>
                        <span className="text-xs text-gray-500">Subdomain 2:</span>
                        <p className="text-sm font-mono text-gray-700">{founder.subdomainOption2}.citizenactivation.com</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center">
                  {!founder.casAccountCreated && founder.intakeCompleted && (
                    <button
                      onClick={() => provisionAccount(founder.id)}
                      disabled={provisioningId === founder.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
                    >
                      {provisioningId === founder.id ? 'Creating...' : `Create ${founder.founderLevel.includes('Enterprise') ? 'Main' : 'Team'} Admin Account`}
                    </button>
                  )}
                  {!founder.intakeCompleted && (
                    <div className="text-sm text-orange-600 font-semibold text-center">
                      Waiting for intake completion
                    </div>
                  )}
                  {founder.casAccountCreated && (
                    <div className="text-sm text-green-600 font-semibold text-center">
                      ✅ CAS Account Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
