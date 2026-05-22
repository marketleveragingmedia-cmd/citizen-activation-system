# Citizen Activation System - Quick Start

**For Samantha:** Get the MVP running locally in 5 minutes.

---

## ✅ What's Built (100% Complete)

- ✅ Public request form (citizenactivation.com homepage)
- ✅ Round Robin + Referral Code assignment
- ✅ Email automation (Resend)
- ✅ Main Admin dashboard
- ✅ Strategic Partner dashboard
- ✅ Authentication system
- ✅ Database schema (PostgreSQL + Prisma)
- ✅ Build tested and working

---

## 🚀 Two Paths

### Path 1: Deploy to Production NOW (30 min)
**Follow:** `HUB-DEPLOYMENT.md`

Strategic Partner Hub will be live at:
**https://hub.citizenactivation.com**

---

### Path 2: Test Locally First (5 min)

#### Step 1: Set Up Database (Skip if deploying)
```bash
# Use a PostgreSQL provider (Neon is easiest)
# Go to: https://neon.tech
# Create project, copy connection string
```

#### Step 2: Configure Environment
```bash
cd /root/.openclaw/workspace/citizen-activation-system

# Create .env.local with your database URL
echo 'DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?schema=public"' > .env.local
echo 'RESEND_API_KEY="re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf"' >> .env.local
echo 'RESEND_FROM_EMAIL="Strategic Partner Hub <notifications@m.citizenactivation.com>"' >> .env.local
echo 'NEXTAUTH_SECRET="'$(openssl rand -base64 32)'"' >> .env.local
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env.local
```

#### Step 3: Initialize Database
```bash
# Run migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed initial data
npx prisma db seed
```

**You'll get:**
- Main Admin: `marketleveragingmedia@agentmail.to` / `ChangeMe123!`
- Test Partner: `test.partner@example.com` / `ChangeMe123!`
- Test Referral Code: `MOSCA-TEST-001`

#### Step 4: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

#### Step 5: Test Workflows

**A. Test Public Request Form**
1. Go to: http://localhost:3000
2. Fill out form
3. Use referral code: `MOSCA-TEST-001`
4. Submit
5. Check emails (requester + partner notifications)

**B. Login as Main Admin**
1. Go to: http://localhost:3000/login
2. Email: `marketleveragingmedia@agentmail.to`
3. Password: `ChangeMe123!`
4. See all requests in dashboard

**C. Login as Strategic Partner**
1. Go to: http://localhost:3000/login
2. Email: `test.partner@example.com`
3. Password: `ChangeMe123!`
4. See only your assigned requests

---

## 📂 Project Location

```
/root/.openclaw/workspace/citizen-activation-system/
```

## 📖 Documentation

- **DEPLOY.md** - Production deployment guide (30-45 min)
- **README.md** - Development guide + overview
- **MVP-SUMMARY.md** - Complete feature list + specs
- **QUICKSTART.md** - This file

---

## 🎯 What's Next?

1. **Deploy to production** (follow DEPLOY.md)
2. **Test with real MOSCA members**
3. **Start collecting real invitation requests**
4. **Future:** Add status update buttons, follow-up automation

---

## 🆘 Need Help?

All files are in:
```
/root/.openclaw/workspace/citizen-activation-system/
```

**Key files:**
- `app/page.tsx` - Public request form
- `app/dashboard/page.tsx` - Dashboards
- `app/api/request/route.ts` - Request API
- `lib/assignment.ts` - Round Robin logic
- `lib/email.ts` - Email templates
- `prisma/schema.prisma` - Database schema

---

**Status:** ✅ **READY TO LAUNCH**  
**Next Step:** Follow `DEPLOY.md` to go live at citizenactivation.com
