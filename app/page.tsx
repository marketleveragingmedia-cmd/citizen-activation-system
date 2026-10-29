import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seeing Money in a Completely Different Way',
  description: 'Discover a new approach to financial freedom through the Citizen Activation System.',
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

export default async function PressPlayPage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  
  // Extract subdomain from host
  const subdomain = host.split('.')[0]
  
  // If hub subdomain, redirect to main dashboard
  if (subdomain === 'hub') {
    redirect('/dashboard')
  }

  // If no subdomain or www, show coming soon or redirect
  if (!subdomain || subdomain === 'www' || subdomain === 'localhost:3000') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Citizen Activation System</h1>
          <p className="text-xl text-gray-600">Coming Soon</p>
        </div>
      </div>
    )
  }

  // Get admin/team data for this subdomain
  const admin = await getSubdomainData(subdomain)

  if (!admin) {
    redirect('/subdomain-blocked')
  }

  // Get Strategic Partner's full name
  const strategicPartnerName = `${admin.firstName} ${admin.lastName}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/citizen-activation-logo.jpg"
            alt="Citizen Activation System"
            width={320}
            height={125}
            priority
            className="object-contain"
          />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Seeing Money in a<br />Completely Different Way
          </h1>
          <p className="text-2xl text-[#1E8E5A] font-semibold mb-2">
            Invited by {strategicPartnerName}
          </p>
        </div>

        {/* Video Section - Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center p-8">
              <svg 
                className="w-24 h-24 mx-auto mb-4 text-[#1E8E5A] opacity-50" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <p className="text-gray-600 font-medium">
                Press Play Video Presentation
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Video will be embedded here
              </p>
            </div>
          </div>
          
          {/* Video Instructions - Remove this section when adding actual video */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <p className="text-amber-800 font-medium mb-2">📹 Video Placeholder Instructions:</p>
            <p className="text-amber-700">
              Replace the placeholder div above with your video embed code (YouTube, Vimeo, Wistia, etc.)
            </p>
          </div>
        </div>

        {/* Benefits/Experience Section - Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What You'll Experience
          </h2>
          
          <div className="space-y-4">
            {/* Placeholder bullet points - Replace with actual content */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Benefit Title 1</h3>
                <p className="text-gray-600">Replace with your actual benefit description</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Benefit Title 2</h3>
                <p className="text-gray-600">Replace with your actual benefit description</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Benefit Title 3</h3>
                <p className="text-gray-600">Replace with your actual benefit description</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Benefit Title 4</h3>
                <p className="text-gray-600">Replace with your actual benefit description</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Benefit Title 5</h3>
                <p className="text-gray-600">Replace with your actual benefit description</p>
              </div>
            </div>
          </div>

          {/* Content Instructions - Remove this section when adding actual content */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mt-6">
            <p className="text-blue-800 font-medium mb-2">📝 Content Placeholder Instructions:</p>
            <p className="text-blue-700">
              Replace the 5 benefit items above with your actual messaging about what visitors will experience.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/request"
            className="inline-block bg-[#1E8E5A] hover:bg-[#065F46] text-white font-bold text-xl px-12 py-5 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            Request Your Invitation
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Invited by {strategicPartnerName}
          </p>
        </div>

        {/* Footer Branding */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <span className="font-semibold text-[#1E8E5A]">Network Leveraging Cash Flow</span>
            <span>•</span>
            <span className="font-semibold text-[#C9A441]">Cash Flow Visionaries</span>
          </div>
          <p className="text-sm text-gray-500">
            Powered by Citizen Activation System
          </p>
        </div>

      </div>
    </div>
  )
}
