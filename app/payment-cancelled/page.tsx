export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          You cancelled the payment process. Your Team Admin account has not been created.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            If you'd like to complete your Team Admin setup, please use the payment link from the email you received. The link is still valid.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Questions? Contact the person who invited you or reach out to support.
        </p>
      </div>
    </div>
  )
}
