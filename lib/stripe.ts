import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Platform fee for Team Admin add-ons
export const PLATFORM_FEE_AMOUNT = 20000 // $200.00 in cents
export const TEAM_ADMIN_PRICE = 49700 // $497.00 in cents

// Calculate White-Label owner's share
export const WHITE_LABEL_SHARE = TEAM_ADMIN_PRICE - PLATFORM_FEE_AMOUNT // $297.00
