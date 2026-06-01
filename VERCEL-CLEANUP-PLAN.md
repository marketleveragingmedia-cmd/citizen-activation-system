# VERCEL CLEANUP PLAN

## ❌ DELETE THESE PROJECTS:

### 1. `workspace`
- **Why:** Accidental deployment from workspace folder
- **Status:** No production deployment
- **Action:** Delete entire project
- **How:** Vercel Dashboard → workspace → Settings → Delete Project

### 2. `citizen-activation-system-new`
- **Why:** Duplicate/test project from May 22
- **Status:** No Git repo connected
- **Action:** Delete entire project
- **How:** Vercel Dashboard → citizen-activation-system-new → Settings → Delete Project

---

## ✅ KEEP THESE PROJECTS:

### 1. `citizen-activation-hub`
- **Domain:** hub.citizenactivation.com
- **Repo:** marketleveragingmedia-cmd/citizen-activation-system
- **Status:** ✅ Production - KEEP
- **Latest:** "Revert Add commission split to White Label tier" (15h ago)

### 2. `mlm-command-center`
- **Domain:** mlm-command-center.vercel.app
- **Repo:** marketleveragingmedia-cmd/mlm-command-center
- **Status:** ✅ Production - KEEP
- **Latest:** "Fix pricing model" (1d ago)

---

## 📊 COST REDUCTION:

### Current Issues:
- **Build CPU Minutes:** $37.99 (TOO HIGH)
- **Total On-Demand:** $18.60

### Causes:
1. Multiple unnecessary deployments
2. Workspace project builds
3. Preview branches building on every push

### Solutions:
1. ✅ Delete `workspace` project (stops builds)
2. ✅ Delete `citizen-activation-system-new` (stops builds)
3. ⚠️ Consider: Ignore preview deployments for minor changes
4. ⚠️ Consider: Limit build minutes in settings

---

## 🧹 PREVIEW BRANCH CLEANUP:

### `clean-build-preview`
- **Status:** Preview only (not merged)
- **Action:** After reviewing, either:
  - Merge to main if good
  - Delete branch if not needed

---

## 🎯 FINAL STATE (After Cleanup):

**2 Projects Only:**
1. `citizen-activation-hub` (hub.citizenactivation.com)
2. `mlm-command-center` (mlm-command-center.vercel.app)

**Reduced Costs:**
- No more `workspace` builds
- No more `citizen-activation-system-new` builds
- Cleaner dashboard

---

## ⚠️ DO NOT DELETE:

- `citizen-activation-hub` (PRODUCTION)
- `mlm-command-center` (PRODUCTION)
- Postgres databases
- Environment variables

---

**READY TO EXECUTE CLEANUP?**
