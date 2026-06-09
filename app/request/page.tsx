import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import RequestForm from './RequestForm'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request MOSCA Activation',
  description: 'Submit your MOSCA wallet activation request. Get connected with a Strategic Partner who will guide you through the onboarding process.',
}

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

  // Get branding (Organization Admin only)
  const isOrgAdmin = admin.team?.tierType === 'SoloOrg'
  const organizationName = isOrgAdmin ? (admin.team?.organizationName || admin.team?.name) : null
  const logoUrl = isOrgAdmin ? admin.team?.logoUrl : null
  const welcomeMessage = isOrgAdmin ? admin.team?.welcomeMessage : null
  const primaryColor = isOrgAdmin ? (admin.team?.primaryColor || '#1E8E5A') : '#1E8E5A'
  const secondaryColor = isOrgAdmin ? (admin.team?.secondaryColor || '#065F46') : '#065F46'
  // Platform branding footer is always shown

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6 py-12">
        {/* Logo/Header - matches hub structure */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={organizationName || 'Organization'}
                className="h-32 object-contain"
              />
            ) : (
              <Image
                src="/citizen-activation-logo.jpg"
                alt="Citizen Activation System"
                width={320}
                height={125}
                priority
                className="object-contain"
              />
            )}
          </div>
          
          {/* Title - Organization Admin can customize, others see default */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {organizationName || 'Request Private Invitation'}
          </h1>
          
          {/* Tagline - Organization Admin can customize with welcome message */}
          {welcomeMessage ? (
            <p className="text-xl text-gray-600 italic">
              "{welcomeMessage}"
            </p>
          ) : (
            <p className="text-xl text-gray-600">
              Join the Movement. Connect - Activate - Duplicate
            </p>
          )}
        </div>

        {/* Request Form - matches hub structure */}
        <RequestForm 
          subdomain={subdomain}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />

        {/* Footer - matches hub structure */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-center">
            Already have an account?<br className="md:hidden" />
            <a 
              href="/login" 
              className="font-medium hover:underline ml-1"
              style={{ color: primaryColor }}
            >
              Login to Strategic Partner Hub
            </a>
          </p>
        </div>

        {/* Platform footer - always shown */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Powered by <a href="https://citizenactivation.com" className="hover:underline" style={{ color: secondaryColor }}>CitizenActivation.com</a>
        </div>
      </div>
    </div>
  )
}
