import Image from 'next/image'
import Link from 'next/link'

export default function FoundersMoscaPending() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/founder-badge.png" alt="Founders Logo" width={280} height={280} priority />
          </div>
          <div className="mb-6">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Received!</h1>
            <p className="text-xl text-yellow-600 font-semibold">Payment Verification Pending</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-yellow-900 text-lg mb-4">What happens next?</h3>
            <ul className="space-y-3 text-yellow-900">
              <li className="flex items-start">
                <span className="text-xl mr-3">📧</span>
                <span><strong>Confirmation email sent</strong> - Check your inbox for application details</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">⏰</span>
                <span><strong>24-48 hour verification</strong> - Our team will verify your MOSCA wallet payment</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">✅</span>
                <span><strong>Automatic activation</strong> - Once verified, your account will be created and you'll receive login credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">🔗</span>
                <span><strong>Custom link ready</strong> - Your subdomain will be activated and ready to share</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-3">Payment Verification Details</h3>
            <p className="text-sm text-blue-900 mb-3">We'll verify your $997 payment to:</p>
            <p className="font-mono bg-white px-3 py-2 rounded text-blue-900 mb-3">mzsamantha01@gmail.com</p>
            <p className="text-sm text-blue-900">Once confirmed, you'll receive an email with your login credentials and Founder status will be activated.</p>
          </div>

          <div className="space-y-4">
            <Link href="/" className="block w-full bg-[#1E8E5A] hover:bg-[#177349] text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors">
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-2">If you don't receive a confirmation email within 10 minutes, please check your spam folder.</p>
            <p className="text-gray-600 mb-4">Payment verification typically takes 24-48 hours. You'll receive another email once your account is activated.</p>
            <p className="text-gray-600">Questions? Email <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline font-medium">support@citizenactivation.com</a></p>
          </div>

          {/* Disclosure */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              <strong>Disclosure:</strong> You have submitted an application for a one-time payment of $997 (or equivalent) for lifetime access to the Citizen Activation System Founders Beta. 
              There are no recurring charges or annual fees. All sales are final. Your payment is currently under review and will be verified within 24-48 hours. 
              Once verified, your account will be activated and you will receive login credentials via email. This is a digital product. 
              For questions or support, contact <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline">support@citizenactivation.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
