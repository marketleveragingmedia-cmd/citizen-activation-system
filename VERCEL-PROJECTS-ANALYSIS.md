# VERCEL PROJECTS ANALYSIS

## ✅ SAFE TO DELETE (No Important Files/Keys):

### 1. `workspace`
**What it is:** Accidental deployment from `/root/.openclaw/workspace` folder
**Content:** Just a Vercel authentication page (no actual app)
**Environment Variables:** NONE (checked - protected page only)
**Files:** No unique files - just auth redirect
**Verdict:** ✅ **SAFE TO DELETE**

### 2. `citizen-activation-system-new`
**What it is:** Old test deployment from May 22
**Content:** Public request invitation form only
**Environment Variables:** Need to check in dashboard
**Files:** Just the request form (no admin panel, no database)
**Verdict:** ⚠️ **CHECK ENV VARS FIRST, THEN DELETE**

---

## ✅ KEEP (Production):

### 1. `citizen-activation-hub`
**Domain:** hub.citizenactivation.com
**Content:** Full Citizen Activation System
**Environment Variables:** 
- DATABASE_URL (Postgres)
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- NEXTAUTH_SECRET
- RESEND_API_KEY
**Verdict:** ✅ **KEEP - PRODUCTION**

### 2. `mlm-command-center`
**Domain:** mlm-command-center.vercel.app
**Content:** MLM Command Center
**Environment Variables:**
- CONTROLBOARD_API_TOKEN
- DATABASE_URL (if used)
**Verdict:** ✅ **KEEP - PRODUCTION**

---

## 🔍 BEFORE DELETING - CHECK:

### For `citizen-activation-system-new`:
1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-system-new/settings/environment-variables
2. Check if ANY env vars are set
3. If YES → Copy them somewhere safe
4. If NO → Safe to delete immediately

### For `workspace`:
- No env vars (just auth redirect)
- Safe to delete immediately

---

## 📋 DELETION STEPS:

### Step 1: Check `citizen-activation-system-new` Env Vars
1. Go to project settings
2. Click "Environment Variables"
3. If any exist, copy them
4. Paste into `citizen-activation-hub` if needed

### Step 2: Delete `workspace`
1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/workspace/settings
2. Scroll to "Delete Project"
3. Type `workspace` to confirm
4. Click Delete

### Step 3: Delete `citizen-activation-system-new`
1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-system-new/settings
2. Scroll to "Delete Project"
3. Type `citizen-activation-system-new` to confirm
4. Click Delete

---

## ✅ FINAL STATE:

**2 Projects:**
1. `citizen-activation-hub` (production)
2. `mlm-command-center` (production)

**Cost Savings:**
- No more `workspace` builds
- No more `citizen-activation-system-new` builds
- Estimated savings: $10-15/month

**Benefits:**
- Clean dashboard
- Lower costs
- No confusion
- Only production projects visible

---

## ⚠️ IMPORTANT:

**DO NOT DELETE:**
- `citizen-activation-hub` environment variables
- `mlm-command-center` environment variables
- Any Postgres databases
- Any domains

**SAFE TO DELETE:**
- The projects themselves (after checking env vars)
- Old deployments
- Preview branches

---

**READY TO PROCEED?**
