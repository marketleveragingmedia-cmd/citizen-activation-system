# Citizen Activation System - Deployment Structure

**Updated:** May 21, 2026  
**Critical Decision:** System should NOT be on root domain

---

## 🏗️ Domain Architecture

### ✅ **CORRECT Setup:**

**citizenactivation.com** (Root Domain)
- **Purpose:** Public-facing marketing/sales page
- **Platform:** Poplinks landing page
- **Function:** Explains MOSCA, captures leads, sells activation packages
- **CTA:** Purchase Citizen ($225) or Enterprise ($525) activation

**citizenactivation.com/system** (Subdirectory)
- **Purpose:** Strategic Partner Hub (internal tool)
- **Platform:** This Next.js application
- **Function:** Request management, assignment, dashboards
- **Access:** Login-only (Strategic Partners + Admins)

**Alternative (if subdirectory doesn't work):**
- **app.citizenactivation.com** OR
- **system.citizenactivation.com** OR
- **hub.citizenactivation.com**

---

## 🎯 Recommended: `/system` Path

**Why `/system` is better:**
- Single domain (no subdomain DNS setup)
- Clean separation (public vs internal)
- Works with Poplinks root domain
- Easier to manage

**URLs:**
- `https://citizenactivation.com` → Poplinks landing page
- `https://citizenactivation.com/system` → Request form
- `https://citizenactivation.com/system/login` → Login page
- `https://citizenactivation.com/system/dashboard` → Dashboards

---

## 📝 Updated Next.js Configuration

### 1. Update `next.config.js`

Create or update this file:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/system',
  assetPrefix: '/system',
  trailingSlash: false,
}

module.exports = nextConfig
```

### 2. Update Environment Variables

**For Production:**
```env
NEXTAUTH_URL=https://citizenactivation.com/system
```

**For Local Development:**
```env
NEXTAUTH_URL=http://localhost:3000/system
```

### 3. Update Internal Links

All links in the app already use relative paths, so they'll automatically work with `/system` prefix:
- `/login` → `/system/login`
- `/dashboard` → `/system/dashboard`
- `/api/request` → `/system/api/request`

---

## 🚀 Deployment Options

### Option A: Deploy to Vercel with `/system` Base Path

**Steps:**
1. Deploy Next.js app to Vercel
2. Configure Vercel to serve at `/system`
3. Point `citizenactivation.com/system/*` → Vercel deployment
4. Keep `citizenactivation.com` → Poplinks landing page

**Vercel Configuration:**
- Add `next.config.js` with `basePath: '/system'`
- Deploy to Vercel
- Add domain: `citizenactivation.com`
- Configure rewrites in Vercel dashboard (if needed)

### Option B: Deploy to Subdomain

**If `/system` path doesn't work with Poplinks:**

Deploy to: `app.citizenactivation.com`

**DNS Setup:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**URLs:**
- `https://citizenactivation.com` → Poplinks
- `https://app.citizenactivation.com` → Strategic Partner Hub

**No basePath needed** - runs at root of subdomain

---

## 🔐 Security Considerations

### Public Access Points:
- `citizenactivation.com` → Anyone (Poplinks marketing)
- `citizenactivation.com/system` → Request form (public but intentional)
- `citizenactivation.com/system/login` → Login page (public)

### Protected Routes:
- `citizenactivation.com/system/dashboard` → Requires authentication
- `citizenactivation.com/system/api/*` → Some protected, some public

### SEO Considerations:
- `/system/*` routes should be `noindex` (internal tool)
- Add robots.txt to prevent indexing:

```txt
# /system/public/robots.txt
User-agent: *
Disallow: /system/
```

---

## 📧 Email Configuration

**Resend Domain:** `m.citizenactivation.com`  
**From Address:** `Strategic Partner Hub <notifications@m.citizenactivation.com>`

**Email Links:**
- Dashboard link: `https://citizenactivation.com/system/dashboard`
- Login link: `https://citizenactivation.com/system/login`

**Update in `lib/email.ts`:**
- Replace all dashboard URLs with `/system` prefix
- Update `dashboardUrl` parameter in email templates

---

## 🎨 User Journey

### Public Flow (Poplinks → System):
1. User visits `citizenactivation.com`
2. Reads about MOSCA (Poplinks landing page)
3. Decides to purchase activation
4. **Option A:** Buys through Poplinks checkout
5. **Option B:** Clicks "Request Invitation" → `/system` (request form)
6. Fills request form → Assigned to Strategic Partner
7. Strategic Partner contacts them → Processes in MOSCA

### Strategic Partner Flow:
1. Activated in MOSCA → Receives referral code
2. Receives Hub login credentials (email)
3. Visits `citizenactivation.com/system/login`
4. Logs in → See dashboard at `/system/dashboard`
5. Views assigned requests
6. Shares referral code: `citizenactivation.com/system?ref=CODE`

---

## 🛠️ Implementation Steps

### Step 1: Create `next.config.js`

```bash
cd /root/.openclaw/workspace/citizen-activation-system
```

Create file with:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/system',
  assetPrefix: '/system',
}

module.exports = nextConfig
```

### Step 2: Update Email Templates

Update `lib/email.ts` dashboard URLs:
- Change: `${process.env.NEXTAUTH_URL}/dashboard`
- To: `${process.env.NEXTAUTH_URL}/system/dashboard`

(Already uses env var, so just update NEXTAUTH_URL in production)

### Step 3: Update Environment Variables

**Production `.env`:**
```env
NEXTAUTH_URL=https://citizenactivation.com/system
```

**Local `.env.local`:**
```env
NEXTAUTH_URL=http://localhost:3000/system
```

### Step 4: Test Locally

```bash
npm run dev
```

Visit: `http://localhost:3000/system`

### Step 5: Deploy

Follow `DEPLOY.md` but use updated NEXTAUTH_URL with `/system` path.

---

## 🎯 Recommendation

**Use:** `citizenactivation.com/system`

**Why:**
- ✅ Single domain (simpler DNS)
- ✅ Clear separation (public vs internal)
- ✅ Works with Poplinks root domain
- ✅ Professional structure
- ✅ Easy to remember

**If Poplinks conflicts with subdirectory routing:**
- **Fallback:** `app.citizenactivation.com`
- Cleaner separation
- No routing conflicts

---

## 📝 Next Steps

1. **Decide:** `/system` path OR `app.` subdomain
2. **Update:** `next.config.js` (if using `/system`)
3. **Update:** `NEXTAUTH_URL` environment variable
4. **Test:** Locally with new path
5. **Deploy:** Follow updated DEPLOY.md

---

**Status:** Configuration update required before deployment  
**Decision needed:** `/system` path OR `app.` subdomain  
**Time to implement:** 5-10 minutes
