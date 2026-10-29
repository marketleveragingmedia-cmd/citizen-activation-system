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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base mb-6">
            <span className="font-semibold text-[#1E8E5A]">Network Leveraging Cash Flow</span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-[#C9A441]">Cash Flow Visionaries</span>
          </div>
        </div>

        {/* Hero Section with Frame */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/citizen-activation-logo.jpg"
              alt="Citizen Activation System"
              width={280}
              height={110}
              priority
              className="object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Seeing Money in a<br />Completely Different Way
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-3 max-w-3xl mx-auto">
              What If Creating Cash Flow Didn't Require More Work, Another Business, or Building Something From Scratch?
            </p>
            <p className="text-sm md:text-base text-[#1E8E5A] font-semibold">
              Personally Invited by {strategicPartnerName}
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
          <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center p-8 z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1E8E5A] mb-4 shadow-lg">
                <svg 
                  className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-gray-800 font-bold text-base md:text-lg mb-2">
                Watch the Free Presentation
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                Video presentation coming soon
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-30"></div>
          </div>
        </div>

        {/* What You'll Discover Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
            What You'll Discover
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Discovery Point 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Working Harder Isn't the Answer</h3>
                <p className="text-gray-600 leading-relaxed">
                  You're Already Working, Earning and Managing Financial Responsibilities. Discover why creating additional Cash Flow may require a different Strategy, not simply more of your time and energy.
                </p>
              </div>
            </div>

            {/* Discovery Point 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">No Creating. No Selling. No Building From Scratch.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover a different approach to Cash Flow without creating Digital Products, learning AI, building an Online Business or becoming an Affiliate Marketer. Learn why Leveraging What Already Exists changes the conversation.
                </p>
              </div>
            </div>

            {/* Discovery Point 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Network Leveraging Cash Flow: A Different Approach</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover how Technology, Community and an established Framework come together to create a different way to approach Cash Flow, without having to build an entire System on your own.
                </p>
              </div>
            </div>

            {/* Discovery Point 4 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Three Connections. Infinite Possibilities.</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover the Connect • Activate • Duplicate Framework and how intentional Connections, Community Expansion and Duplication create the Foundation for exploring Immediate and Residual Cash Flow possibilities.
                </p>
              </div>
            </div>

            {/* Discovery Point 5 */}
            <div className="flex items-start gap-4 md:col-span-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1E8E5A] flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">Become an Official Cash Flow Visionary</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover what it means to become part of a Movement built around Financial Freedom, Connection and IMPACT, and how Premium Membership opens the door to the private Experience where the Solution is revealed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#1E8E5A] to-[#065F46] rounded-xl shadow-xl p-8 md:p-10 mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Ready to See Cash Flow in a Completely Different Way?
          </h2>
          <Link
            href="/request"
            className="inline-block bg-white text-[#1E8E5A] hover:bg-gray-100 font-bold text-base md:text-lg px-8 py-3 rounded-lg shadow-lg transform transition hover:scale-105 mb-3"
          >
            Request Your Invitation
          </Link>
          <p className="text-xs md:text-sm text-white/90">
            Personally Invited by {strategicPartnerName}
          </p>
        </div>

        {/* Disclosures Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <details className="bg-gray-50 rounded-lg p-6">
            <summary className="cursor-pointer font-bold text-gray-900 text-base md:text-lg mb-2">
              Educational & Earnings Disclosure
            </summary>
            <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                The Presentation, examples and educational materials are provided for informational and educational purposes. Any cash-flow illustrations are examples only and are not promises, representations or guarantees of earnings or financial performance.
              </p>
              <p>
                Results depend on multiple factors, including individual participation, execution, qualifying activity, timing, market conditions, technology availability and other circumstances. Past or hypothetical examples should not be treated as a prediction of future results.
              </p>
              <p>
                Participants should evaluate any opportunity independently and obtain appropriate professional advice when needed.
              </p>
            </div>
          </details>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <span className="font-semibold text-[#1E8E5A]">Network Leveraging Cash Flow</span>
            <span>•</span>
            <span className="font-semibold text-[#C9A441]">Cash Flow Visionaries</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            Powered by Citizen Activation System
          </p>
          <p className="text-xs text-gray-400">
            Educational Content. No Earnings Guarantee. Participation Requires Informed Decision-Making.
          </p>
        </div>

      </div>
    </div>
  )
}
