import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Create Main Admin product
    const product = await stripe.products.create({
      name: 'Main Admin Access - Year 1',
      description: 'Full network control, add Team Admins & Org Admins, see entire network',
    })

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 149700, // $1,497
      currency: 'usd',
    })

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: price.id,
      message: `Main Admin product created! Price ID: ${price.id}`,
      instructions: 'Update /app/api/checkout/main-admin/route.ts line 26 with this Price ID'
    })

  } catch (error: any) {
    console.error('Error creating Main Admin product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
