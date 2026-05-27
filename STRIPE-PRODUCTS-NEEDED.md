# Stripe Products to Create - New Pricing Structure
**Date:** May 27, 2026  
**Status:** Needs Creation

---

## Product 1: Main Admin - Year 1
- **Name:** Main Admin Access - Year 1
- **Description:** Full network control, add Team Admins & Org Admins, see entire network
- **Type:** One-time payment
- **Amount:** $1,497.00 USD
- **Currency:** USD

---

## Product 2: Main Admin - Annual Renewal
- **Name:** Main Admin - Annual Renewal
- **Description:** Annual renewal for Main Admin access
- **Type:** Recurring subscription
- **Interval:** Yearly
- **Amount:** $997.00 USD
- **Currency:** USD

---

## Product 3: Team Admin Direct - Year 1
- **Name:** Team Admin Direct Access - Year 1
- **Description:** Manage Strategic Partners, oversee requests, can add Team Admins & Org Admins
- **Type:** One-time payment
- **Amount:** $497.00 USD
- **Currency:** USD

---

## Product 4: Team Admin Direct - Annual Renewal
- **Name:** Team Admin Direct - Annual Renewal
- **Description:** Annual renewal for Team Admin Direct access
- **Type:** Recurring subscription
- **Interval:** Yearly
- **Amount:** $497.00 USD
- **Currency:** USD

---

## Product 5: Team Admin Add-On - Year 1
- **Name:** Team Admin Add-On - Year 1
- **Description:** Team Admin added by existing admin (commission split applies)
- **Type:** One-time payment
- **Amount:** $497.00 USD
- **Currency:** USD
- **Note:** This is created dynamically via dashboard modal (already working)

---

## Product 6: Team Admin Add-On - Annual Renewal
- **Name:** Team Admin Add-On - Annual Renewal
- **Description:** Annual renewal for Team Admin Add-On
- **Type:** Recurring subscription
- **Interval:** Yearly
- **Amount:** $497.00 USD
- **Currency:** USD

---

## Product 7: Organization Admin - Year 1
- **Name:** Organization Admin - Year 1
- **Description:** Organization branding, bulk onboarding, see only their network
- **Type:** One-time payment
- **Amount:** $997.00 USD
- **Currency:** USD

---

## Product 8: Organization Admin - Annual Renewal
- **Name:** Organization Admin - Annual Renewal
- **Description:** Annual renewal for Organization Admin
- **Type:** Recurring subscription
- **Interval:** Yearly
- **Amount:** $497.00 USD
- **Currency:** USD

---

## Commission Splits (Applied via Stripe Connect Transfer)

### Team Admin Add-On ($497):
- Platform: $200
- Recruiter: $297 (if Stripe Connect enabled)

### Org Admin Year 1 ($997):
- Platform: $700
- Recruiter: $297 (if Stripe Connect enabled)

### Org Admin Year 2+ ($497):
- Platform: $200
- Recruiter: $297 (if Stripe Connect enabled)

---

## After Creation - Update Code With Price IDs

Once products are created in Stripe, update these files with the new Price IDs:

1. `/app/api/checkout/main-admin/route.ts` - Main Admin Year 1 price
2. `/app/api/checkout/team-admin-direct/route.ts` - Team Admin Direct Year 1 price
3. `/app/api/checkout/org-admin/route.ts` - Org Admin Year 1 price
4. `/app/api/stripe/webhook/route.ts` - All renewal subscription prices

---

## Manual Creation Steps (Stripe Dashboard)

1. Go to https://dashboard.stripe.com/products
2. Click "+ Add Product"
3. Enter product name and description
4. For one-time: Select "One-time"
5. For recurring: Select "Recurring" → Billing period: Yearly
6. Enter price amount
7. Click "Save product"
8. Copy the Price ID (starts with `price_`)
9. Repeat for all 8 products

---

**Next Step:** Provide Stripe Secret Key OR create products manually and provide Price IDs
