# SUBDOMAIN ROUTING & OWNERSHIP RULES - FINAL
**Date:** June 1, 2026 04:40 UTC  
**Status:** ✅ CONFIRMED BY SAMANTHA

---

## 🚫 TERMINOLOGY - NEVER USE MLM LANGUAGE

**FORBIDDEN TERMS:**
- ❌ "Recruiting" / "Recruited"
- ❌ "Commission" (except in payment split context, NOT user-facing)
- ❌ "Downline" / "Upline"
- ❌ Any MLM/Direct Sales terminology

**APPROVED TERMS:**
- ✅ "Request for Invitation System"
- ✅ "Round Robin Distribution"
- ✅ "Strategic Partner Network"
- ✅ "Team Admin adds another Team Admin" (NOT "recruits")
- ✅ "Payment for adding Team Admin" (NOT "commission earned")

---

## 🏗️ SUBDOMAIN OWNERSHIP & LIFECYCLE

### **ALL Admin Types Get Subdomains:**
1. **Main Admin:** `john.citizenactivation.com`
2. **Team Admin:** `jane.citizenactivation.com`
3. **Organization Admin:** `myorg.citizenactivation.com`
4. **Master Admin:** NO subdomain (system-wide access via hub)

### **Subdomain Validation Rules (ALL Admins):**
- **Hard Limit:** 3-20 characters
- **Soft Warning:** 15+ characters → "Consider shorter for easier sharing"
- **Format:** Alphanumeric + hyphens only (`a-z`, `0-9`, `-`)
- **Must:** Start/end with letter or number (not hyphen)
- **Case:** Auto-convert to lowercase
- **Reserved:** Block `www`, `admin`, `api`, `app`, `hub`, `master`

---

## 🔒 DEACTIVATION SCENARIO: Team Admin Jane Removed

**What Happens:**

1. ✅ **Jane's subdomain:** `jane.citizenactivation.com` → **BLOCKED** (no new requests)
2. ✅ **Jane's MOSCA wallet:** Still active (MOSCA ≠ Our System)
3. ✅ **Main Admin visibility:** John (Main Admin) still sees Jane's historical data
4. ✅ **Strategic Partners:** Jane's partners **REMAIN HERS** (cannot be reassigned)
   - She loses the benefit of our system
   - But those are HER referrals/initiations
   - Main Admin John cannot take them
5. ✅ **New requests via subdomain:** **BLOCKED** (subdomain inactive)

**Key Point:** Our system is NOT mandatory for MOSCA participation. Deactivating in our system ≠ removing from MOSCA.

---

## 🎯 REQUEST ROUTING RULES

### **1. Subdomain-Specific Routing** ✅

**Request via:** `jane.citizenactivation.com/request`

**Routing:**
- ✅ Goes ONLY to Jane's Strategic Partners (Round Robin within her network)
- ✅ Main Admin John can SEE these requests
- ❌ Main Admin John **CANNOT reassign** (Jane is the initiator/link owner)
- ✅ Jane owns these requests permanently (even if she leaves system)

### **2. Main Admin Subdomain Routing**

**Request via:** `john.citizenactivation.com/request`

**Routing:**
- Goes to John's own Strategic Partner network (Round Robin)
- **NOT system-wide** (John has his own network)
- John CAN reassign these (he's the initiator)

### **3. Main Hub Routing**

**Request via:** `hub.citizenactivation.com/request`

**Routing:**
- Goes to Master Admin's default pool
- OR specific admin based on campaign tracking
- NOT system-wide Round Robin

---

## 👁️ HIERARCHY VISIBILITY & INTERVENTION

### **Main Admin (John) Sees:**
1. ✅ **All requests system-wide** (including Jane's subdomain requests)
2. ✅ **All Strategic Partners** (across all Team Admins)
3. ✅ **All Team Admin activity** (response times, activation rates)
4. ✅ **Delayed requests** (3+ days assigned, no progress)
5. ⚠️ **Can intervene/reassign:** ONLY if HE is the initiator (request came from HIS link)
   - If request came from Jane's link → John can SEE it but NOT reassign it

### **Team Admin (Jane) Sees:**
1. ✅ **Only HER Strategic Partners**
2. ✅ **Only requests assigned to her network**
3. ❌ **Cannot see other Team Admins' networks**
4. ❌ **NO shared access** (unless Main Admin's credentials are physically shared)

### **Organization Admin (MyOrg) Sees:**
1. ✅ **Only THEIR organization's network**
2. ✅ **Requests via their subdomain:** `myorg.citizenactivation.com`
3. ✅ **Their Team Admins** (if they added any)
4. ❌ **Cannot see Main Admin John's network**

---

## 🔄 ROUND ROBIN DISTRIBUTION

### **Example: Jane's Network**

Jane has 5 Strategic Partners:
1. Partner A (2 active slots)
2. Partner B (3 active slots)
3. Partner C (1 active slot)
4. Partner D (0 slots - full)
5. Partner E (5 active slots)

**Request comes via `jane.citizenactivation.com/request`:**

### **Distribution Logic (EVEN ROTATION):**
1. ✅ **Rotate evenly across all with slots** (ignore slot count initially)
2. ✅ Skip partners with 0 slots
3. ✅ When partner is full → apply "Full Logic" or "Increase Slots Logic"

**Rotation Order:**
- Request 1 → Partner A
- Request 2 → Partner B
- Request 3 → Partner C
- Request 4 → Partner E (skip D, full)
- Request 5 → Partner A (cycle repeats)

**When Partner Fills Up:**
- Apply existing "Full Logic" (waitlist, notification, etc.)
- OR "Increase Slots Logic" (prompt partner to expand)

### **Monitoring:**
- ✅ Main Admin John sees assignment in real-time
- ✅ If no action in 3 days → "delayed request" alert
- ❌ John CANNOT reassign (Jane's link = Jane's ownership)

---

## 📋 KEY RULES SUMMARY

1. **Request Ownership = Link Ownership**
   - Request from Jane's link → Jane owns it forever
   - Main Admin can SEE but NOT reassign
   
2. **Subdomain Deactivation ≠ Partner Loss**
   - If Jane leaves system, her Strategic Partners stay hers
   - Main Admin cannot take them
   
3. **Round Robin = Even Rotation First**
   - Rotate evenly, not by slot count
   - Skip full partners, cycle repeats
   
4. **Main Admin Has Own Network**
   - Not system-wide pool
   - Own subdomain, own Round Robin
   
5. **No Shared Access Between Admins**
   - Unless credentials physically shared
   - Each admin sees ONLY their network

---

## 🛠️ IMPLEMENTATION CHECKLIST

- [ ] Add `subdomain` field to ALL admin types (Main, Team, Org)
- [ ] Subdomain validation (3-20 chars, alphanumeric + hyphens)
- [ ] Request routing by subdomain (link owner = request owner)
- [ ] Block reassignment when initiator ≠ current admin
- [ ] Even rotation Round Robin (not slot-count priority)
- [ ] Subdomain deactivation logic (block new requests, keep partners)
- [ ] Replace drop-downs with search/autocomplete (slug-based)
- [ ] Remove ALL MLM terminology from UI copy
- [ ] Main Admin visibility dashboard (see all, reassign only owned)
- [ ] Delayed request alerts (3+ days, no progress)

---

**Next Steps:** Implement subdomain system across all admin types with ownership-based routing rules.
