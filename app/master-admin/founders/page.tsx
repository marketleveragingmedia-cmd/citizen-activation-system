import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FoundersClient from './FoundersClient'

export default async function FoundersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })

  if (!admin || admin.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  // Get all Founders
  const founders = await prisma.admin.findMany({
    where: {
      role: 'MAIN_ADMIN',
      isFounder: true
    },
    include: {
      team: true,
      teamsCreated: {
        select: {
          id: true,
          tierType: true
        }
      }
    },
    orderBy: {
      founderDate: 'desc'
    }
  })

  // Get pending MOSCA Founders
  const pendingFounders = await prisma.founderPending.findMany({
    where: {
      status: 'Pending'
    },
    orderBy: {
      submittedDate: 'desc'
    }
  })

  // Calculate stats
  const totalFounders = founders.length
  const activeFounders = founders.filter(f => f.status === 'Active').length
  const pendingCount = pendingFounders.length

  const stripeFounders = founders.filter(f => f.founderPaymentMethod === 'Stripe').length
  const moscaFounders = founders.filter(f => f.founderPaymentMethod === 'MOSCA').length
  const manualFounders = founders.filter(f => f.founderPaymentMethod === 'Manual').length

  const totalRevenue = totalFounders * 997

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Founders Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <Link href="/api/auth/signout" className="text-[#1E8E5A] hover:text-[#177349] font-semibold">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Founders</div>
            <div className="text-3xl font-bold text-yellow-600">{totalFounders}</div>
            <div className="text-xs text-gray-500 mt-1">Active: {activeFounders} | Pending: {pendingCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Payment Methods</div>
            <div className="text-sm text-gray-700">
              Stripe: {stripeFounders}<br />
              MOSCA: {moscaFounders}<br />
              Manual: {manualFounders}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Pending Approvals</div>
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            {pendingCount > 0 && (
              <div className="text-xs text-orange-600 mt-1">⚠️ Requires action</div>
            )}
          </div>
        </div>

        {/* Pending MOSCA Approvals */}
        {pendingFounders.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-orange-900 mb-4">⏳ Pending MOSCA Approvals</h2>
            <div className="space-y-4">
              {pendingFounders.map((pending) => (
                <div key={pending.id} className="bg-white p-4 rounded-lg border border-orange-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">
                        {pending.firstName} {pending.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{pending.email}</div>
                      <div className="text-sm text-gray-600">Phone: {pending.phone}</div>
                      <div className="text-sm text-gray-600">MOSCA Code: {pending.moscaCode}</div>
                      <div className="text-sm text-gray-600">
                        Subdomain Options: {pending.subdomainOption1}, {pending.subdomainOption2}
                      </div>
                      <div className="text-sm text-gray-600">Wallet/TX: {pending.walletInfo}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(pending.submittedDate).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Approve
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Founders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Founders</h2>
          </div>

          {founders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No Founders yet</p>
              <p className="text-sm mt-2">Founders will appear here once approved</p>
            </div>
          ) : (
            <FoundersClient founders={founders} />
          )}
        </div>
      </div>
    </div>
  )
}
