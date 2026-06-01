# IMPLEMENTATION ROADMAP - CITIZEN ACTIVATION SYSTEM
**Date:** June 1, 2026 04:46 UTC  
**Status:** 📋 READY FOR IMPLEMENTATION

---

## 🎯 **PHASE 1: SUBDOMAIN SYSTEM** (HIGH PRIORITY)

### **Goal:** All admin types get unique subdomains with ownership-based routing

### **Database Changes:**
- [ ] Add `subdomain` field to `Admin` table
  - Type: `String` (unique, lowercase)
  - Validation: 3-20 chars, alphanumeric + hyphens
  - Index: Unique constraint (case-insensitive)
- [ ] Add `initiator_id` field to `Request` table
  - Type: `String` (foreign key to Admin.id)
  - Purpose: Track which admin's link the request came from
  - Rule: Cannot reassign if `initiator_id ≠ current_admin.id`

### **API Routes:**
- [ ] `/api/subdomain/validate` - Check subdomain availability
- [ ] `/api/subdomain/reserve` - Claim subdomain during account creation
- [ ] `/api/request/route` - Route request based on subdomain
  - Extract subdomain from URL
  - Find admin by subdomain
  - Set `initiator_id = admin.id`
  - Apply Round Robin within that admin's Strategic Partners
- [ ] Update `/api/update-status` - Block reassignment if not initiator

### **UI Changes:**
- [ ] **Master Admin Create Account** (`/master-admin/create-account`)
  - Add subdomain input field
  - Real-time validation (3-20 chars, format check, availability)
  - Soft warning at 15+ characters
  
- [ ] **All Checkout Pages**
  - Add subdomain field to Main Admin, Team Admin Direct, Org Admin checkouts
  - Same validation rules
  
- [ ] **Dashboard "Add Team Admin" Modal**
  - Add subdomain field when sending invitation
  - Validate before creating payment link

- [ ] **Admin Profile/Settings**
  - Display subdomain (read-only after creation)
  - Show full URL: `subdomain.citizenactivation.com`

### **Routing Logic:**
- [ ] Create middleware for subdomain detection
- [ ] Route `/request` endpoint based on subdomain
- [ ] Track initiator in request record
- [ ] Block reassignment UI if `request.initiator_id ≠ current_admin.id`

---

## 🎯 **PHASE 2: ROUND ROBIN - EVEN ROTATION** (HIGH PRIORITY)

### **Goal:** Distribute requests evenly across Strategic Partners (not slot-count priority)

### **Current Logic (CHANGE THIS):**
```typescript
// OLD: Sort by most available slots first
partners.sort((a, b) => b.availableSlots - a.availableSlots)
const assignedPartner = partners[0]
```

### **New Logic (IMPLEMENT THIS):**
```typescript
// NEW: Even rotation across all with slots
const availablePartners = partners.filter(p => p.availableSlots > 0)

// Get last assigned partner index for this admin
const lastIndex = await getLastAssignedIndex(adminId)

// Rotate to next partner
const nextIndex = (lastIndex + 1) % availablePartners.length
const assignedPartner = availablePartners[nextIndex]

// Save next index for next request
await saveLastAssignedIndex(adminId, nextIndex)
```

### **Implementation:**
- [ ] Add `last_assigned_index` field to `Admin` table (or separate tracking table)
- [ ] Update `/api/request/assign` logic
- [ ] When partner fills up → apply "Full Logic" or "Increase Slots Logic"
- [ ] Reset rotation index when new Strategic Partner added

---

## 🎯 **PHASE 3: REMOVE MLM TERMINOLOGY** (MEDIUM PRIORITY)

### **Goal:** Replace all recruiting/commission language with neutral terms

### **Find & Replace (System-Wide):**

| ❌ OLD TERM | ✅ NEW TERM |
|-------------|-------------|
| "Recruit" / "Recruiting" | "Add Team Admin" / "Adding" |
| "Commission earned" | "Payment for adding Team Admin" |
| "Downline" / "Upline" | "Network" / "Team" |
| "Referral commission" | "Payment split" |
| "You recruited" | "You added" |

### **Files to Update:**
- [ ] `app/dashboard/AddTeamModal.tsx` - Button text, modal copy
- [ ] `app/dashboard/MainAdminDashboard.tsx` - Stats, labels
- [ ] `app/api/stripe/webhook/route.ts` - Email templates
- [ ] All email templates in webhook handler
- [ ] Any user-facing guides/documentation

### **Keep "Commission" ONLY in:**
- Internal payment processing code
- Stripe metadata (backend only)
- Developer docs (not user-facing)

---

## 🎯 **PHASE 4: SEARCH/AUTOCOMPLETE (HIGH PRIORITY)

### **Goal:** Replace drop-downs with search for 100s/1,000s of admins

### **Problem:**
- Current reassign modal uses drop-down
- Breaks with 100+ Team Admins
- Unusable for large networks

### **Solution:**
- [ ] Create `/api/admins/search` endpoint
  - Accept: `?q=john&role=TEAM_ADMIN&teamId=xyz`
  - Return: Array of matching admins with slug, name, active partner count
  
- [ ] Replace `<select>` with search input + results list
  - Type to filter (debounced search)
  - Show: Name (@slug) - X active partners
  - Click to select
  
- [ ] Update `ReassignModal.tsx` to use search
  - Only allow reassignment if `request.initiator_id === current_admin.id`
  - Show warning if initiator mismatch

---

## 🎯 **PHASE 5: DEACTIVATION LOGIC** (MEDIUM PRIORITY)

### **Goal:** Handle subdomain deactivation without losing Strategic Partners

### **When Admin Deactivated:**
- [ ] Set `admin.status = 'Inactive'`
- [ ] Block new requests via subdomain
  - Middleware: Check `admin.status` before routing
  - Return 404 or "This subdomain is no longer active" page
- [ ] Keep Strategic Partners assigned to deactivated admin
  - Do NOT reassign to others
  - Main Admin can still see them (historical data)
- [ ] Keep request history visible to Main Admin

### **UI Changes:**
- [ ] Deactivated admin badge on dashboard
- [ ] Historical data view (read-only)
- [ ] Blocked subdomain landing page

---

## 🎯 **PHASE 6: MAIN ADMIN VISIBILITY DASHBOARD** (LOW PRIORITY)

### **Goal:** Main Admin sees all requests, can only reassign owned ones

### **Dashboard Features:**
- [ ] "All Requests" view (system-wide)
  - Show: Request, Assigned To, Initiator (subdomain), Status, Days Since Submit
  - Filter: By status, by initiator, by assigned partner
  - Badge: "Delayed" if 3+ days assigned

- [ ] "My Requests" view (initiated by Main Admin's link)
  - Show: Only requests from `john.citizenactivation.com`
  - Allow: Reassignment, status updates

- [ ] Request detail page
  - Show: Full history, initiator, cannot reassign if not owner
  - Warning: "This request came from Jane's link - you cannot reassign it"

---

## 🎯 **PHASE 7: DELAYED REQUEST ALERTS** (LOW PRIORITY)

### **Goal:** Alert admins when requests stall for 3+ days

### **Implementation:**
- [ ] Background job (cron/scheduled task)
  - Check: Requests in "Assigned" status for 3+ days
  - Send: Email/notification to admin who initiated request
  - Optional: CC Main Admin (for visibility)

- [ ] Dashboard notification badge
  - Show: "⚠️ 5 delayed requests" on dashboard
  - Link: Filter to delayed requests only

---

## 🎯 **PHASE 8: BRANDING & CUSTOMIZATION** (MEDIUM PRIORITY)

### **Goal:** Organization Admin ONLY gets white-label branding

### **Database Changes:**
- [ ] Add branding fields to Team table:
  - `logoUrl` (String, nullable) - Already exists ✅
  - `organizationName` (String, nullable)
  - `welcomeMessage` (String, nullable, max 500 chars)
  - `primaryColor` (String, nullable, hex format)
  - `secondaryColor` (String, nullable, hex format)
  - `hidePlatformBranding` (Boolean, default false)

### **Org Admin Account Creation:**
- [ ] Add logo upload field (cloud storage: S3/Cloudinary/Vercel Blob)
- [ ] Add organization name field (required)
  - Replaces "Citizen Activation System" on their subdomain
- [ ] Add welcome message textarea (optional)
  - Shown on login page + request form
- [ ] Phase 2: Add color pickers (primary/secondary)
- [ ] Preview card: "This is how your branding will look"

### **Subdomain Page Logic:**
- [ ] Detect admin role from subdomain lookup
- [ ] If `role === 'ORG_ADMIN'`: Load branding from database
  - Display organization logo
  - Replace platform name with organization name
  - Show custom welcome message
  - Apply custom colors (CSS variables)
  - Hide platform footer if `hidePlatformBranding === true`
- [ ] If `role === 'MAIN_ADMIN' || role === 'TEAM_ADMIN'`: Use platform branding
  - Display Citizen Activation logo
  - Standard welcome text
  - Platform colors (green theme)

### **Email Templates:**
- [ ] Phase 2: Dynamic email branding for Org Admin
  - Logo in email header
  - Organization name in signature
  - Brand colors in template

### **Blocked for Main Admin & Team Admin:**
- [ ] Hide branding fields in account creation
- [ ] Show message: "Platform branding will be used for your subdomain"
- [ ] Do NOT allow logo/color uploads

---

## 📋 **IMPLEMENTATION ORDER**

### **Week 1:**
1. ✅ Phase 1: Subdomain system (database + API + validation)
2. ✅ Phase 2: Round Robin even rotation
3. ✅ Phase 4: Search/autocomplete (replace drop-downs)

### **Week 2:**
4. ✅ Phase 3: Remove MLM terminology
5. ✅ Phase 5: Deactivation logic

### **Week 3:**
6. ✅ Phase 6: Main Admin visibility dashboard
7. ✅ Phase 7: Delayed request alerts

---

## 🚧 **BLOCKED / WAITING**

### **None Currently**
- All requirements clarified
- Payment structure verified
- Subdomain rules finalized
- Ready for implementation

---

**Next Action:** Begin Phase 1 (Subdomain System) database migration and API routes.
