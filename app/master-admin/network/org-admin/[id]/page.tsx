import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrgAdminNetworkViewer from './OrgAdminNetworkViewer'

export default async function OrgAdminNetworkPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })

  if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  // Get the Org Admin's full network
  const orgAdmin = await prisma.admin.findUnique({
    where: { id: params.id },
    include: {
      team: {
        include: {
          createdBy: true,
          strategicPartners: {
            include: {
              assignedRequests: {
                where: { status: 'Activated' }
              }
            }
          }
        }
      }
    }
  })

  if (!orgAdmin || orgAdmin.role !== 'ORG_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/master-admin/org-admins" className="text-blue-600 hover:underline">
              ← Back to Organization Admins
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-red-600 text-lg">Organization Admin not found</p>
          </div>
        </div>
      </div>
    )
  }

  const partners = orgAdmin.team?.strategicPartners || []
  const totalActivations = partners.reduce((sum, p) => sum + p.assignedRequests.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/master-admin/org-admins" className="text-blue-600 hover:underline text-sm">
              ← Back to Organization Admins
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {orgAdmin.firstName} {orgAdmin.lastName}'s Network
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {orgAdmin.email} • Organization Admin
            </p>
            {orgAdmin.team?.organizationName && (
              <p className="text-sm text-teal-700 font-medium mt-1">
                {orgAdmin.team.organizationName}
              </p>
            )}
            {orgAdmin.team?.createdBy && (
              <p className="text-sm text-blue-600 mt-1">
                Connected by: {orgAdmin.team.createdBy.firstName} {orgAdmin.team.createdBy.lastName}
              </p>
            )}
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Strategic Partners</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{partners.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Total Activations</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{totalActivations}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Average per Partner</div>
            <div className="text-2xl font-bold text-gray-900">
              {partners.length > 0 ? (totalActivations / partners.length).toFixed(1) : '0'}
            </div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="bg-white rounded-lg shadow p-6">
          <OrgAdminNetworkViewer partners={partners} organizationName={orgAdmin.team?.organizationName} />
        </div>
      </div>
    </div>
  )
}
