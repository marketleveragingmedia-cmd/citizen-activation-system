# Stripe Products Setup Instructions
**Date:** May 27, 2026  
**Status:** Ready to execute

---

## Option 1: Run Automated Script (Recommended)

### Step 1: Get Your Stripe Secret Key
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_live_` for production or `sk_test_` for testing)

### Step 2: Run the Script
```bash
cd /root/.openclaw/workspace/citizen-activation-system
STRIPE_SECRET_KEY="sk_live_YOUR_KEY_HERE" node scripts/create-stripe-products.js
```

### Step 3: Update Code with Price IDs
The script will output the Price IDs. Update these files:

1. **`app/api/checkout/main-admin/route.ts`**
   - Replace `MAIN_ADMIN_YEAR1_PRICE_ID` with the actual Price ID

2. **`app/api/checkout/team-admin-direct/route.ts`**
   - Replace `TEAM_ADMIN_DIRECT_YEAR1_PRICE_ID` with the actual Price ID

3. **`app/api/checkout/org-admin/route.ts`**
   - Replace `ORG_ADMIN_YEAR1_PRICE_ID` with the actual Price ID

---

## Option 2: Manual Creation (Stripe Dashboard)

See `STRIPE-PRODUCTS-NEEDED.md` for detailed product specifications.

1. Go to https://dashboard.stripe.com/products
2. Create each of the 8 products manually
3. Copy the Price IDs
4. Update the checkout route files

---

## After Creating Products

### Update Vercel Environment Variables:
```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

### Redeploy:
```bash
cd /root/.openclaw/workspace/citizen-activation-system
git add .
git commit -m "Add new checkout pages and webhook handlers"
git push origin main
```

Vercel will auto-deploy.

---

## Price IDs Reference (To Be Filled After Creation)

```
MAIN_ADMIN_YEAR1_PRICE_ID=price_xxxxxxxxxxxxx
MAIN_ADMIN_RENEWAL_PRICE_ID=price_xxxxxxxxxxxxx
TEAM_ADMIN_DIRECT_YEAR1_PRICE_ID=price_xxxxxxxxxxxxx
TEAM_ADMIN_DIRECT_RENEWAL_PRICE_ID=price_xxxxxxxxxxxxx
TEAM_ADMIN_ADDON_YEAR1_PRICE_ID=price_xxxxxxxxxxxxx
TEAM_ADMIN_ADDON_RENEWAL_PRICE_ID=price_xxxxxxxxxxxxx
ORG_ADMIN_YEAR1_PRICE_ID=price_xxxxxxxxxxxxx
ORG_ADMIN_RENEWAL_PRICE_ID=price_xxxxxxxxxxxxx
```

---

**Next Step:** Run the script or create products manually, then update the code with real Price IDs.
