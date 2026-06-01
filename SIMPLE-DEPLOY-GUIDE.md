# SIMPLE DEPLOYMENT GUIDE

**Stop wasting time. Use this instead.**

---

## Option 1: One Command (Recommended)

```bash
cd /root/.openclaw/workspace/citizen-activation-system
./deploy.sh
```

**That's it.** 

Deployment triggers in background. Takes 3-5 minutes.

---

## Option 2: Manual Trigger

If the script doesn't work:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_WOC6lzkUMTH2YQhiDFM8PQNAq5VB/uZkd117edF"
```

---

## When Deployment Fails

**Stop trying to fix it blindly.**

1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-hub/deployments
2. Click the FAILED deployment
3. Scroll to the LAST 20 lines
4. Copy the error
5. Send it to your AI assistant

**Then and ONLY then** will we know what to fix.

---

## Why Auto-Deploy is Broken

Vercel's GitHub webhook is disconnected. This is a **one-time reconnect** issue.

**To fix permanently:**

1. Go to: https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-hub/settings/git
2. Click **"Disconnect"**
3. Click **"Connect Git Repository"**
4. Select GitHub → citizen-activation-system
5. Click **"Connect"**

**That's it.** Auto-deploy will work again.

---

## Cost vs Value

**Current situation:**
- ❌ Spending hours troubleshooting blind deployment failures
- ❌ Making changes without knowing what the error is
- ❌ Wasting time and money

**Better approach:**
- ✅ Use `./deploy.sh` to deploy
- ✅ Check error logs FIRST
- ✅ Fix the ACTUAL problem (not guessing)
- ✅ Reconnect GitHub webhook (one time, 2 minutes)

---

## Bottom Line

**Stop now. Use the deploy script. Check the error. Then we'll fix it properly.**

Trying to fix deployment issues without seeing the error is like fixing a car engine blindfolded.

---

**Files created:**
- `/root/.openclaw/workspace/citizen-activation-system/deploy.sh` (one-command deploy)
- This guide

**Next step:** Run `./deploy.sh`, get the error, send it to me.
