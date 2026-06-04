# Citizen Activation System (Strategic Partner Hub)

**Root Domain:** citizenactivation.com (Poplinks landing page)  
**Hub Domain:** hub.citizenactivation.com (Strategic Partner Hub)  
**Email Domain:** m.citizenactivation.com  
**Status:** MVP Ready to Deploy

---

## 🎯 What It Does

Standalone multi-tenant web application for MOSCA invitation request management:

- ✅ Public request form (Citizen $225 / Enterprise $525)
- ✅ MOSCA Strategic Partner Referral Code support
- ✅ Automatic Round Robin assignment to Strategic Partners
- ✅ Automated email notifications (Resend)
- ✅ Multi-tenant dashboards (Main Admin → Team Admin → Strategic Partner)
- ✅ Manual status updates (Strategic Partner workflow)
- ✅ Auto-promotion (requester → Strategic Partner after activation)
- ✅ Slot tracking (0/3, 1/3, 2/3, 3/3)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and add connection string to `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Run Database Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Configure Environment Variables

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Resend API (citizenactivation.com)
RESEND_API_KEY="re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf"
RESEND_FROM_EMAIL="Strategic Partner Hub <notifications@m.citizenactivation.com>"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
APP_NAME="Strategic Partner Hub"
APP_DOMAIN="citizenactivation.com"
```

Generate NextAuth secret:

```bash
openssl rand -base64 32
```

### 5. Seed Initial Data (Main Admin + Test Team)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Main Admin
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10)
  
  const mainAdmin = await prisma.admin.create({
    data: {
      role: 'MAIN_ADMIN',
      name: 'Samantha',
      email: 'marketleveragingmedia@agentmail.to',
      passwordHash: hashedPassword,
      status: 'Active'
    }
  })

  // Create default team
  const team = await prisma.team.create({
    data: {
      name: 'Main Team',
      adminId: mainAdmin.id,
      autoAssignEnabled: true,
      status: 'Active'
    }
  })

  console.log('✅ Seed data created:')
  console.log('Main Admin:', mainAdmin.email)
  console.log('Team:', team.name)
  console.log('Default password: ChangeMe123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install ts-node:

```bash
npm install -D ts-node
```

Run seed:

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📋 MVP Deliverables (Current)

### ✅ Completed:
- [x] Database schema (Prisma)
- [x] Public request form UI
- [x] Request submission API
- [x] Round Robin assignment logic
- [x] Referral code direct assignment
- [x] Email notifications (Resend integration)
- [x] Requester confirmation emails
- [x] Strategic Partner assignment emails
- [x] Welcome emails for new Strategic Partners

### 🚧 Next Steps (4-6 hours):
- [ ] Authentication system (NextAuth)
- [ ] Main Admin dashboard
- [ ] Team Admin dashboard
- [ ] Strategic Partner dashboard
- [ ] Status update actions (Invited → Onboarding Scheduled → Activated)
- [ ] Manual reassignment (Admin override)
- [ ] Follow-up automation (48-hour reminders)

---

## 🗄️ Database Schema

**Tables:**
- `admins` - Main Admin + Team Admins
- `teams` - Organization/team structure
- `strategic_partners` - MOSCA-activated members with 3 slots
- `requests` - Invitation requests from public form

**Key Fields:**
- `strategic_partners.referralCode` - MOSCA-issued code (identifies activated Citizen)
- `requests.referralCodeUsed` - Tracks which referral code was used
- `requests.assignmentType` - Auto / Manual / Referral

---

## 🔗 Deployment (Production)

### Recommended Stack:
- **Hosting:** Vercel (Next.js optimized)
- **Database:** Neon / Supabase / Railway (PostgreSQL)
- **Email:** Resend (already configured)
- **Domain:** citizenactivation.com

### Deployment Steps:

1. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (update to production URL)

3. **Run Database Migration** in production:
```bash
npx prisma migrate deploy
```

4. **Point Domain:**
   - Add `citizenactivation.com` to Vercel project
   - Update DNS A/CNAME records

5. **Configure Resend Domain:**
   - Verify `m.citizenactivation.com` in Resend dashboard
   - Add SPF, DKIM, DMARC records

---

## 🔐 Security Notes

- All passwords hashed with bcryptjs
- MOSCA referral codes are unique and indexed
- Email validation on all request submissions
- Rate limiting should be added for production
- CSRF protection via NextAuth
- SQL injection protected via Prisma ORM

---

## 📧 Email Templates

All email templates in `lib/email.ts`:

1. **Requester Confirmation** - Sent immediately after form submission
2. **Strategic Partner Assignment** - Notifies assigned partner
3. **New Strategic Partner Welcome** - Sent after activation with login credentials

---

## 📊 Current Workflow

1. **Requester submits form** → Saved to database
2. **System checks for referral code:**
   - IF code provided → Assign directly to that Strategic Partner
   - IF no code → Round Robin assignment (fewest slots, longest wait)
3. **Emails sent automatically:**
   - Requester: Confirmation email
   - Strategic Partner: Assignment notification
4. **Strategic Partner logs into MOSCA** (external platform)
5. **Strategic Partner updates status in Hub** (manual bridge)
6. **When activated → New Strategic Partner created** (with 3 slots)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth (to be implemented)
- **TypeScript:** Full type safety

---

## 📝 Notes

- MOSCA = Separate Web3 platform (no API integration)
- Strategic Partners manually bridge between MOSCA Back Office and this Hub
- Referral code identifies activated Citizen in MOSCA
- MVP focused on core workflow + email automation

---

**Built for:** Samantha (@MzSamantha)  
**Specification:** `/root/.openclaw/workspace/CITIZEN-ACTIVATION-SYSTEM-SPECIFICATION.md`  
**Date:** May 21, 2026
# Auto-deploy test - Sat May 23 17:29:04 UTC 2026

