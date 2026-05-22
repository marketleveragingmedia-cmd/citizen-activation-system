# Citizen Activation System - Deployment Guide

**Status:** Ready to Deploy  
**Time Estimate:** 30-45 minutes

---

## 📋 Pre-Deployment Checklist

- [ ] PostgreSQL database ready (Neon/Supabase/Railway)
- [ ] Domain DNS access (citizenactivation.com)
- [ ] Resend account configured
- [ ] Vercel account ready

---

## 🚀 Step-by-Step Deployment

### 1. Set Up Database (PostgreSQL)

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Create new project: "citizen-activation-system"
3. Copy connection string (starts with `postgresql://`)
4. Save for step 3

**Option B: Supabase**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy PostgreSQL connection string
5. Save for step 3

**Option C: Railway**
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Save for step 3

---

### 2. Configure Resend Email Domain

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
- Project name? **citizen-activation-system**
- Directory? **./** (current)
- Override settings? **N**

#### D. Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select `citizen-activation-system` project
3. Go to Settings → Environment Variables
4. Add these variables:

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
Value: https://citizenactivation.com
(Will update after domain is connected)
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

### 4. Run Database Migration

**From your local machine (connected to production database):**

```bash
cd /root/.openclaw/workspace/citizen-activation-system

# Update .env.local with PRODUCTION database URL
echo "DATABASE_URL=\"your-production-postgres-url\"" > .env.local

# Run migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial data (Main Admin + Test Partner)
npx prisma db seed
```

**Save these credentials:**
- Main Admin: `marketleveragingmedia@agentmail.to`
- Password: `ChangeMe123!`
- Test Partner: `test.partner@example.com`
- Test Referral Code: `MOSCA-TEST-001`

---

### 5. Connect Domain to Vercel

#### A. In Vercel Dashboard
1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter: `citizenactivation.com`
4. Click "Add"

#### B. Update DNS Records

Vercel will show required DNS records. Add these to your DNS provider:

**Option 1: A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option 2: CNAME (Alternative)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### C. Update NEXTAUTH_URL Environment Variable
1. Go to Vercel → Settings → Environment Variables
2. Edit `NEXTAUTH_URL`
3. Change to: `https://citizenactivation.com`
4. Save and redeploy

---

### 6. Test Deployment

#### A. Public Request Form
1. Visit: https://citizenactivation.com
2. Fill out request form
3. Use test referral code: `MOSCA-TEST-001`
4. Submit
5. Check email for confirmation

#### B. Login as Main Admin
1. Visit: https://citizenactivation.com/login
2. Email: `marketleveragingmedia@agentmail.to`
3. Password: `ChangeMe123!`
4. Should see Main Admin Dashboard

#### C. Login as Strategic Partner
1. Visit: https://citizenactivation.com/login
2. Email: `test.partner@example.com`
3. Password: `ChangeMe123!`
4. Should see Strategic Partner Dashboard with test request

#### D. Check Email Delivery
- Requester confirmation email should arrive
- Strategic Partner assignment email should arrive
- Check spam folders if not in inbox

---

### 7. Change Default Password

**IMPORTANT: Change Main Admin password immediately**

For now, manually update in database:

```sql
-- Generate new hash locally
-- Run: node -e "console.log(require('bcryptjs').hashSync('YourNewPassword', 10))"

-- Update in database
UPDATE admins 
SET password_hash = 'your-new-hash-here' 
WHERE email = 'marketleveragingmedia@agentmail.to';
```

---

## 🔐 Security Checklist

- [ ] Changed default Main Admin password
- [ ] Removed test Strategic Partner (or changed password)
- [ ] Verified email domain (m.citizenactivation.com)
- [ ] Confirmed HTTPS working
- [ ] Tested login/logout flow
- [ ] Tested request submission
- [ ] Confirmed email delivery
- [ ] Verified referral code assignment works

---

## 🎯 Post-Deployment Tasks

### Create Real Strategic Partners

When someone is activated in MOSCA:

1. Login as Main Admin
2. (Future feature: Add Strategic Partner form)
3. For now, manually add via database:

```sql
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
  'team-id-here',
  'Partner Name',
  'partner@example.com',
  'bcrypt-hash-here',
  '+1234567890',
  'MOSCA-CODE-FROM-BLOCKCHAIN',
  0,
  3,
  'Active',
  'Citizen',
  NOW(),
  NOW()
);
```

4. Send welcome email with temp password

---

## 📊 Monitoring

### Vercel Dashboard
- Monitor deployment status
- Check function logs
- View analytics

### Database
- Monitor connection count
- Check query performance
- Review request volumes

### Resend Dashboard
- Monitor email delivery rates
- Check bounce/spam rates
- Review send volumes

---

## 🐛 Troubleshooting

### Email not sending
1. Check Resend dashboard for errors
2. Verify domain DNS records
3. Check API key in environment variables
4. Review Vercel function logs

### Database connection errors
1. Verify DATABASE_URL is correct
2. Check database is running
3. Confirm connection limit not exceeded
4. Review Prisma logs in Vercel

### Login not working
1. Verify NEXTAUTH_SECRET is set
2. Confirm NEXTAUTH_URL matches domain
3. Check password hash is valid bcrypt
4. Review NextAuth callback logs

### Referral code not working
1. Verify code exists in database
2. Check code is unique
3. Confirm Strategic Partner status is Active
4. Review assignment logic in logs

---

## 📝 Next Steps (Future Enhancements)

- [ ] Add Strategic Partner creation form (Admin UI)
- [ ] Build status update buttons (Mark as Invited, etc.)
- [ ] Add manual reassignment (Admin override)
- [ ] Implement 48-hour follow-up automation
- [ ] Add Team Admin creation flow
- [ ] Build analytics dashboard
- [ ] Add password reset flow
- [ ] Implement rate limiting
- [ ] Add request notes/comments
- [ ] Build notification preferences

---

## 🆘 Support

If you encounter issues:
1. Check Vercel function logs
2. Review Prisma query logs
3. Check Resend delivery logs
4. Verify DNS propagation (https://dnschecker.org)

---

**Deployment Complete! 🎉**

Your Citizen Activation System is now live at:
**https://citizenactivation.com**
