# ORGANIZATION ADMIN - COMPLETE IMPLEMENTATION PLAN

**Date:** June 1, 2026  
**Status:** Ready for Development

---

## 🎯 GOAL: Separate Organization Admin Dashboard + Full Branding

**Current Problem:**
- Org Admin uses TeamAdminDashboard (shared component)
- Branding fields exist in database but aren't used
- No branding UI during account creation
- No custom emails, colors, or welcome messages

**Solution:**
- Create dedicated `OrganizationAdminDashboard.tsx`
- Add all branding fields to database
- Build branding UI for checkout/account creation
- Apply branding to subdomain pages and emails

---

## 📊 DATABASE CHANGES

### **Add to Team table:**

```prisma
model Team {
  id                    String     @id @default(cuid())
  name                  String
  adminId               String
  tierType              TierType   @default(FullSystem)
  subdomain             String?    @unique
  customDomain          String?
  logoUrl               String?
  
  // NEW BRANDING FIELDS (Org Admin only)
  organizationName      String?    // Display name (overrides platform)
  welcomeMessage        String?    // Custom text for subdomain pages
  primaryColor          String?    // Hex color: "#1E8E5A"
  secondaryColor        String?    // Hex color: "#065F46"
  emailFromName         String?    // "Grace Church Activation Team"
  hidePlatformBranding  Boolean    @default(false)
  
  stripeAccountId       String?    @unique
  autoAssignEnabled     Boolean    @default(true)
  createdDate           DateTime   @default(now())
  status                TeamStatus @default(Active)

  admins                Admin[]
  strategicPartners     StrategicPartner[]
  requests              Request[]

  @@map("teams")
}
```

---

## 🏗️ FILES TO CREATE

### **1. `/app/dashboard/OrganizationAdminDashboard.tsx`**

**Features:**
- Custom logo in header (from `team.logoUrl`)
- Organization name (from `team.organizationName`)
- Apply custom colors (from `team.primaryColor`, `team.secondaryColor`)
- Stats: Total requests, activated, Strategic Partners
- "Add Team Admin" button
- "Add Strategic Partner" button
- "Branding Settings" button (new)
- Request list (only their network)
- Clean, professional layout

**Different from Team Admin:**
- Shows organization branding prominently
- No reference to "team" - uses "organization"
- Branding settings panel
- Different color scheme (uses org colors)

---

### **2. `/app/dashboard/BrandingSettingsModal.tsx`**

**Features:**
- Logo upload (drag-and-drop or file picker)
- Organization name input
- Welcome message textarea (500 char max)
- Primary color picker
- Secondary color picker
- Email from name input
- "Hide platform branding" toggle
- Live preview card
- Save button

---

### **3. `/app/api/branding/upload-logo/route.ts`**

**Features:**
- Accept image upload (PNG, JPG, SVG)
- Validate file size (max 2MB)
- Upload to cloud storage (Vercel Blob or AWS S3)
- Return public URL
- Save to `team.logoUrl`

---

### **4. `/app/api/branding/update/route.ts`**

**Features:**
- Update team branding fields
- Validate hex colors
- Org Admin only (check role)
- Return updated team object

---

### **5. Update `/app/dashboard/page.tsx`**

**Change:**
```typescript
// OLD: Org Admin uses TeamAdminDashboard
if (data.type === 'org_admin' && 'team' in data) {
  return (
    <TeamAdminDashboard
      team={data.team}
      isOrgAdmin={true}
    />
  )
}

// NEW: Org Admin uses OrganizationAdminDashboard
if (data.type === 'org_admin' && 'team' in data) {
  return (
    <OrganizationAdminDashboard
      team={data.team}
      stats={data.stats}
      recentRequests={data.recentRequests}
      userName={session.user.name}
      hasStripeAccount={data.hasStripeAccount}
      stripeAccountId={data.stripeAccountId}
    />
  )
}
```

---

## 🎨 BRANDING APPLICATION

### **Where Branding Appears:**

#### **1. Organization Admin Dashboard**
- Logo in header
- Organization name as title
- Custom colors (buttons, headers, links)
- No "Powered by Citizen Activation" footer (if hidden)

#### **2. Subdomain Request Pages** (`myorg.citizenactivation.com/request`)
- Organization logo (top center)
- Organization name (heading)
- Welcome message (below logo)
- Custom colors (form buttons, links)
- Footer: "Powered by Citizen Activation" (if not hidden)

#### **3. Subdomain Login Pages** (`myorg.citizenactivation.com/login`)
- Organization logo
- "[Org Name] Strategic Partner Login"
- Custom colors
- Hide platform footer (optional)

#### **4. Email Templates**
- Logo in email header
- Organization name in subject/body
- "You've been invited by [Organization Name]"
- Custom from name: "[Org Name] Activation Team"

#### **5. Strategic Partner Dashboard** (when they log in via org subdomain)
- Organization logo + name in header
- Custom colors
- Feels like "[Org Name]'s system"

---

## 🛠️ IMPLEMENTATION PHASES

### **PHASE 1: Create Separate Dashboard** (Priority 1)
- [ ] Create `OrganizationAdminDashboard.tsx`
- [ ] Update `app/dashboard/page.tsx` routing
- [ ] Add branding display (logo, org name)
- [ ] Copy Team Admin features (add team admin, add partner, requests)
- [ ] Test: Org Admin sees new dashboard, Team Admin sees old

### **PHASE 2: Add Branding Fields to Database** (Priority 1)
- [ ] Add migration for new Team fields
- [ ] Run migration on production
- [ ] Update Prisma client
- [ ] Test: Fields exist and can be queried

### **PHASE 3: Branding Settings UI** (Priority 2)
- [ ] Create `BrandingSettingsModal.tsx`
- [ ] Add "Branding Settings" button to Org Admin dashboard
- [ ] Logo upload API endpoint
- [ ] Branding update API endpoint
- [ ] Live preview functionality

### **PHASE 4: Apply Branding to Subdomain Pages** (Priority 2)
- [ ] Update subdomain request page
- [ ] Update subdomain login page
- [ ] Dynamic color application (CSS variables)
- [ ] Hide platform footer toggle

### **PHASE 5: Email Branding** (Priority 3)
- [ ] Update email templates to use org logo
- [ ] Use organization name in emails
- [ ] Custom from name
- [ ] Test: Emails show org branding when sent via Org Admin

### **PHASE 6: Org Admin Checkout Enhancement** (Priority 3)
- [ ] Add branding fields to `/checkout/org-admin`
- [ ] Logo upload during signup
- [ ] Organization name input (required)
- [ ] Welcome message input (optional)
- [ ] Save branding data in webhook

---

## 📋 COMPONENT COMPARISON

| Feature | Team Admin Dashboard | Organization Admin Dashboard |
|---------|---------------------|------------------------------|
| **Component** | `TeamAdminDashboard.tsx` | `OrganizationAdminDashboard.tsx` |
| **Logo** | Platform logo | Custom org logo |
| **Title** | "Team Admin Dashboard" | "Organization Admin Dashboard" |
| **Colors** | Platform green | Custom org colors |
| **Branding Settings** | ❌ No | ✅ Yes |
| **Network View** | See team data | See organization data only |
| **Add Team Admin** | ✅ Yes ($200) | ✅ Yes ($200) |
| **Add Strategic Partner** | ✅ Yes | ✅ Yes |
| **Welcome Message** | ❌ No | ✅ Yes (custom) |
| **Hide Platform Footer** | ❌ No | ✅ Yes (optional) |

---

## 🎯 SUCCESS CRITERIA

**After implementation, Org Admin should:**
1. ✅ See dedicated OrganizationAdminDashboard (not Team Admin)
2. ✅ Upload logo and see it on dashboard
3. ✅ Set organization name (shown everywhere)
4. ✅ Write welcome message (shown on subdomain pages)
5. ✅ Pick custom colors (applied to dashboard and subdomain)
6. ✅ Hide platform branding (optional)
7. ✅ Send emails with org logo and name
8. ✅ Strategic Partners see org branding when logging in
9. ✅ Subdomain request pages show full org branding
10. ✅ Add Team Admins (same $200 payment as Team Admin)

---

## 🚀 NEXT STEPS

1. **CONFIRM PLAN** with Samantha
2. **Start with Phase 1** (separate dashboard)
3. **Database migration** (Phase 2)
4. **Build branding UI** (Phase 3)
5. **Apply to subdomain pages** (Phase 4)
6. **Email branding** (Phase 5)
7. **Checkout enhancement** (Phase 6)

---

**Estimated Time:**
- Phase 1: 2-3 hours
- Phase 2: 30 minutes
- Phase 3: 3-4 hours
- Phase 4: 2-3 hours
- Phase 5: 2-3 hours
- Phase 6: 1-2 hours

**Total: ~12-16 hours of development**

---

**Ready to start with Phase 1 (Create Separate Dashboard)?**
