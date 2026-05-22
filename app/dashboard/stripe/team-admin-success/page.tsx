import { redirect } from 'next/navigation'

export default function TeamAdminPaymentSuccess() {
  // Redirect back to dashboard after successful Team Admin payment
  redirect('/dashboard?payment=success')
}
