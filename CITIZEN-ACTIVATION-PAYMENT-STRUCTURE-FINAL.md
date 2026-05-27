# CITIZEN ACTIVATION SYSTEM - DEFINITIVE PAYMENT STRUCTURE
**Last Updated:** May 27, 2026 04:53 UTC  
**Status:** ✅ IMPLEMENTED IN CODE  
**System:** hub.citizenactivation.com

---

## ⚠️ THIS IS THE TRUTH - BASED ON ACTUAL CODE

This document reflects what's ACTUALLY implemented in the system code, not wishful thinking.

---

## CURRENT IMPLEMENTATION STATUS

### ✅ What's Actually Built:
1. **Team Admin Commission Split** - FULLY IMPLEMENTED
   - Code location: `app/api/stripe/webhook/route.ts` (lines 132-165)
   - UI location: `app/dashboard/AddTeamModal.tsx`
   - Stripe transfer: Automatic $297 to recruiter when they have Stripe Connect
   - Choice toggle: Recruiter can forfeit commission (goes to White Label Owner)

### ❌ What's NOT Yet Built:
1. **Organization Admin tier** - Does NOT exist in code
2. **$997 Organization Admin pricing** - Does NOT exist
3. **White Label system** - Partially exists but NOT fully functional
4. **Strategic Partner → Organization Admin promotion** - Does NOT exist

---

## WHAT ACTUALLY WORKS TODAY (May 27, 2026)

### TIER 1: TEAM ADMIN (The Only Working Product)

**Pricing:**
- **Initial Payment:** $497 (one-time)
- **Annual Renewal:** $497/year (Year 2+)

**Who Can Add Team Admins:**
1. **Main Admin (Samantha/Citizen Activation System Owner)**
   - Revenue: $497 (100% - you keep everything)
   
2. **Team Admin (Recruiter Adding Another Team Admin)**
   - New Team Admin pays: $497
   - **IF Recruiter wants commission AND has Stripe Connect:**
     - Recruiter receives: $297 (via automatic Stripe transfer)
     - White Label Owner keeps: $200
   - **IF Recruiter forfeits commission OR no Stripe Connect:**
     - White Label Owner keeps: $497 (100%)

**Code Evidence:**
```typescript
// From app/api/stripe/webhook/route.ts line 138
await stripe.transfers.create({
  amount: 29700, // $297 in cents
  currency: 'usd',
  destination: recruiter.team.stripeAccountId!,
  description: `Commission for Team Admin: ${adminFullName}`,
```

**Commission Choice UI:**
```typescript
// From app/dashboard/AddTeamModal.tsx
wantsCommission: true // Default: wants to earn commission

// UI shows two radio options:
// 💰 I want to earn $297 commission
// 🎁 I want to forfeit my commission (goes to system owner)
```

---

## DATABASE SCHEMA (ACTUAL)

**From `prisma/schema.prisma`:**

### Admin Roles:
- `MAIN_ADMIN` - White Label Owner (Samantha)
- `TEAM_ADMIN` - Team Admins added to the system

### Tier Types:
- `FullSystem` - Default team tier
- `SoloOrg` - Solo organization (not fully implemented)

### Team Model Fields (Revenue Related):
```prisma
model Team {
  stripeAccountId String? @unique  // For Stripe Connect payouts
  tierType        TierType @default(FullSystem)
  // ... other fields
}
```

**Note:** There is NO `organizationAdmin` role or separate Organization Admin pricing tier in the actual schema.

---

## STRIPE PAYMENT FLOW (ACTUAL)

### Step 1: Recruiter Creates Invitation
1. Team Admin logs into dashboard
2. Clicks "+ Add Team Admin"
3. Fills in new Team Admin details
4. Chooses commission preference:
   - ✅ Earn $297 commission (requires Stripe Connect)
   - ❌ Forfeit commission (system owner keeps $497)

### Step 2: Payment Link Sent
- System sends email to NEW Team Admin with Stripe checkout link
- Metadata attached to Stripe session:
  ```typescript
  metadata: {
    type: 'team_admin_payment',
    recruiterId: recruiter.id,
    recruiterTeamId: recruiter.teamId,
    recruiterWantsCommission: 'true' or 'false',
    teamAdminData: JSON.stringify({...})
  }
  ```

### Step 3: New Team Admin Pays
- New Team Admin clicks link
- Pays $497 via Stripe checkout
- Payment goes to White Label Owner's Stripe account

### Step 4: Webhook Fires (checkout.session.completed)
**Code location:** `app/api/stripe/webhook/route.ts`

1. **Create Team Admin account:**
   ```typescript
   const newAdmin = await prisma.admin.create({
     data: {
       teamId: recruiterTeamId,
       firstName: teamAdminData.adminFirstName,
       lastName: teamAdminData.adminLastName,
       email: teamAdminData.adminEmail,
       role: 'TEAM_ADMIN',
       status: 'Active'
     }
   })
   ```

2. **Determine if commission is earned:**
   ```typescript
   const hasStripe = !!recruiter.team.stripeAccountId
   const recruiterWantsCommission = session.metadata.recruiterWantsCommission === 'true'
   const earnedCommission = recruiterWantsCommission && hasStripe
   ```

3. **Transfer commission if earned:**
   ```typescript
   if (earnedCommission) {
     await stripe.transfers.create({
       amount: 29700, // $297
       currency: 'usd',
       destination: recruiter.team.stripeAccountId!,
       description: `Commission for Team Admin: ${adminFullName}`,
     })
   }
   ```

4. **Send confirmation emails** to both new Team Admin and recruiter

---

## REVENUE SCENARIOS (ACTUAL)

### Scenario A: YOU (Main Admin) Add 10 Team Admins Directly
- **Year 1:** 10 × $497 = **$4,970**
- **Year 2+:** 10 × $497/year = **$4,970/year**
- **Your Total:** 100% of revenue

### Scenario B: Team Admin Adds 10 Team Admins (Earns Commission)
**Requirements:** Team Admin has Stripe Connect enabled

**Per Team Admin Added:**
- New Team Admin pays: $497
- **Split:**
  - Team Admin (recruiter): $297
  - YOU (White Label Owner): $200

**For 10 Team Admins:**
- **Year 1:**
  - You receive: 10 × $200 = **$2,000**
  - Recruiter receives: 10 × $297 = $2,970
- **Year 2+ (renewals):**
  - Same split continues
  - You receive: 10 × $200 = **$2,000/year**
  - Recruiter receives: 10 × $297 = $2,970/year

### Scenario C: Team Admin Adds 10 Team Admins (Forfeits Commission)
**Conditions:** Team Admin chooses to forfeit OR doesn't have Stripe Connect

**For 10 Team Admins:**
- **Year 1:**
  - You receive: 10 × $497 = **$4,970**
  - Recruiter receives: $0
- **Year 2+:**
  - You receive: 10 × $497 = **$4,970/year**
  - Recruiter receives: $0

---

## WHAT'S MISSING / NOT IMPLEMENTED

### 1. Organization Admin Tier
**Planned pricing (not built):**
- Year 1: $997
- Year 2+: $497/year

**Status:** ❌ NOT IN DATABASE SCHEMA  
**Status:** ❌ NO CODE TO CREATE THIS TIER  
**Status:** ❌ NO STRIPE PRODUCTS FOR THIS TIER

### 2. White Label System
**Planned pricing:**
- Year 1: $1,997 (promo) or $2,997 (regular)
- Year 2+: $497/year

**Status:** ⚠️ PARTIAL - Code exists but NOT functional  
**Code location:** `app/api/checkout/white-label/route.ts` exists  
**Problem:** No way to actually create separate White Label systems  
**Problem:** No admin panel for White Label owners

### 3. Strategic Partner Promotion
**Concept:** Strategic Partners can be promoted to Organization Admin

**Status:** ❌ NOT IMPLEMENTED  
**Database:** Strategic Partners exist, but no promotion path  
**Problem:** Organization Admin tier doesn't exist anyway

---

## RECONCILIATION WITH PRIOR DOCUMENTS

### From MEMORY.md (May 26, 2026):
> "Implemented $297/$200 commission split for Team Admin recruitment"

**Status:** ✅ TRUE - This is implemented

> "Full documentation added to all guides"

**Status:** ❌ FALSE - Documentation was claimed but files don't exist:
- `docs/SALES-OVERVIEW.md` - Does NOT exist
- `docs/COMMISSION-FLOW.md` - Does NOT exist
- `docs/SYSTEM-SUMMARY.md` - Does NOT exist

### From mlm-command-center-deploy/memory/CITIZEN-ACTIVATION-PAYMENT-STRUCTURE-FINAL.md:
> Multiple tiers with complex splits

**Status:** ⚠️ ASPIRATIONAL - Most of this is NOT implemented

**What's real from that doc:**
- Team Admin pricing: $497 (Year 1 + renewals) ✅
- Commission split: $297/$200 ✅
- Everything else: ❌ Not built

---

## STRIPE PRODUCTS (WHAT'S ACTUALLY NEEDED)

### Currently Required:
1. **Team Admin - Year 1** - $497 one-time
   - Product name: "Team Admin Access - Year 1"
   - Price: $497
   - Type: One-time payment
   
2. **Team Admin - Renewal** - $497/year
   - Product name: "Team Admin - Annual Renewal"
   - Price: $497
   - Type: Recurring subscription (yearly)

### Future (When Built):
3. Organization Admin - Year 1 - $997
4. Organization Admin - Renewal - $497/year
5. White Label - Year 1 (Promo) - $1,997
6. White Label - Year 1 (Regular) - $2,997
7. White Label - Renewal - $497/year

---

## QUESTIONS TO RESOLVE

### 1. Who can add Organization Admin accounts?
**Current answer:** Nobody - the tier doesn't exist

**Need to decide:**
- Main Admin only?
- Self-service signup?
- Team Admin can promote Strategic Partners?

### 2. How does White Label system work?
**Current state:** Code exists but incomplete

**Need to clarify:**
- Separate databases per White Label?
- Subdomain routing?
- Separate Stripe accounts or Connect?
- Admin dashboard for White Label owners?

### 3. Annual renewals - how are they handled?
**Current answer:** Unclear - no renewal code visible

**Need to implement:**
- Stripe subscription products
- Renewal reminder emails
- Grace period logic
- Downgrade/suspension on non-payment

---

## ACTION ITEMS

### Immediate (To Match Current Reality):
1. ✅ Document Team Admin commission split (this document)
2. ❌ Create missing docs:
   - `docs/SALES-OVERVIEW.md`
   - `docs/COMMISSION-FLOW.md`
   - `docs/TEAM-ADMIN-GUIDE.md`
3. ❌ Test commission flow end-to-end
4. ❌ Set up Stripe test mode webhooks

### Medium-Term (To Build What's Planned):
1. ❌ Implement Organization Admin tier
2. ❌ Build White Label system infrastructure
3. ❌ Create Strategic Partner → Org Admin promotion flow
4. ❌ Set up annual renewal subscriptions

### Documentation Cleanup:
1. ❌ Archive or update outdated payment structure docs in `mlm-command-center-deploy/memory/`
2. ❌ Create single source of truth for pricing
3. ❌ Build public-facing sales page with accurate info

---

## NOTES FOR SAMANTHA

**What you told me on May 22, 2026:**
- 3-tier structure (Team Admin / Organization Admin / White Label)
- Complex commission splits
- Year 1 upfront, Year 2+ $497 for all

**What's actually built:**
- 1-tier structure (Team Admin only)
- Simple commission split ($297/$200)
- Year 1 $497, renewals unclear

**Gap between vision and implementation:**
- LARGE - Most of the complex structure is not built yet

**Recommendation:**
Either:
1. **Option A:** Build the missing pieces (Org Admin tier, White Label system)
2. **Option B:** Simplify the vision to match what's built (Team Admin only for now)
3. **Option C:** Create phased rollout plan (Team Admin → Org Admin → White Label)

---

## FINAL SUMMARY

**What works today:**
- Team Admin accounts: $497 (Year 1 + renewals)
- Commission split: $297 to recruiter, $200 to you
- Automatic Stripe transfers for commission
- Choice to forfeit commission

**What doesn't work today:**
- Organization Admin tier (doesn't exist)
- White Label system (partially exists, not functional)
- Strategic Partner promotions (no path exists)
- Annual renewal subscriptions (unclear implementation)

**Bottom line:**
You have a working Team Admin recruitment system with commission splits. Everything else is planned but not implemented.

---

**Last verified against codebase:** May 27, 2026 04:53 UTC  
**Files audited:**
- `app/api/stripe/webhook/route.ts`
- `app/dashboard/AddTeamModal.tsx`
- `app/api/create-pending-team-admin/route.ts`
- `prisma/schema.prisma`
- `lib/stripe.ts`
