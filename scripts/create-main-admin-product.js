// Create Main Admin Stripe Product
// Uses existing Stripe configuration from lib/stripe.ts

const { stripe } = require('../lib/stripe.ts');

async function createMainAdminProduct() {
  console.log('Creating Main Admin Stripe product...\n');

  try {
    // Create product
    const product = await stripe.products.create({
      name: 'Main Admin Access - Year 1',
      description: 'Full network control, add Team Admins & Org Admins, see entire network',
    });

    console.log('✅ Product created:', product.id);

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 149700, // $1,497
      currency: 'usd',
    });

    console.log('✅ Price created:', price.id);
    console.log('\n📋 Update this file:');
    console.log('   /app/api/checkout/main-admin/route.ts');
    console.log('\n   Replace MAIN_ADMIN_YEAR1_PRICE_ID with:', price.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Stripe key not configured. This will work on Vercel deployment.');
    }
  }
}

createMainAdminProduct();
