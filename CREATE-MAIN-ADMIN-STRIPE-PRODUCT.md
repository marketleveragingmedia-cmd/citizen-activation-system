# Create Main Admin Stripe Product
**Required:** One new product for Main Admin ($1,497)

---

## Quick Manual Creation

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add Product"**
3. Fill in:
   - **Name:** Main Admin Access - Year 1
   - **Description:** Full network control, add Team Admins & Org Admins, see entire network
   - **Pricing:** One-time
   - **Price:** $1,497.00 USD
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`)
6. Update `/app/api/checkout/main-admin/route.ts` line 26:
   ```typescript
   price: 'YOUR_NEW_PRICE_ID_HERE',
   ```

---

## Or Use Stripe CLI

```bash
# Create product
stripe products create \
  --name "Main Admin Access - Year 1" \
  --description "Full network control, add Team Admins & Org Admins, see entire network"

# Create price (replace PRODUCT_ID with the ID from above)
stripe prices create \
  --product PRODUCT_ID \
  --unit-amount 149700 \
  --currency usd

# Copy the price ID and update the code
```

---

## Current Status

✅ **Team Admin Direct** - Using existing: `price_1TaIUNDZhlh84GPr3jQXmUtW`  
✅ **Org Admin** - Using existing: `price_1TaIUNDZhlh84GPrkhnpYJXa`  
❌ **Main Admin** - Needs new product created

After creating, update:
- `/app/api/checkout/main-admin/route.ts` (line 26)
