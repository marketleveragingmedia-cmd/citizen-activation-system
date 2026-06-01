# BRANDING & CUSTOMIZATION - FINAL RULES
**Date:** June 1, 2026 04:59 UTC  
**Status:** ✅ CONFIRMED BY SAMANTHA

---

## 🚫 CRITICAL CLARIFICATION: ORG ADMIN IS STANDALONE

**Organization Admin is NOT an upgrade path from Main Admin or Team Admin.**

### **Key Differences:**

**Main Admin:**
- Sees ENTIRE platform network (all Team Admins, all Strategic Partners, all requests)
- Full system visibility and oversight
- Can intervene/reassign requests they initiated
- Builds their own network under platform branding

**Organization Admin:**
- Sees ONLY their organization's network (isolated view)
- Cannot see Main Admin's network or other Org Admins
- For existing communities/groups with 100s/1,000s of members
- Needs white-label branding for member trust

**These are parallel tracks, not upgrade paths.**

---

## 🎨 **BRANDING RULES - FINAL**

### **✅ Organization Admin ONLY** (Full Customization)
**Price:** $997 Year 1, $497 Year 2+

**Gets Full Branding:**
- ✅ **Logo Upload** (shown on subdomain pages, dashboard, emails)
- ✅ **Organization Name** (replaces "Citizen Activation System")
- ✅ **Welcome Message** (custom text on login/request pages)
- ✅ **Custom Colors** (primary/secondary brand colors)
- ✅ **Custom Subdomain** (`myorg.citizenactivation.com`)
- ✅ **Email Branding** (org logo + name in all emails to their network)
- ✅ **Hide Platform Branding** (optional: remove "Powered by Citizen Activation")

**Why Full Branding?**
- Organizations need member trust
- Branding reinforces existing community identity
- Members already know the organization, not the platform
- White-label experience required for adoption

---

### **❌ Main Admin** (No Custom Branding)
**Price:** $1,497 Year 1, $997 Year 2+

**Gets:**
- ✅ **Custom Subdomain** (`john.citizenactivation.com`)
- ✅ **Platform branding** (Citizen Activation logo + standard theme)
- ❌ NO logo upload
- ❌ NO custom colors
- ❌ NO welcome message customization
- ❌ NO email branding

**Why No Branding?**
- Main Admin = platform power user (sees everything)
- Focus on system utilization and consistency
- Represents the platform, not a separate brand
- Full visibility = platform identity

---

### **❌ Team Admin** (No Custom Branding)
**Price:** $497/year

**Gets:**
- ✅ **Custom Subdomain** (`jane.citizenactivation.com`)
- ✅ **Platform branding** (Citizen Activation logo + standard theme)
- ❌ NO logo upload
- ❌ NO custom colors
- ❌ NO welcome message customization
- ❌ NO email branding

**Why No Branding?**
- Entry-level admin tier
- Focus on functionality and network building
- Represents the platform
- Consistent experience across all Team Admins

---

## 🏗️ **DATABASE SCHEMA CHANGES**

### **Team Table (or new Organization table):**
```typescript
model Team {
  id                    String     @id @default(cuid())
  name                  String
  adminId               String
  tierType              TierType   @default(FullSystem)
  subdomain             String?    @unique // ALL admin types get this
  
  // Branding fields (Org Admin ONLY)
  logoUrl               String?    // Cloud storage URL
  organizationName      String?    // Display name (overrides platform name)
  welcomeMessage        String?    // Custom text for login/request pages
  primaryColor          String?    // Hex: "#1E8E5A"
  secondaryColor        String?    // Hex: "#065F46"
  hidePlatformBranding  Boolean    @default(false) // Hide "Powered by" footer
  
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

### **Validation Rules:**
- `logoUrl`: Must be valid image URL (PNG, JPG, SVG)
- `primaryColor` / `secondaryColor`: Must be valid hex color (`#RRGGBB`)
- `welcomeMessage`: Max 500 characters
- `organizationName`: Max 100 characters
- Only populate branding fields if `admin.role === 'ORG_ADMIN'`

---

## 🎯 **WHERE BRANDING APPEARS (ORG ADMIN ONLY)**

### **1. Subdomain Request Form** (`myorg.citizenactivation.com/request`)
**Org Admin:**
- Organization logo (header)
- Organization name (title)
- Welcome message (below logo)
- Brand colors (buttons, headers, links)
- Footer: "Powered by Citizen Activation" (can hide via toggle)

**Main Admin & Team Admin:**
- Platform logo (Citizen Activation)
- Standard text: "Request Strategic Partner Invitation"
- Platform colors (green theme)
- Footer: "Powered by Citizen Activation"

---

### **2. Subdomain Login Page** (`myorg.citizenactivation.com/login`)
**Org Admin:**
- Organization logo
- "Strategic Partner Login - [Org Name]"
- Welcome message (optional)
- Brand colors
- Hide platform footer (optional)

**Main Admin & Team Admin:**
- Platform logo
- "Strategic Partner Login"
- Platform colors
- Platform footer

---

### **3. Email Communications**
**Org Admin:**
- Organization logo in email header
- "You've been invited by [Organization Name]"
- Organization name in signature
- Brand colors in email template

**Main Admin & Team Admin:**
- Platform logo (Citizen Activation)
- "You've been invited via [Admin Name]'s network"
- Platform signature
- Platform colors

---

### **4. Dashboard Header** (when logged in)
**Org Admin:**
- Organization logo (top left)
- Organization name (next to logo)
- Brand colors in navigation

**Main Admin & Team Admin:**
- Platform logo (Citizen Activation)
- Platform name
- Platform colors

---

### **5. Strategic Partner Dashboard** (when Strategic Partners log in via Org Admin subdomain)
**Org Admin:**
- Organization logo + name
- Brand colors
- Feels like they're using "[Org Name]'s system"

**Main Admin & Team Admin:**
- Platform branding
- Feels like they're using "Citizen Activation System"

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1 (MVP - LAUNCH WITH THIS):**
- [ ] Add branding fields to database (logo, orgName, welcomeMessage, colors)
- [ ] Logo upload on Org Admin account creation
- [ ] Display logo on subdomain pages (Org Admin only)
- [ ] Display organization name (Org Admin only)
- [ ] Welcome message text (Org Admin only)
- [ ] Block branding UI for Main Admin & Team Admin

### **Phase 2 (Enhanced - Add Later):**
- [ ] Custom color picker (live preview)
- [ ] Email template branding (logo + colors)
- [ ] "Hide platform branding" toggle (footer removal)
- [ ] Logo preview/crop tool

### **Phase 3 (Future - Enterprise):**
- [ ] Fully custom domain (`activation.myorg.com`)
- [ ] Custom email domain (`invite@myorg.com`)
- [ ] Mobile app branding

---

## 📋 **BRANDING COMPARISON TABLE - FINAL**

| Feature | Team Admin | Main Admin | Org Admin |
|---------|-----------|-----------|-----------|
| **Subdomain** | ✅ | ✅ | ✅ |
| **Platform Logo** | ✅ | ✅ | ❌ (uses own) |
| **Custom Logo** | ❌ | ❌ | ✅ |
| **Organization Name** | ❌ | ❌ | ✅ |
| **Welcome Message** | ❌ | ❌ | ✅ |
| **Custom Colors** | ❌ | ❌ | ✅ |
| **Email Branding** | ❌ | ❌ | ✅ |
| **Hide Platform Branding** | ❌ | ❌ | ✅ (optional) |
| **Network Visibility** | Own only | Everything | Own only |
| **Price (Y1)** | $497 | $1,497 | $997 |
| **Price (Y2+)** | $497 | $997 | $497 |

---

## 💡 **WHY THIS STRUCTURE WORKS**

### **Organization Admin = White-Label Experience**
- For communities that already have brand recognition
- Members trust the organization, not the platform
- Seamless integration into existing ecosystem
- Example: Church, sports league, business network

### **Main Admin & Team Admin = Platform Experience**
- Building networks under Citizen Activation brand
- Platform benefits from their promotion
- Consistency across all Main/Team Admin subdomains
- Subdomain = convenience, not branding separation

---

## 🛠️ **UI UPDATES NEEDED**

### **Org Admin Account Creation:**
- [ ] Add logo upload field (drag-and-drop or file picker)
- [ ] Add organization name field (required)
- [ ] Add welcome message field (optional, textarea)
- [ ] Add color pickers (primary/secondary) - Phase 2
- [ ] Preview card showing branding example

### **Main Admin & Team Admin Account Creation:**
- [ ] NO branding fields
- [ ] Only subdomain field
- [ ] Clear messaging: "Platform branding will be used"

### **Subdomain Pages (Dynamic Branding):**
- [ ] Detect admin role from subdomain
- [ ] If Org Admin: Load branding from database
- [ ] If Main/Team Admin: Use platform branding
- [ ] Apply colors dynamically (CSS variables)

---

## 📝 **CHECKOUT PAGE UPDATES**

### **Organization Admin Checkout:**
**Add fields:**
- Organization Name (required)
- Logo Upload (optional - can add later)
- Welcome Message (optional)
- "You can customize colors after account creation"

### **Main Admin & Team Admin Checkout:**
**Do NOT add:**
- No logo upload
- No branding fields
- Just subdomain selection

---

## ✅ **KEY TAKEAWAYS**

1. **Org Admin = ONLY role with branding** (full white-label)
2. **Main Admin & Team Admin = Platform branding** (subdomain for routing only)
3. **Not an upgrade path** (Org Admin is standalone for organizations)
4. **Consistency is the goal** (Main/Team Admins represent platform)
5. **Launch with Phase 1** (logo, name, welcome message) - colors later

---

**Next Action:** Implement Phase 1 branding fields in Org Admin account creation + subdomain display logic.
