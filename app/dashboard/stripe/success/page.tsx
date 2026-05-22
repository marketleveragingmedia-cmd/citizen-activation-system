import { redirect } from 'next/navigation'

export default function StripeConnectSuccess() {
  // Redirect back to dashboard after successful Stripe Connect onboarding
  redirect('/dashboard?stripe=connected')
}
