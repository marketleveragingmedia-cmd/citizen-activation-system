import { redirect } from 'next/navigation'

export default function StripeConnectRefresh() {
  // Redirect back to dashboard if user needs to refresh onboarding
  redirect('/dashboard?stripe=refresh')
}
