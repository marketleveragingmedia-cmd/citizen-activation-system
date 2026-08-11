#!/usr/bin/env node

/**
 * FOUNDERS BETA - STRIPE PRODUCT SETUP SCRIPT
 * 
 * This script creates:
 * 1. Citizen Founder-Beta product + price + payment link
 * 2. Enterprise Founder-Beta product + price + payment link
 * 3. Webhook endpoint
 * 
 * Usage:
 * STRIPE_SECRET_KEY=sk_live_YOUR_KEY node create-founders-beta-stripe-products.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable not set');
  console.error('');
  console.error('Usage:');
  console.error('  STRIPE_SECRET_KEY=sk_live_YOUR_KEY node create-founders-beta-stripe-products.js');
  console.error('');
  console.error('Get your key from: https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

async function createFoundersBetaProducts() {
  console.log('🚀 Creating Founders Beta Stripe Products...\n');

  try {
    // 1. Create Citizen Founder-Beta Product
    console.log('📦 Creating Citizen Founder-Beta product...');
    const citizenProduct = await stripe.products.create({
      name: 'Citizen Founder-Beta',
      description: 'Become a Citizen Founder-Beta within Cash Flow Visionaries | Network Leveraging Cash Flow and receive the applicable Founder-Beta Positioning, Education, Resources, Support and Founder Advantages.',
    });
    console.log(`✅ Product created: ${citizenProduct.id}`);

    // Create Citizen Price
    console.log('💰 Creating Citizen price ($1,497)...');
    const citizenPrice = await stripe.prices.create({
      product: citizenProduct.id,
      unit_amount: 149700, // $1,497.00
      currency: 'usd',
    });
    console.log(`✅ Price created: ${citizenPrice.id}`);

    // Create Citizen Payment Link
    console.log('🔗 Creating Citizen payment link...');
    const citizenPaymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: citizenPrice.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://cashflowvisionaries.com/founders-beta/confirmed?session_id={CHECKOUT_SESSION_ID}',
        },
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });
    console.log(`✅ Payment link created: ${citizenPaymentLink.url}\n`);

    // 2. Create Enterprise Founder-Beta Product
    console.log('📦 Creating Enterprise Founder-Beta product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Founder-Beta',
      description: 'Become an Enterprise Founder-Beta within Cash Flow Visionaries | Network Leveraging Cash Flow and receive the applicable Founder-Beta Positioning, Education, Resources, Support and Founder Advantages.',
    });
    console.log(`✅ Product created: ${enterpriseProduct.id}`);

    // Create Enterprise Price
    console.log('💰 Creating Enterprise price ($1,997)...');
    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 199700, // $1,997.00
      currency: 'usd',
    });
    console.log(`✅ Price created: ${enterprisePrice.id}`);

    // Create Enterprise Payment Link
    console.log('🔗 Creating Enterprise payment link...');
    const enterprisePaymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: enterprisePrice.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://cashflowvisionaries.com/founders-beta/confirmed?session_id={CHECKOUT_SESSION_ID}',
        },
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });
    console.log(`✅ Payment link created: ${enterprisePaymentLink.url}\n`);

    // 3. Create Webhook Endpoint
    console.log('🪝 Creating webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://cfv-content-engine.vercel.app/api/founders-beta/webhook',
      enabled_events: ['checkout.session.completed'],
      description: 'Cash Flow Visionaries Founders Beta',
    });
    console.log(`✅ Webhook created: ${webhook.id}`);
    console.log(`🔐 Webhook secret: ${webhook.secret}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ FOUNDERS BETA STRIPE SETUP COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 DELIVERABLES:\n');
    console.log(`1. Citizen Founder-Beta Product ID: ${citizenProduct.id}`);
    console.log(`2. Citizen Founder-Beta Price ID: ${citizenPrice.id}`);
    console.log(`3. Citizen Payment Link: ${citizenPaymentLink.url}`);
    console.log(`4. Enterprise Founder-Beta Product ID: ${enterpriseProduct.id}`);
    console.log(`5. Enterprise Founder-Beta Price ID: ${enterprisePrice.id}`);
    console.log(`6. Enterprise Payment Link: ${enterprisePaymentLink.url}`);
    console.log(`7. Webhook ID: ${webhook.id}`);
    console.log(`8. Webhook Secret: ${webhook.secret}`);
    console.log(`9. Webhook Status: Active`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚡ NEXT STEPS:');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('1. Update Vercel Environment Variables:');
    console.log('   https://vercel.com/marketleveragingmedia-cmds-projects/cfv-content-engine/settings/environment-variables\n');
    console.log(`   STRIPE_SECRET_KEY = ${process.env.STRIPE_SECRET_KEY.substring(0, 15)}...`);
    console.log(`   STRIPE_WEBHOOK_SECRET = ${webhook.secret}`);
    console.log(`   STRIPE_CITIZEN_PRICE_ID = ${citizenPrice.id}`);
    console.log(`   STRIPE_ENTERPRISE_PRICE_ID = ${enterprisePrice.id}`);
    console.log('');
    console.log('2. Redeploy CFV Content Engine after updating env vars');
    console.log('');
    console.log('3. Update participate.html with payment links (script output below)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Return data for programmatic use
    return {
      citizen: {
        productId: citizenProduct.id,
        priceId: citizenPrice.id,
        paymentLink: citizenPaymentLink.url,
      },
      enterprise: {
        productId: enterpriseProduct.id,
        priceId: enterprisePrice.id,
        paymentLink: enterprisePaymentLink.url,
      },
      webhook: {
        id: webhook.id,
        secret: webhook.secret,
      },
    };

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createFoundersBetaProducts()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Script failed:', err);
      process.exit(1);
    });
}

module.exports = { createFoundersBetaProducts };
