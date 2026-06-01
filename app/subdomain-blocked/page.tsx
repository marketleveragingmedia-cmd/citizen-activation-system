import Image from 'next/image'

export default function SubdomainBlockedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Image
              src="/citizen-activation-logo.jpg"
              alt="Citizen Activation System"
              width={280}
              height={110}
              priority
              className="mx-auto object-contain"
            />
          </div>

          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Subdomain Inactive
            </h1>
            
            <p className="text-gray-600 mb-4">
              This subdomain is no longer active and cannot accept new requests.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happened?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The admin account for this subdomain has been deactivated</li>
                <li>• This may be temporary or permanent</li>
                <li>• Existing Strategic Partners remain unaffected</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://hub.citizenactivation.com"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Go to Main Hub
            </a>
            
            <a
              href="https://citizenactivation.com/contact"
              className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
            >
              Contact Support
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact system support.
          </p>
        </div>
      </div>
    </div>
  )
}
