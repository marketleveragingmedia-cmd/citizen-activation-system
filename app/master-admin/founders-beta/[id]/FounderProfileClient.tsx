'use client'

import Link from 'next/link'

interface Founder {
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
  stripeCustomerId: string | null
  stripeCheckoutSessionId: string
  stripePaymentIntentId: string | null
  stripePriceId: string
  amountPaid: number
  currency: string
  paymentStatus: string
  intakeCompleted: boolean
  intakeCompletedAt: Date | null
  subdomainOption1: string | null
  subdomainOption2: string | null
  invitationRequestCompleted: boolean
  invitationRequestCompletedAt: Date | null
  casAccountCreated: boolean
  casAccountCreatedAt: Date | null
  casAdminId: string | null
  skoolCommunityAdded: boolean
  skoolCommunityAddedAt: Date | null
  globalControlContactId: string | null
  globalControlSynced: boolean
  globalControlLastSyncedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function FounderProfileClient({ founder }: { founder: Founder }) {
  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/master-admin/founders-beta" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold">
          <span className="mr-2">←</span> Back to Founders Beta
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">{founder.fullName}</h1>
            {founder.companyName && (
              <p className="text-lg text-green-700 font-semibold">{founder.companyName}</p>
            )}
            <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-semibold ${
              founder.founderLevel.includes('Enterprise')
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {founder.founderLevel}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-600 font-semibold">Amount Paid</div>
            <div className="text-4xl font-bold text-green-900">${(founder.amountPaid / 100).toFixed(2)}</div>
            <div className="text-xs text-green-700 mt-1">{new Date(founder.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📧</span> Contact Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Full Name</label>
              <p className="text-gray-900">{founder.fullName}</p>
            </div>
            {founder.companyName && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Organization / Business Name</label>
                <p className="text-gray-900">{founder.companyName}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600">Email</label>
              <p className="text-gray-900">{founder.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Phone</label>
              <p className="text-gray-900">{founder.phone}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📍</span> Address
          </h2>
          <div className="space-y-1 text-gray-900">
            <p>{founder.address1}</p>
            {founder.address2 && <p>{founder.address2}</p>}
            <p>{founder.city}, {founder.state} {founder.zip}</p>
            <p>{founder.country}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💳</span> Payment Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Founder Level</label>
              <p className="text-gray-900">{founder.founderLevel}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Amount Paid</label>
              <p className="text-gray-900 text-2xl font-bold text-green-600">${(founder.amountPaid / 100).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Payment Status</label>
              <p className="text-gray-900">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                  {founder.paymentStatus}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Payment Date</label>
              <p className="text-gray-900">{new Date(founder.createdAt).toLocaleString()}</p>
            </div>
            {founder.stripeCustomerId && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Stripe Customer ID</label>
                <p className="text-gray-900 font-mono text-xs">{founder.stripeCustomerId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Subdomain Options */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌐</span> Subdomain Preferences
          </h2>
          <div className="space-y-3">
            {founder.subdomainOption1 && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Option 1</label>
                <p className="text-gray-900 font-mono">{founder.subdomainOption1}.citizenactivation.com</p>
              </div>
            )}
            {founder.subdomainOption2 && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Option 2</label>
                <p className="text-gray-900 font-mono">{founder.subdomainOption2}.citizenactivation.com</p>
              </div>
            )}
            {!founder.subdomainOption1 && !founder.subdomainOption2 && (
              <p className="text-gray-500 italic">No subdomain preferences provided</p>
            )}
          </div>
        </div>

        {/* Strategic Partner / MOSCA */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔑</span> Strategic Partner / MOSCA
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Strategic Partner Referral Code</label>
              {founder.globalControlContactId ? (
                <p className="text-gray-900 font-mono text-lg font-bold">View in Strategic Partner Section</p>
              ) : (
                <p className="text-gray-500 italic">Not yet provided by MOSCA</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Added after MOSCA wallet activation in Strategic Partner section</p>
            </div>
          </div>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span> Onboarding Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              founder.intakeCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-semibold text-gray-600 mb-1">Intake</div>
              <div className={`text-2xl font-bold ${
                founder.intakeCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {founder.intakeCompleted ? '✅' : '⏳'}
              </div>
              {founder.intakeCompletedAt && (
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(founder.intakeCompletedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              founder.invitationRequestCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-semibold text-gray-600 mb-1">Invitation Request</div>
              <div className={`text-2xl font-bold ${
                founder.invitationRequestCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {founder.invitationRequestCompleted ? '✅' : '⏳'}
              </div>
              {founder.invitationRequestCompletedAt && (
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(founder.invitationRequestCompletedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              founder.casAccountCreated 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-semibold text-gray-600 mb-1">CAS Account</div>
              <div className={`text-2xl font-bold ${
                founder.casAccountCreated ? 'text-green-600' : 'text-gray-400'
              }`}>
                {founder.casAccountCreated ? '✅' : '⏳'}
              </div>
              {founder.casAccountCreatedAt && (
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(founder.casAccountCreatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              founder.skoolCommunityAdded 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-semibold text-gray-600 mb-1">SKOOL Community</div>
              <div className={`text-2xl font-bold ${
                founder.skoolCommunityAdded ? 'text-green-600' : 'text-gray-400'
              }`}>
                {founder.skoolCommunityAdded ? '✅' : '⏳'}
              </div>
              {founder.skoolCommunityAddedAt && (
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(founder.skoolCommunityAddedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              founder.globalControlSynced 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-semibold text-gray-600 mb-1">Global Control</div>
              <div className={`text-2xl font-bold ${
                founder.globalControlSynced ? 'text-green-600' : 'text-gray-400'
              }`}>
                {founder.globalControlSynced ? '✅' : '⏳'}
              </div>
              {founder.globalControlLastSyncedAt && (
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(founder.globalControlLastSyncedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚙️</span> System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Founder ID</label>
              <p className="text-gray-900 font-mono text-xs">{founder.id}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Stripe Checkout Session</label>
              <p className="text-gray-900 font-mono text-xs break-all">{founder.stripeCheckoutSessionId}</p>
            </div>
            {founder.casAdminId && (
              <div>
                <label className="text-sm font-semibold text-gray-600">CAS Admin ID</label>
                <p className="text-gray-900 font-mono text-xs">{founder.casAdminId}</p>
              </div>
            )}
            {founder.globalControlContactId && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Global Control Contact ID</label>
                <p className="text-gray-900 font-mono text-xs">{founder.globalControlContactId}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600">Created</label>
              <p className="text-gray-900">{new Date(founder.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Last Updated</label>
              <p className="text-gray-900">{new Date(founder.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
