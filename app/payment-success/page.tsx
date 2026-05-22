export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your Team Admin account is being activated. You'll receive login credentials via email within the next few minutes.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>What's Next:</strong><br />
            1. Check your email for login credentials<br />
            2. Login to your Team Admin dashboard<br />
            3. Start adding Strategic Partners<br />
            4. Grow your network!
          </p>
        </div>
        <a
          href="/login"
          className="bg-[#1E8E5A] hover:bg-[#177349] text-white font-bold py-3 px-6 rounded-lg inline-block"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}
