# White-Label Setup Guide

**Version:** 1.0  
**Last Updated:** May 21, 2026

---

## OVERVIEW

This guide walks you through deploying a complete White-Label Citizen Activation System for a customer who has paid $1,997 (promo) or $2,997 (regular) + $497/year.

**Time Required:** 15-20 minutes per deployment

---

## PREREQUISITES

- Customer has paid $1,997 or $2,997 + $497/year
- Customer domain name (e.g., hub.customercompany.com)
- Customer admin email
- Customer logo URL (optional)
- Vercel account access
- Neon database account access

---

## DEPLOYMENT STEPS

### Step 1: Gather Customer Information

Collect from customer:
- [ ] Company/Organization Name
- [ ] Admin Email Address
- [ ] Desired Domain (e.g., hub.theircompany.com)
- [ ] Logo URL (optional)

---

### Step 2: Create Neon Database

1. Go to https://console.neon.tech
2. Click "New Project"
3. Project name: `[Customer Name] - Citizen Activation`
4. Region: Choose closest to customer
5. Copy the connection string (PostgreSQL)
6. Save it securely

**Connection string format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

### Step 3: Run Deployment Script

```bash
cd /root/.openclaw/workspace/citizen-activation-system
./scripts/deploy-white-label.sh \
  "Customer Company Name" \
  "hub.customercompany.com" \
  "admin@customercompany.com" \
  "https://customercompany.com/logo.png"
```

The script will:
- Create deployment directory
- Configure environment variables
- Generate secure secrets
- Run database migrations
- Create Main Admin account
- Output temp password

**Save the output!** You'll need:
- Temp password
- All environment variables
- Deployment directory path

---

### Step 4: Deploy to Vercel

#### Option A: Manual Vercel Deployment

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import the deployment directory from Step 3
4. Configure environment variables from `.env.local`:
   ```
   DATABASE_URL=<from Neon>
   NEXTAUTH_SECRET=<generated>
   NEXTAUTH_URL=https://hub.customercompany.com
   RESEND_API_KEY=re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf
   CRON_SECRET=<generated>
   WHITE_LABEL_MODE=true
   WHITE_LABEL_CUSTOMER=Customer Company Name
   WHITE_LABEL_LOGO=https://customercompany.com/logo.png
   ```
5. Click "Deploy"
6. Wait for build to complete

#### Option B: Vercel CLI Deployment

```bash
cd [deployment-directory]
vercel --prod
# Follow prompts
# Set environment variables when prompted
```

---

### Step 5: Configure Custom Domain

1. In Vercel project settings
2. Go to "Domains"
3. Add: `hub.customercompany.com`
4. Copy DNS records provided
5. Send DNS records to customer:
   ```
   CNAME: hub → cname.vercel-dns.com
   ```
6. Wait for DNS propagation (5-60 minutes)
7. Verify SSL certificate issued

---

### Step 6: Test Deployment

1. Visit: `https://hub.customercompany.com`
2. Verify public request form loads
3. Visit: `https://hub.customercompany.com/login`
4. Login with:
   - Email: [customer admin email]
   - Password: [temp password from Step 3]
5. Verify Main Admin dashboard loads
6. Verify "Add Admin" button is HIDDEN (White-Label mode)
7. Verify "+ Add Strategic Partner" button works
8. Test adding a test Strategic Partner
9. Test public form submission

---

### Step 7: Send Credentials to Customer

**Email Template:**

```
To: [customer admin email]
Subject: Your Citizen Activation System is Ready!

Hello,

Your White-Label Citizen Activation System is now live!

🔗 Login URL: https://hub.customercompany.com/login
📧 Email: admin@customercompany.com
🔑 Temporary Password: [temp password]

⚠️ Please login and change your password immediately:
1. Login at the URL above
2. Click "Profile" in the top navigation
3. Change your password

Your System Features:
• Add Strategic Partners (unlimited)
• Manage MOSCA invitation requests
• Automated Round Robin assignment
• Email notifications
• 3-day escalation alerts
• Complete system control

Public Request Form:
Share this URL to collect MOSCA invitation requests:
https://hub.customercompany.com

Support:
For technical support, contact: marketleveragingmedia@agentmail.to

Annual Maintenance:
Your annual fee of $497/year ensures:
• System updates
• Security patches
• Email support
• Uptime monitoring

Thank you for your business!

Samantha
marketleveragingmedia@agentmail.to
```

---

### Step 8: Add Customer to Tracking

Update your records:
- Customer Name
- Domain
- Deploy Date
- Annual Renewal Date (1 year from deploy)
- Contact Email
- One-time Payment: $1,997 or $2,997 ✅
- Annual Fee: $497/year (due [date])

---

## WHITE-LABEL MODE FEATURES

**What's Different in White-Label:**

✅ Customer is Main Admin of THEIR system
✅ Completely isolated database (no shared data)
✅ Their own domain and branding
✅ Logo displays on dashboard
✅ Can add Strategic Partners (unlimited)
✅ Can manage all requests
✅ Full system control

❌ **Cannot add Team Admins or Organization Admins** (no "Add Admin" button)
❌ No multi-tenant features
❌ Single organization use only

---

## ADDING SOLO ORGS TO WHITE-LABEL SYSTEMS

When White-Label customer wants to add a Solo Org ($997 + $497/year):

1. Solo Org fills out YOUR form (to be built)
2. Solo Org pays YOU directly: $997 + $497/year
3. Form asks: "Which White-Label system?"
4. YOU receive payment + form data
5. YOU log into that White-Label system as Main Admin
6. YOU add the Solo Org manually (future feature - Phase 7)
7. White-Label customer benefits from having them in THEIR system

**Revenue: $997 + $497/year goes to YOU, not White-Label customer**

---

## TROUBLESHOOTING

### Database Connection Failed
- Verify connection string format
- Check Neon project is active
- Ensure SSL mode is required
- Test connection: `psql [connection-string]`

### DNS Not Resolving
- Wait 5-60 minutes for propagation
- Verify CNAME record: `dig hub.customercompany.com`
- Check Cloudflare proxy is disabled (DNS only)

### Login Not Working
- Verify temp password was copied correctly
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches domain
- Check database has admin record

### Email Not Sending
- Verify RESEND_API_KEY is correct
- Check Resend domain (m.citizenactivation.com) is verified
- Verify email address format

### Logo Not Showing
- Verify logo URL is publicly accessible
- Check image format (PNG, JPG, SVG)
- Verify WHITE_LABEL_LOGO env var is set

---

## MAINTENANCE

### Annual Renewal ($497/year)

1. Send renewal invoice 30 days before due date
2. Upon payment, update tracking records
3. No system changes needed (continues working)

### System Updates

When you deploy updates to YOUR system:
1. Test in YOUR system first
2. Deploy to White-Label systems during maintenance windows
3. Notify customers 48 hours in advance
4. Deploy updates via Vercel (auto-redeploys from git)

### Customer Support

**You provide:**
- Email support
- Bug fixes
- Security patches
- System updates

**You do NOT provide:**
- Training on MOSCA itself
- Custom feature development (unless paid)
- 24/7 support (business hours only)

---

## PRICING SUMMARY

**White-Label System:**
- One-time: $1,997 (promo) or $2,997 (regular)
- Annual: $497/year
- Includes: System, deployment, setup, support

**Solo Org Add-On (to White-Label system):**
- Setup: $997 (paid to YOU)
- Annual: $497/year (paid to YOU)
- YOU deploy, YOU maintain
- White-Label customer benefits from network growth

---

## CHECKLIST

Use this for each deployment:

- [ ] Customer payment confirmed ($1,997 or $2,997)
- [ ] Customer information collected
- [ ] Neon database created
- [ ] Deployment script run successfully
- [ ] Temp password saved
- [ ] Vercel deployment complete
- [ ] Custom domain configured
- [ ] DNS propagated and SSL active
- [ ] System tested (login, add partner, public form)
- [ ] Credentials email sent to customer
- [ ] Customer added to renewal tracking
- [ ] Deployment documented

---

## SUPPORT

**For deployment issues:**
Contact: marketleveragingmedia@agentmail.to

**For customer questions:**
Direct customers to: marketleveragingmedia@agentmail.to

---

**END OF WHITE-LABEL SETUP GUIDE**
