# Citizen Activation System - Final Architecture

**Date:** May 21, 2026  
**Status:** ✅ **READY TO DEPLOY**

---

## 🏗️ Domain Structure (FINAL)

### **citizenactivation.com** (Root Domain)
**Platform:** Poplinks Landing Page  
**Purpose:** Public-facing marketing, sales, purchase flow  
**Access:** Public (anyone)  
**Function:**
- Explain MOSCA value proposition
- Showcase benefits
- Capture leads
- Sell Citizen ($225) and Enterprise ($525) activations
- Handle payment processing

**You manage this in:** Poplinks dashboard

---

### **hub.citizenactivation.com** (Subdomain)
**Platform:** Strategic Partner Hub (Next.js Application)  
**Purpose:** Internal request management system  
**Access:** Login-only (Strategic Partners + Admins)  
**Function:**
- Public request form (anyone can submit)
- Automatic Round Robin assignment
- MOSCA referral code routing
- Email notifications
- Strategic Partner dashboards
- Admin dashboards
- Request tracking and management

**This is what we just built:** The MVP application

**DNS Setup:**
```
Type: CNAME
Name: hub
Value: cname.vercel-dns.com
```

---

### **m.citizenactivation.com** (Email Domain)
**Platform:** Resend (Transactional Email Service)  
**Purpose:** Automated email notifications  
**Function:**
- Requester confirmation emails
- Strategic Partner assignment notifications
- New Strategic Partner welcome emails

**API Key:** `re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf`  
**From Address:** `Strategic Partner Hub <notifications@m.citizenactivation.com>`

**DNS Setup:**
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

---

## 🔄 Complete User Journeys

### Journey 1: Prospect → Customer (Poplinks Flow)
1. Prospect visits `citizenactivation.com`
2. Reads about MOSCA (Poplinks landing page)
3. Clicks CTA → Purchase flow
4. Completes payment (Citizen $225 or Enterprise $525)
5. Receives purchase confirmation
6. **Manual handoff:** You process their activation in MOSCA

**This flow is entirely in Poplinks** (not the Hub)

---

### Journey 2: Prospect → Request → Strategic Partner (Hub Flow)
1. Prospect visits `hub.citizenactivation.com` (or gets link from Strategic Partner)
2. Fills out request form
3. **Optional:** Uses Strategic Partner referral code
4. Submits request
5. **Automatic:** Assigned to Strategic Partner (Round Robin or direct via referral code)
6. **Automatic:** Emails sent (requester + Strategic Partner)
7. Strategic Partner contacts requester
8. Strategic Partner processes in MOSCA Back Office
9. Strategic Partner updates status in Hub
10. When activated → Requester becomes new Strategic Partner

**This flow is entirely in the Hub** (what we built)

---

### Journey 3: Strategic Partner Dashboard Access
1. Strategic Partner activated in MOSCA → Receives referral code
2. You create their Hub account → Send welcome email with credentials
3. Strategic Partner visits `hub.citizenactivation.com/login`
4. Logs in with email + password
5. Sees dashboard at `hub.citizenactivation.com/dashboard`
6. Views assigned requests
7. Sees their referral code
8. Shares referral code: `hub.citizenactivation.com/?ref=MOSCA-CODE`
9. Updates request status after processing in MOSCA

**This flow is in the Hub**

---

### Journey 4: Admin (You) Dashboard Access
1. You visit `hub.citizenactivation.com/login`
2. Login: `marketleveragingmedia@agentmail.to`
3. See Main Admin Dashboard
4. View all requests across all Strategic Partners
5. Monitor system-wide stats
6. Override assignments if needed (future feature)
7. Add new Strategic Partners (manual via database for now)

**This flow is in the Hub**

---

## 📊 System Integration Points

### Poplinks (Root Domain) ↔ Hub (Subdomain)
**Connection:** Indirect (no API integration)

**How they work together:**
- Poplinks = Lead capture + purchase
- Hub = Request management + assignment

**No technical integration required** - they operate independently

**Optional future integration:**
- Add "Request Invitation" link on Poplinks page → Points to `hub.citizenactivation.com`
- Strategic Partners can share Hub link with referral code

---

### Hub (Subdomain) ↔ MOSCA (External Web3 Platform)
**Connection:** Manual bridge (no API integration)

**How they work together:**
1. Hub assigns request to Strategic Partner
2. Strategic Partner logs into MOSCA Back Office (separate platform)
3. Strategic Partner sends MOSCA invitation (in MOSCA)
4. Strategic Partner schedules onboarding (in MOSCA)
5. Strategic Partner returns to Hub → Updates status manually
6. Hub tracks progression (Assigned → Invited → Onboarding Scheduled → Activated)

**No technical integration possible** - MOSCA is closed Web3 platform

---

### Hub (Subdomain) ↔ Resend (Email Service)
**Connection:** API integration (fully automated)

**How they work together:**
1. Request submitted in Hub
2. Hub calls Resend API
3. Emails sent automatically
4. Links in emails point back to Hub

**Fully integrated** - no manual steps

---

## 🗂️ Data Flow

### Request Submission Flow:
```
User fills form on hub.citizenactivation.com
    ↓
Hub validates data
    ↓
Hub checks for referral code
    ↓ (if code)           ↓ (no code)
Direct assignment    Round Robin assignment
    ↓                     ↓
    └──────────┬──────────┘
               ↓
    Request saved to database
               ↓
    Strategic Partner slots updated
               ↓
    Email sent to requester (Resend)
               ↓
    Email sent to Strategic Partner (Resend)
               ↓
    Complete
```

### Round Robin Assignment Logic:
```
New request (no referral code)
    ↓
Find all Active Strategic Partners
    ↓
Filter out Full (3/3 slots)
    ↓
Filter out Paused
    ↓
Sort by: Fewest slots used → Longest wait
    ↓
Assign to first in list
    ↓
Update slots used + last assigned timestamp
    ↓
If 3/3 → Mark as Full
```

### Referral Code Assignment Logic:
```
New request (with referral code)
    ↓
Validate code in database
    ↓
Find Strategic Partner with matching code
    ↓
Verify: Active status + Same team
    ↓
Assign directly (bypass Round Robin)
    ↓
Allow even if Full (referral priority)
    ↓
Update slots + timestamp
```

---

## 🔐 Security Model

### Public Access (No Login Required):
- `hub.citizenactivation.com` - Request form
- `hub.citizenactivation.com/login` - Login page

### Protected Access (Login Required):
- `hub.citizenactivation.com/dashboard` - Role-based dashboards
- `hub.citizenactivation.com/api/*` - Some API endpoints

### Authentication:
- NextAuth with JWT sessions
- bcrypt password hashing
- Role-based access control (MAIN_ADMIN, TEAM_ADMIN, STRATEGIC_PARTNER)

### Data Security:
- PostgreSQL database (encrypted at rest)
- All connections HTTPS
- Environment variables for secrets
- No sensitive data in client-side code

---

## 📧 Email Templates

### 1. Requester Confirmation
**Trigger:** Form submission  
**To:** Requester  
**Subject:** "MOSCA Invitation Request Received - [Level] Activation"  
**Content:**
- Thank you message
- Activation level confirmed
- What happens next (4 steps)
- Timeline (24-48 hours)

### 2. Strategic Partner Assignment
**Trigger:** Form submission  
**To:** Assigned Strategic Partner  
**Subject:** "New MOSCA Invitation Request - [Name] - [Level]"  
**Content:**
- Requester details (name, email, phone, referral code if used)
- Activation level
- Next steps (6 action items)
- Link to dashboard
- Timeline expectation (24-48 hours)

### 3. New Strategic Partner Welcome
**Trigger:** Request marked "Activated"  
**To:** Newly activated Strategic Partner  
**Subject:** "Welcome to MOSCA - You're now a Strategic Partner!"  
**Content:**
- Congratulations message
- Login credentials (email + temp password)
- Link to dashboard
- Instructions (create new password + enter MOSCA referral code)
- Slot availability (3 slots)

---

## 🎯 Success Metrics

**The system is working correctly when:**

✅ Requests submit successfully  
✅ Emails deliver within 1 minute  
✅ Round Robin distributes fairly (fewest slots first)  
✅ Referral codes route directly (bypass Round Robin)  
✅ Slots track accurately (0/3 → 3/3)  
✅ Main Admin sees ALL requests  
✅ Strategic Partners see ONLY their requests  
✅ Login works for both roles  
✅ Dashboards display correct data  
✅ Status badges show correctly  

---

## 📂 Deployment Files

**Primary Deployment Guide:**
- `HUB-DEPLOYMENT.md` - Complete step-by-step for hub.citizenactivation.com

**Supporting Documentation:**
- `README.md` - Development overview
- `MVP-SUMMARY.md` - Feature list + technical specs
- `QUICKSTART.md` - 5-minute local testing
- `DEPLOYMENT-STRUCTURE.md` - Architecture decisions
- `FINAL-ARCHITECTURE.md` - This file

---

## ✅ Pre-Deployment Checklist

- [x] Application built and tested
- [x] Database schema finalized
- [x] Email templates created
- [x] Authentication working
- [x] Dashboards functional
- [x] Round Robin logic tested
- [x] Referral code routing tested
- [x] Domain architecture decided (hub.citizenactivation.com)
- [x] Documentation complete

**Ready for:**
- [ ] PostgreSQL database provisioning
- [ ] Resend domain verification (if not done)
- [ ] Vercel deployment
- [ ] DNS configuration (hub subdomain)
- [ ] Production migration + seed
- [ ] Password changes
- [ ] End-to-end testing

---

## 🚀 Deployment Command Summary

```bash
# 1. Deploy to Vercel
cd /root/.openclaw/workspace/citizen-activation-system
vercel

# 2. Add environment variables in Vercel dashboard
# (See HUB-DEPLOYMENT.md for complete list)

# 3. Run production migration
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# 4. Configure DNS
# Add CNAME: hub → cname.vercel-dns.com

# 5. Test
# Visit: https://hub.citizenactivation.com
```

---

## 🎉 Final Status

**Strategic Partner Hub MVP:** ✅ **COMPLETE**

**What's built:**
- Public request form
- Round Robin + Referral assignment
- Email automation
- Main Admin dashboard
- Strategic Partner dashboard
- Authentication system
- Database with seed data

**Deployment target:** hub.citizenactivation.com

**Time to deploy:** 30-45 minutes

**Next step:** Follow `HUB-DEPLOYMENT.md`

---

**Built for:** Samantha (@MzSamantha)  
**Project:** Citizen Activation System (Strategic Partner Hub)  
**Status:** 🚀 **READY TO LAUNCH**
