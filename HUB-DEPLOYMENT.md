# Strategic Partner Hub - Deployment Guide
## hub.citizenactivation.com

**Updated:** May 21, 2026  
**Subdomain:** hub.citizenactivation.com  
**Time Estimate:** 30-45 minutes

---

## 🏗️ Domain Architecture (FINAL)

**citizenactivation.com** (Root Domain)
- **Platform:** Poplinks landing page
- **Purpose:** Public marketing, sales, purchase flow
- **Setup:** Already configured in Poplinks

**hub.citizenactivation.com** (Subdomain)
- **Platform:** Strategic Partner Hub (this Next.js app)
- **Purpose:** Internal request management, dashboards
- **Setup:** Deploy to Vercel, point subdomain

**m.citizenactivation.com** (Email Domain)
- **Platform:** Resend transactional emails
- **Purpose:** Automated notifications
- **Setup:** DNS records for SPF/DKIM

---

## 🚀 Deployment Steps

### 1. Set Up Database (PostgreSQL)

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Create new project: "citizen-activation-hub"
3. Copy connection string (starts with `postgresql://`)
4. Save for step 4

**Option B: Supabase**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy PostgreSQL connection string
5. Save for step 4

**Option C: Railway**
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Save for step 4

---

### 2. Configure Resend Email Domain (If Not Done)

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `m.citizenactivation.com`
4. Add these DNS records to citizenactivation.com:

```
Type: TXT
Name: _resend._domainkey.m
Value: [Provided by Resend]

Type: TXT
Name: m
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: _dmarc.m
Value: v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@citizenactivation.com
```

5. Wait for verification (usually 5-10 minutes)
6. Confirm API key: `re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf`

---

### 3. Deploy to Vercel

#### A. Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

#### B. Login to Vercel
```bash
vercel login
```

#### C. Deploy from project directory
```bash
cd /root/.openclaw/workspace/citizen-activation-system
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? (Select your account)
- Link to existing project? **N**
- Project name? **citizen-activation-hub**
- Directory? **./** (current)
- Override settings? **N**

#### D. Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select `citizen-activation-hub` project
3. Go to Settings → Environment Variables
4. Add these variables (ALL environments: Production, Preview, Development):

```env
DATABASE_URL
Value: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
(Your connection string from Step 1)

RESEND_API_KEY
Value: re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf

RESEND_FROM_EMAIL
Value: Strategic Partner Hub <notifications@m.citizenactivation.com>

NEXTAUTH_SECRET
Value: (Generate with: openssl rand -base64 32)

NEXTAUTH_URL
Value: https://hub.citizenactivation.com

APP_NAME
Value: Strategic Partner Hub

APP_ROOT_DOMAIN
Value: citizenactivation.com

APP_HUB_DOMAIN
Value: hub.citizenactivation.com
```

#### E. Generate NextAuth Secret
```bash
openssl rand -base64 32
```

Copy output and paste as `NEXTAUTH_SECRET` value in Vercel.

#### F. Redeploy with Environment Variables
```bash
vercel --prod
```

---

### 4. Run Database Migration (Production)

**From your local machine (connected to production database):**

```bash
cd /root/.openclaw/workspace/citizen-activation-system

# Create temporary .env file with PRODUCTION database URL
cat > .env << EOF
DATABASE_URL="your-production-postgres-url-here"
EOF

# Run migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial data (Main Admin + Test Partner)
npx prisma db seed

# Remove temporary .env file
rm .env
```

**Save these credentials:**
- Main Admin: `marketleveragingmedia@agentmail.to` / `ChangeMe123!`
- Test Partner: `test.partner@example.com` / `ChangeMe123!`
- Test Referral Code: `MOSCA-TEST-001`

---

### 5. Connect Subdomain to Vercel

#### A. In Vercel Dashboard
1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter: `hub.citizenactivation.com`
4. Click "Add"

#### B. Update DNS Records (citizenactivation.com)

Vercel will show required DNS record. Add this to your DNS provider:

```
Type: CNAME
Name: hub
Value: cname.vercel-dns.com
```

**Wait for DNS propagation** (usually 5-15 minutes, up to 48 hours)

Check status: https://dnschecker.org/#CNAME/hub.citizenactivation.com

---

### 6. Test Deployment

#### A. Public Request Form
1. Visit: https://hub.citizenactivation.com
2. Fill out request form
3. Use test referral code: `MOSCA-TEST-001`
4. Submit
5. Check email for confirmation (both requester + partner emails)

#### B. Login as Main Admin
1. Visit: https://hub.citizenactivation.com/login
2. Email: `marketleveragingmedia@agentmail.to`
3. Password: `ChangeMe123!`
4. Should see Main Admin Dashboard with test request

#### C. Login as Strategic Partner
1. Visit: https://hub.citizenactivation.com/login
2. Email: `test.partner@example.com`
3. Password: `ChangeMe123!`
4. Should see Strategic Partner Dashboard with test request

#### D. Check Email Delivery
- Requester confirmation email should arrive
- Strategic Partner assignment email should arrive
- Check spam folders if not in inbox
- Verify links point to `https://hub.citizenactivation.com`

---

### 7. Change Default Passwords (CRITICAL)

**IMPORTANT: Change Main Admin password immediately**

For now, manually update in database:

```bash
# Generate new password hash locally
node -e "console.log(require('bcryptjs').hashSync('YourNewSecurePassword', 10))"

# Copy the output hash
```

Then in your database (via Neon/Supabase dashboard):

```sql
-- Update Main Admin password
UPDATE admins 
SET password_hash = 'paste-new-hash-here' 
WHERE email = 'marketleveragingmedia@agentmail.to';
```

**Or delete test partner:**

```sql
-- Remove test Strategic Partner
DELETE FROM strategic_partners 
WHERE email = 'test.partner@example.com';
```

---

## 🔐 Security Checklist

- [ ] Changed default Main Admin password
- [ ] Removed or changed test Strategic Partner password
- [ ] Verified Resend email domain (m.citizenactivation.com)
- [ ] Confirmed HTTPS working on hub.citizenactivation.com
- [ ] Tested login/logout flow
- [ ] Tested request submission end-to-end
- [ ] Confirmed email delivery working
- [ ] Verified referral code assignment works
- [ ] Checked Round Robin assignment working
- [ ] Confirmed dashboard displays correctly

---

## 📊 URLs After Deployment

**Public (Poplinks):**
- `https://citizenactivation.com` → Marketing/sales landing page

**Hub (Internal):**
- `https://hub.citizenactivation.com` → Request form (public but intentional)
- `https://hub.citizenactivation.com/login` → Login page
- `https://hub.citizenactivation.com/dashboard` → Dashboards (protected)

**Email:**
- All emails sent from: `Strategic Partner Hub <notifications@m.citizenactivation.com>`
- All links point to: `https://hub.citizenactivation.com`

---

## 🎯 Post-Deployment: Add Real Strategic Partners

When someone is activated in MOSCA and you need to add them as a Strategic Partner:

### Option 1: Manually via Database (Current MVP)

```sql
-- Generate password hash first (run locally):
-- node -e "console.log(require('bcryptjs').hashSync('TempPassword123', 10))"

INSERT INTO strategic_partners (
  id,
  team_id,
  name,
  email,
  password_hash,
  phone,
  referral_code,
  slots_used,
  slots_available,
  status,
  activation_level,
  activation_date,
  created_date
) VALUES (
  gen_random_uuid(),
  'main-team-id-here',
  'Partner Full Name',
  'partner@example.com',
  'bcrypt-hash-here',
  '+1234567890',
  'MOSCA-ACTUAL-CODE-FROM-BLOCKCHAIN',
  0,
  3,
  'Active',
  'Citizen',
  NOW(),
  NOW()
);
```

Then send them welcome email with temp password.

### Option 2: Admin UI Form (Future Enhancement)
- Build "Add Strategic Partner" form in Main Admin dashboard
- Auto-generate temp password
- Auto-send welcome email
- Planned for post-MVP

---

## 🆘 Troubleshooting

### Email not sending
1. Check Resend dashboard for errors: https://resend.com/emails
2. Verify domain DNS records are correct
3. Check API key in Vercel environment variables
4. Review Vercel function logs for email errors

### Database connection errors
1. Verify DATABASE_URL is correct in Vercel
2. Check database is running (Neon/Supabase dashboard)
3. Confirm connection limit not exceeded
4. Review Prisma logs in Vercel function logs

### Login not working
1. Verify NEXTAUTH_SECRET is set in Vercel
2. Confirm NEXTAUTH_URL = `https://hub.citizenactivation.com`
3. Check password hash is valid bcrypt
4. Review NextAuth logs in browser console + Vercel logs

### Subdomain not resolving
1. Check DNS propagation: https://dnschecker.org/#CNAME/hub.citizenactivation.com
2. Verify CNAME record: `hub → cname.vercel-dns.com`
3. Wait up to 48 hours for full DNS propagation
4. Clear browser cache / try incognito mode

### Referral code not working
1. Verify code exists in `strategic_partners` table
2. Check code is unique (no duplicates)
3. Confirm Strategic Partner status is `Active`
4. Review assignment logic in Vercel function logs

---

## 📝 Future Enhancements

**Next Sprint (Post-MVP):**
- [ ] Add Strategic Partner form (Admin UI)
- [ ] Build status update buttons (Mark as Invited, Onboarding Scheduled, Activated)
- [ ] Add manual reassignment (Admin override)
- [ ] Implement 48-hour follow-up automation
- [ ] Add password reset flow
- [ ] Build Team Admin dashboard
- [ ] Add request notes/comments
- [ ] Implement rate limiting
- [ ] Build analytics dashboard
- [ ] Add notification preferences

---

## ✅ Deployment Complete!

**Your Strategic Partner Hub is now live at:**
## **https://hub.citizenactivation.com** 🎉

**Root domain (Poplinks) remains at:**
## **https://citizenactivation.com**

---

**Next Steps:**
1. Change default passwords
2. Remove test Strategic Partner
3. Add first real Strategic Partner (when MOSCA activated)
4. Start collecting real invitation requests
5. Monitor email delivery in Resend dashboard
6. Monitor requests in Main Admin dashboard

---

**Support:**
- Vercel logs: https://vercel.com/dashboard → Project → Logs
- Resend dashboard: https://resend.com/emails
- Database: Neon/Supabase dashboard
- DNS checker: https://dnschecker.org

**Built for:** Samantha (@MzSamantha)  
**Status:** 🚀 **LIVE AND READY**
