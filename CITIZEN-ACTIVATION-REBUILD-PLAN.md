# CITIZEN ACTIVATION SYSTEM - REBUILD PLAN
**Date:** May 27, 2026 06:23 UTC  
**Status:** APPROVED BY SAMANTHA - READY TO EXECUTE  

---

## Phase 1: Clean Up Existing Checkout Pages

**DELETE:**
- `/app/checkout/team-admin/` (old)
- `/app/checkout/organization-admin/` (old)
- `/app/checkout/white-label/` (old, not needed now)
- `/app/checkout/standalone-team-admin/` (old)
- `/app/api/checkout/team-admin/` (old API)
- `/app/api/checkout/organization-admin/` (old API)
- `/app/api/checkout/white-label/` (old API)
- `/app/api/checkout/create-standalone-team-admin/` (old API)

**KEEP:**
- `/app/checkout/success/`
- `/app/checkout/cancelled/`

---

## Phase 2: Create New Checkout Pages (Based on New Options)

### Option 1: Main Admin Checkout ($1,497 → $997/year)
- **Page:** `/app/checkout/main-admin/page.tsx`
- **API:** `/app/api/checkout/main-admin/route.ts`
- **Stripe Product:** Create new product/price
- **Metadata type:** `main_admin_purchase`

### Option 2: Team Admin Direct Checkout ($497 → $497/year)
- **Page:** `/app/checkout/team-admin-direct/page.tsx`
- **API:** `/app/api/checkout/team-admin-direct/route.ts`
- **Stripe Product:** Create new product/price
- **Metadata type:** `team_admin_direct_purchase`

### Option 3: Team Admin Add-On
- **NOT a checkout page** (handled via dashboard modal - already working)
- Keep existing `/app/dashboard/AddTeamModal.tsx`
- Keep existing `/app/api/create-pending-team-admin/route.ts`

### Option 4: Org Admin Checkout ($997 → $497/year)
- **Page:** `/app/checkout/org-admin/page.tsx`
- **API:** `/app/api/checkout/org-admin/route.ts`
- **Stripe Product:** Create new product/price
- **Metadata type:** `org_admin_purchase`

---

## Phase 3: Build Complete Webhook Handlers

**Update:** `/app/api/stripe/webhook/route.ts`

**Handle these payment types:**
1. ✅ `team_admin_payment` (already working - dashboard modal)
2. 🆕 `main_admin_purchase` (new checkout)
3. 🆕 `team_admin_direct_purchase` (new checkout)
4. 🆕 `org_admin_purchase` (new checkout)

**Each handler creates:**
- Admin account with correct role
- Team structure (if needed)
- Welcome email with credentials
- Confirmation email to Master Admin
- Annual renewal subscription setup

---

## Phase 4: Update Database Schema

**Add/Update:**
- ✅ `MASTER_ADMIN` role (you - sees everything)
- ✅ `MAIN_ADMIN` role (customers - see only their network)
- ✅ `TEAM_ADMIN` role (already exists)
- 🆕 `ORG_ADMIN` role (new - for organizations)

**Team tiers update:**
- Remove `WhiteLabel` tier (future)
- Keep `FullSystem` for Main Admin
- Keep `SoloOrg` for Org Admin
- Update logic for network visibility

---

## Phase 5: Update All Emails

**New email templates needed:**

### 1. Main Admin Welcome Email
- Login credentials
- Features overview
- How to add Team Admins & Org Admins
- Billing: $997/year renewal

### 2. Team Admin (Direct) Welcome Email
- Login credentials
- Features overview
- How to add Team Admins (with commission)
- Billing: $497/year renewal

### 3. Org Admin Welcome Email
- Login credentials
- Organization branding setup
- Bulk onboarding process
- Network visibility (only their members)
- Billing: $497/year renewal

### 4. Commission Earned Emails (already exist, verify)
- Team Admin recruited another Team Admin
- Main Admin/Org Admin recruited Team Admin/Org Admin

### 5. Master Admin Notifications
- New Main Admin purchased
- New Team Admin (direct) purchased
- New Org Admin purchased

### 6. Renewal Reminder Emails (30/15/7/3 days before)
- Main Admin renewal ($997)
- Team Admin renewal ($497)
- Org Admin renewal ($497)

---

## Phase 6: Update Dashboard Logic

### Master Admin Dashboard:
- See ALL networks (Main Admins, Team Admins, Org Admins, Strategic Partners)
- Filter by network/Main Admin
- System-wide stats

### Main Admin Dashboard:
- See only THEIR network
- Team Admins under them
- Org Admins under them
- Strategic Partners in their network
- Add Team Admin button
- Add Org Admin button

### Team Admin Dashboard:
- See Strategic Partners they manage
- Requests assigned to them
- Add Team Admin button (with commission choice)
- Add Org Admin button (with commission choice)

### Org Admin Dashboard:
- See only THEIR organization members
- Branding customization
- Bulk onboarding tools
- Strategic Partners in their org
- Add Team Admin button (with commission choice)

---

## Phase 7: Stripe Products to Create

In Stripe Dashboard, create:

1. **Main Admin - Year 1:** $1,497 one-time
2. **Main Admin - Annual Renewal:** $997/year subscription
3. **Team Admin (Direct) - Year 1:** $497 one-time
4. **Team Admin (Direct) - Annual Renewal:** $497/year subscription
5. **Team Admin (Add-On) - Year 1:** $497 one-time (existing - dashboard modal)
6. **Team Admin (Add-On) - Annual Renewal:** $497/year subscription
7. **Org Admin - Year 1:** $997 one-time
8. **Org Admin - Annual Renewal:** $497/year subscription

---

## Execution Order:

1. ✅ Delete old checkout pages/APIs
2. ✅ Update database schema (add MASTER_ADMIN, ORG_ADMIN roles)
3. ✅ Create Stripe products/prices
4. ✅ Build new checkout pages (Main Admin, Team Admin Direct, Org Admin)
5. ✅ Build complete webhook handlers for all 4 payment types
6. ✅ Update email templates
7. ✅ Update dashboard logic for role-based visibility
8. ✅ Test entire flow end-to-end
9. ✅ Deploy to Vercel

---

## Reference: Final Pricing Structure

### OPTION 1: MAIN ADMIN
- **Price:** $1,497 Year 1, then $997/year
- **Added by:** Master Admin (Samantha) only
- **Revenue:** 100% to Platform
- **Gets:** Full network control, can add Team Admins & Organization Admins, see their entire network including ALL Request for Invites & Status & Strategic Partners

### OPTION 2: TEAM ADMIN (Direct)
- **Price:** $497 Year 1, then $497/year
- **Added by:** Master Admin (Samantha) only
- **Revenue:** 100% to Platform
- **Gets:** Manage Strategic Partners, oversee requests, Can Add-On Team Admins & Organization Admins

### OPTION 3: TEAM ADMIN (Add-On/Recruited)
- **Price:** $497 Year 1, then $497/year
- **Added by:** Master Admin, Main Admin, Team Admin, or Org Admin
- **Revenue Split:**
  - Platform: $200
  - Recruiter: $297 (if Stripe Connect enabled)
  - If no Stripe Connect OR added by Master Admin: Platform keeps $497 (100%)
- **Gets:** Same as Option 2, but recruited by existing admin

### OPTION 4: ORG ADMIN (Add-On)
- **Price:** $997 Year 1, then $497/year
- **Added by:** Master Admin, Main Admin, or Team Admin
- **Revenue Split:**
  - **Year 1:** Platform $700 / Recruiter $297 (if Stripe Connect)
  - **Year 2+:** Platform $200 / Recruiter $297 (if Stripe Connect)
  - If no Stripe Connect OR added by Master Admin: Platform keeps full amount
- **Gets:** Organization Branding, Can Only See their Network/Members, for Organization/Groups/Communities with 100's, 1,000's of members already

---

**Last Updated:** May 27, 2026 - 06:23 UTC  
**Next Step:** Await explicit execution approval from Samantha
