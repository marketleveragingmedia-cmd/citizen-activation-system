# Deployment Health Checklist

## Weekly Checks (5 minutes)

### 1. Verify Auto-Deploy is Working
1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-system/deployments
2. Check: Latest deployment matches latest GitHub commit
3. Check: "Auto-deployed" tag appears on deployments

### 2. Test Critical User Flows
- [ ] Request form submission works
- [ ] Login works (test with demo account)
- [ ] Dashboard loads
- [ ] Payment checkout page loads

### 3. Check Error Logs
1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-system/logs
2. Look for red errors in last 7 days
3. Investigate anything recurring

---

## Monthly Checks (15 minutes)

### 1. Database Health
- [ ] PostgreSQL connection count under 80%
- [ ] No slow queries in logs
- [ ] Backup/restore tested

### 2. Stripe Integration
- [ ] Test payment (use Stripe test mode)
- [ ] Check webhook delivery logs
- [ ] Verify commission splits working

### 3. Email Delivery
- [ ] Send test welcome email
- [ ] Check spam score
- [ ] Verify all email templates render

---

## Before Major Sales Push

### 1. Load Testing
- [ ] Simulate 50+ concurrent signups
- [ ] Test dashboard with 1000+ requests
- [ ] Verify payment processing under load

### 2. Backup Everything
- [ ] Export database backup
- [ ] Download latest GitHub code
- [ ] Save Vercel environment variables

### 3. Set Up Alerts
- [ ] Vercel deployment failures → your email
- [ ] Stripe webhook failures → your email
- [ ] Database errors → your email

---

## When Things Break (Recovery Plan)

### If Deployment Fails:
1. Check Vercel deployment logs
2. Look for build errors
3. Redeploy manually if needed
4. Users can still login/use existing features

### If Payments Fail:
1. Check Stripe dashboard for errors
2. Verify webhook endpoint is live
3. Test with Stripe test card
4. Customers can retry payment link

### If Database Goes Down:
1. Check Vercel Postgres status page
2. Verify connection string in env vars
3. Use Vercel dashboard to restart
4. Restore from backup if needed

---

## Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Stripe Support:** https://support.stripe.com
- **GitHub Status:** https://www.githubstatus.com
- **Your AI Assistant:** (that's me! 😊)

---

## Status Page (Set Up Later)

Consider: https://status.io or https://statuspage.io

Shows customers:
- ✅ All systems operational
- ⚠️ Degraded performance
- ❌ Outage (with ETA)

Builds trust when selling enterprise accounts.
