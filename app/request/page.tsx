import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import RequestForm from './RequestForm'
import { redirect } from 'next/navigation'

async function getSubdomainData(subdomain: string | null) {
  if (!subdomain) return null

  const admin = await prisma.admin.findFirst({
    where: {
      subdomain: {
        equals: subdomain,
        mode: 'insensitive'
      },
      status: 'Active'
    },
    include: {
      team: true
    }
  })

  return admin
}

export default async function RequestPage() {
  const headersList = headers()
  const host = headersList.get('host') || ''
  
  // Extract subdomain from host
  const subdomain = host.split('.')[0]
  
  // If no subdomain or main domain, redirect to main site
  if (!subdomain || subdomain === 'hub' || subdomain === 'www' || subdomain === 'localhost:3000') {
    redirect('/')
  }

  // Get admin/team data for this subdomain
  const admin = await getSubdomainData(subdomain)

  if (!admin) {
    redirect('/subdomain-blocked')
  }

  // Get branding
  const organizationName = admin.team?.organizationName || admin.team?.name || 'Organization'
  const logoUrl = admin.team?.logoUrl
  const welcomeMessage = admin.team?.welcomeMessage
  const primaryColor = admin.team?.primaryColor || '#1E8E5A'
  const secondaryColor = admin.team?.secondaryColor || '#065F46'
  const hidePlatformBranding = admin.team?.hidePlatformBranding || false

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={organizationName}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {organizationName}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              MOSCA Wallet Invitation Request
            </p>
            {welcomeMessage && (
              <p className="text-sm text-gray-700 mt-3 italic max-w-2xl mx-auto">
                "{welcomeMessage}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Your Invitation</h2>
          
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Submit your information below</li>
              <li>You'll be assigned to a Strategic Partner via our Round Robin system</li>
              <li>Your Strategic Partner will contact you to begin the invitation process</li>
              <li>Once approved, you'll receive your MOSCA wallet invitation</li>
            </ol>
          </div>

          <RequestForm 
            subdomain={subdomain}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </div>

      {/* Footer */}
      {!hidePlatformBranding && (
        <div className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          Powered by <a href="https://citizenactivation.com" className="hover:underline" style={{ color: secondaryColor }}>Citizen Activation</a>
        </div>
      )}
    </div>
  )
}
