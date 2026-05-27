const Stripe = require('stripe');

// Use REAL Stripe secret key - update this before running
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_YOUR_KEY_HERE');

async function createProducts() {
  console.log('Creating Stripe products for Citizen Activation System...\n');

  try {
    // Product 1: Main Admin - Year 1
    const mainAdminYear1 = await stripe.products.create({
      name: 'Main Admin Access - Year 1',
      description: 'Full network control, add Team Admins & Org Admins, see entire network',
    });
    const mainAdminYear1Price = await stripe.prices.create({
      product: mainAdminYear1.id,
      unit_amount: 149700, // $1,497
      currency: 'usd',
    });
    console.log('✅ Main Admin Year 1:', mainAdminYear1Price.id);

    // Product 2: Main Admin - Annual Renewal
    const mainAdminRenewal = await stripe.products.create({
      name: 'Main Admin - Annual Renewal',
      description: 'Annual renewal for Main Admin access',
    });
    const mainAdminRenewalPrice = await stripe.prices.create({
      product: mainAdminRenewal.id,
      unit_amount: 99700, // $997
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log('✅ Main Admin Renewal:', mainAdminRenewalPrice.id);

    // Product 3: Team Admin Direct - Year 1
    const teamAdminYear1 = await stripe.products.create({
      name: 'Team Admin Direct Access - Year 1',
      description: 'Manage Strategic Partners, oversee requests, add Team Admins & Org Admins',
    });
    const teamAdminYear1Price = await stripe.prices.create({
      product: teamAdminYear1.id,
      unit_amount: 49700, // $497
      currency: 'usd',
    });
    console.log('✅ Team Admin Direct Year 1:', teamAdminYear1Price.id);

    // Product 4: Team Admin Direct - Annual Renewal
    const teamAdminRenewal = await stripe.products.create({
      name: 'Team Admin Direct - Annual Renewal',
      description: 'Annual renewal for Team Admin Direct access',
    });
    const teamAdminRenewalPrice = await stripe.prices.create({
      product: teamAdminRenewal.id,
      unit_amount: 49700, // $497
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log('✅ Team Admin Direct Renewal:', teamAdminRenewalPrice.id);

    // Product 5: Team Admin Add-On - Year 1 (used via dashboard)
    const teamAdminAddonYear1 = await stripe.products.create({
      name: 'Team Admin Add-On - Year 1',
      description: 'Team Admin added by existing admin (commission split applies)',
    });
    const teamAdminAddonYear1Price = await stripe.prices.create({
      product: teamAdminAddonYear1.id,
      unit_amount: 49700, // $497
      currency: 'usd',
    });
    console.log('✅ Team Admin Add-On Year 1:', teamAdminAddonYear1Price.id);

    // Product 6: Team Admin Add-On - Annual Renewal
    const teamAdminAddonRenewal = await stripe.products.create({
      name: 'Team Admin Add-On - Annual Renewal',
      description: 'Annual renewal for Team Admin Add-On',
    });
    const teamAdminAddonRenewalPrice = await stripe.prices.create({
      product: teamAdminAddonRenewal.id,
      unit_amount: 49700, // $497
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log('✅ Team Admin Add-On Renewal:', teamAdminAddonRenewalPrice.id);

    // Product 7: Organization Admin - Year 1
    const orgAdminYear1 = await stripe.products.create({
      name: 'Organization Admin - Year 1',
      description: 'Organization branding, bulk onboarding, see only their network',
    });
    const orgAdminYear1Price = await stripe.prices.create({
      product: orgAdminYear1.id,
      unit_amount: 99700, // $997
      currency: 'usd',
    });
    console.log('✅ Org Admin Year 1:', orgAdminYear1Price.id);

    // Product 8: Organization Admin - Annual Renewal
    const orgAdminRenewal = await stripe.products.create({
      name: 'Organization Admin - Annual Renewal',
      description: 'Annual renewal for Organization Admin',
    });
    const orgAdminRenewalPrice = await stripe.prices.create({
      product: orgAdminRenewal.id,
      unit_amount: 49700, // $497
      currency: 'usd',
      recurring: { interval: 'year' },
    });
    console.log('✅ Org Admin Renewal:', orgAdminRenewalPrice.id);

    console.log('\n✅ All products created successfully!\n');
    console.log('Update these files with the Price IDs:');
    console.log('1. app/api/checkout/main-admin/route.ts - Replace MAIN_ADMIN_YEAR1_PRICE_ID with:', mainAdminYear1Price.id);
    console.log('2. app/api/checkout/team-admin-direct/route.ts - Replace TEAM_ADMIN_DIRECT_YEAR1_PRICE_ID with:', teamAdminYear1Price.id);
    console.log('3. app/api/checkout/org-admin/route.ts - Replace ORG_ADMIN_YEAR1_PRICE_ID with:', orgAdminYear1Price.id);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
  }
}

createProducts();
