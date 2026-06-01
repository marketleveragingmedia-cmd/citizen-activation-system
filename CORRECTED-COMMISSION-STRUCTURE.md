# CORRECTED COMMISSION STRUCTURE - FINAL
**Date:** May 27, 2026 11:52 UTC
**Status:** APPROVED BY SAMANTHA - READY TO IMPLEMENT

## ⚠️ CRITICAL CHANGE: COMMISSION SPLIT REVERSED

**Previous (WRONG):**
- Platform: $200
- Customer: $297

**New (CORRECT):**
- Platform: $297 (Team Admin) / $700 (Org Y1) / $297 (Org Y2+)
- Customer: $200 (Team Admin) / $297 (Org Y1) / $200 (Org Y2+)

**Reason:** Platform (Samantha) has expenses/maintenance/support - should get MORE, not less.

---

## NEW COMMISSION STRUCTURE (FINAL)

### Team Admin Add-On ($497/year):
- **Stripe Connected:** Platform $297 / Customer $200
- **No Stripe:** Platform $497 / Customer $0

### Organization Admin:
**Year 1 ($997):**
- **Stripe Connected:** Platform $700 / Customer $297
- **No Stripe:** Platform $997 / Customer $0

**Year 2+ Renewal ($497):**
- **Stripe Connected:** Platform $297 / Customer $200
- **No Stripe:** Platform $497 / Customer $0

---

## STRIPE CONNECT BUTTON TEXT (APPROVED)

```
Connect Stripe to Receive Payments

When you add Team Admins ($497/year each), you'll automatically receive $200 and we'll handle the platform fee ($297).

When you add Organization Admins ($997 Year 1), you'll automatically receive $297 and we'll handle the platform fee ($700). You will automatically receive $200 year 2+ and we'll handle the platform fee ($297) when the Organization Admin renews at $497/yr.
```

---

## DASHBOARD BUTTON TEXT (APPROVED)

**Change:** "+ Add Admin"
**To:** "+ Add Team / Organization Admin"

---

## FILES REQUIRING UPDATES

### 1. Dashboard Components
- `/app/dashboard/StripeConnectButton.tsx`
  - Update text to show new commission amounts
  - Line ~60: Change "$297 per Team Admin" to "$200 per Team Admin and $297/$200 per Org Admin"

- `/app/dashboard/MainAdminDashboard.tsx`
  - Line ~205: Change button text to "+ Add Team / Organization Admin"

### 2. Stripe Webhook (CRITICAL - Commission Logic)
- `/app/api/stripe/webhook/route.ts`
  - **Lines 132-165:** `team_admin_payment` handler
  - **Current:** Transfers $297 to recruiter
  - **Change to:** Transfer $200 to recruiter
  - Platform keeps $297 instead of $200

### 3. Org Admin Webhook (NEW LOGIC NEEDED)
- `/app/api/stripe/webhook/route.ts`
  - **`org_admin_purchase` handler needs commission logic:**
    - Check if recruiter has Stripe Connect
    - Year 1: Transfer $297 to recruiter, Platform keeps $700
    - Year 2+: Transfer $200 to recruiter, Platform keeps $297

### 4. Documentation Files
- `/root/.openclaw/workspace/MEMORY.md` - Update commission structure
- `/root/.openclaw/workspace/memory/2026-05-27-citizen-activation-final.md` - Update all references
- All user guides in `/citizen-activation-system/docs/`

---

## STRIPE SETUP VERIFICATION NEEDED

### ✅ Verify These Are Configured:

#### Stripe Secret Keys (Vercel Environment Variables):
- `STRIPE_SECRET_KEY` - For creating payments
- `STRIPE_PUBLISHABLE_KEY` - For client-side Stripe.js
- `STRIPE_WEBHOOK_SECRET` - For webhook signature verification

#### Stripe Connect:
- **OAuth Client ID** - For Stripe Connect onboarding
- **Connect account creation** - `/api/stripe/create-connect-account`
- **Webhook handles Connect events** - `account.updated`, etc.

#### Stripe Price IDs:
- Team Admin: `price_1TaIUNDZhlh84GPr3jQXmUtW` ($497)
- Org Admin: `price_1TaIUNDZhlh84GPrkhnpYJXa` ($997 Y1, $497 Y2+)
- Main Admin: Dynamic price_data ($1,497 Y1, $997 Y2+)

#### Stripe Webhook Events Required:
- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Renewal
- `account.updated` - Stripe Connect account status

---

## CURRENT WEBHOOK HANDLERS STATUS

### ✅ Working:
1. **main_admin_purchase** - Creates MAIN_ADMIN account + team
2. **team_admin_direct_purchase** - Creates TEAM_ADMIN (Master Admin adds, no split)
3. **org_admin_purchase** - Creates ORG_ADMIN account + org team
4. **team_admin_payment** - Handles Team Admin recruited via dashboard (NEEDS UPDATE)

### ⚠️ Needs Commission Logic Update:
- **team_admin_payment** - Change split from $297/$200 to $200/$297
- **org_admin_purchase** - Add commission split logic (currently no split implemented)

---

## IMPLEMENTATION CHECKLIST

### Step 1: Update Stripe Connect Button Text
- File: `StripeConnectButton.tsx`
- Change display text to approved version above

### Step 2: Update Dashboard Button
- File: `MainAdminDashboard.tsx`
- Change "+ Add Admin" to "+ Add Team / Organization Admin"

### Step 3: Fix Team Admin Commission Split
- File: `app/api/stripe/webhook/route.ts`
- Handler: `team_admin_payment`
- Current transfer: $297 to recruiter
- **Change to:** $200 to recruiter
- Platform keeps $297

### Step 4: Add Org Admin Commission Logic
- File: `app/api/stripe/webhook/route.ts`
- Handler: `org_admin_purchase`
- Add Stripe Connect check
- Year 1: Transfer $297 to recruiter
- Platform keeps $700
- Year 2+ renewals: Transfer $200, Platform keeps $297

### Step 5: Update All Documentation
- MEMORY.md
- 2026-05-27-citizen-activation-final.md
- User guides
- SALES-OVERVIEW.md
- COMMISSION-FLOW.md

### Step 6: Test Stripe Webhooks
- Test Team Admin signup with Stripe Connect
- Test Org Admin signup with Stripe Connect
- Verify correct amounts transferred
- Test renewal webhooks

---

## AFTER IMPLEMENTATION - VERIFY

1. **Dashboard displays correct text**
2. **Button says "+ Add Team / Organization Admin"**
3. **Stripe Connect shows correct commission amounts**
4. **Webhook transfers correct amounts:**
   - Team Admin: $200 to recruiter, $297 to platform
   - Org Admin Y1: $297 to recruiter, $700 to platform
   - Org Admin Y2+: $200 to recruiter, $297 to platform

---

**SAVED - AWAITING "GO" COMMAND TO EXECUTE CHANGES**
