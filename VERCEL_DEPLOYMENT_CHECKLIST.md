# 🚀 Vercel Deployment Checklist

## ✅ PRE-DEPLOYMENT (Do This First)

### 1. Test Local Build (CRITICAL)
```bash
npm run build
```
**Expected:** Build completes with 0 errors
**If fails:** Read error message and fix before deploying

### 2. Verify Environment Variables
Check `.env.production` has all required values:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_APP_URL
- ✅ CEO_ROLE_CODE
- ✅ MANAGER_ROLE_CODE

---

## 🔧 VERCEL DASHBOARD SETUP

### Step 1: Add Environment Variables
Go to: **Vercel Dashboard > Your Project > Settings > Environment Variables**

Add these **EXACT** variables for **Production, Preview, Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wpkyzdpnhiucctdangwf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwa3l6ZHBuaGl1Y2N0ZGFuZ3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTc4MjEsImV4cCI6MjA4NTE5MzgyMX0.eHVO2KzXswtLJuXBGQ4dLghjHvLR-AX_5pjxEIxdQsI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwa3l6ZHBuaGl1Y2N0ZGFuZ3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxNzgyMSwiZXhwIjoyMDg1MTkzODIxfQ.0Enuavmzw9TRWkTBIUW8Rj9BYd3_GOpQB3qxgtpwb84
NEXT_PUBLIC_APP_URL=https://msoec.vercel.app
CEO_ROLE_CODE=CE@
MANAGER_ROLE_CODE=MG$
```

### Step 2: Node.js Version
Go to: **Settings > General > Node.js Version**
- Set to: **20.x** (recommended) or **18.x**

### Step 3: Build & Output Settings
Go to: **Settings > General > Build & Development Settings**
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next` (default)
- Install Command: `npm install`

---

## 🗄️ SUPABASE SETUP

### Required Database Migrations

Run these SQL scripts in Supabase SQL Editor:

#### 1. Add is_winner Column (if missing)
```sql
-- File: Docs/SQL/add_is_winner_column.sql
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_submissions_is_winner 
ON submissions(is_winner) WHERE is_winner = true;
```

#### 2. Verify Schema
Check these columns exist:
- `competitions.end_at` (NOT end_date)
- `submissions.is_winner`
- `users.role` (ceo, manager, participant)

---

## 🚨 COMMON BUILD ERRORS & FIXES

### Error: "Module not found: Can't resolve '@/...'"
**Fix:** Check `tsconfig.json` has correct paths:
```json
"paths": {
  "@/*": ["./*"]
}
```

### Error: "cookies() expects to be called within a request scope"
**Fix:** Ensure `createClient()` is only called inside:
- Server Components (async functions)
- Server Actions ('use server')
- API Routes
- NOT at module top-level

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Fix:** Add env vars in Vercel Dashboard (see Step 1 above)

### Error: "Type error: Property 'X' does not exist"
**Fix:** Run `npm run build` locally to see full error
- Add proper TypeScript types
- Or add `// @ts-ignore` above the line (temporary)

### Error: "column does not exist"
**Fix:** Run missing SQL migrations in Supabase

---

## 📦 DEPLOYMENT STEPS

### Option A: Git Push (Recommended)
```bash
git add .
git commit -m "fix: production build configuration"
git push origin main
```
Vercel auto-deploys on push.

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Check Build Logs
- Go to Vercel Dashboard > Deployments > Latest
- Click "View Build Logs"
- Verify: "Build Completed" with no errors

### 2. Test Live Site
Visit: https://msoec.vercel.app

Test these pages:
- ✅ Homepage loads
- ✅ Login page works
- ✅ Signup page works
- ✅ Dashboard loads (after login)
- ✅ No console errors (F12)

### 3. Test Database Connection
- Try logging in with test account
- Check if data loads in dashboard
- Verify Supabase connection works

---

## 🔍 DEBUGGING FAILED BUILDS

### Step 1: Read Full Error
In Vercel Dashboard:
1. Go to Deployments
2. Click failed deployment
3. Click "View Build Logs"
4. Find first ERROR line
5. Copy full error message

### Step 2: Test Locally
```bash
# Clean build
npm run clean
npm install
npm run build
```

### Step 3: Common Fixes

**If TypeScript errors:**
```bash
# Regenerate types
rm -rf .next
npm run build
```

**If dependency errors:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**If env var errors:**
- Double-check Vercel Dashboard env vars
- Ensure no typos in variable names
- Verify values are correct

---

## 📞 NEED HELP?

If build still fails after following this checklist:

1. Copy the **FULL build log** from Vercel
2. Note the **first error line**
3. Check if error mentions:
   - Missing env var → Add to Vercel Dashboard
   - Type error → Fix TypeScript issue
   - Module not found → Check imports
   - Database error → Run SQL migrations

---

## 🎯 QUICK REFERENCE

### Required Env Vars (6 total)
1. NEXT_PUBLIC_SUPABASE_URL
2. NEXT_PUBLIC_SUPABASE_ANON_KEY
3. SUPABASE_SERVICE_ROLE_KEY
4. NEXT_PUBLIC_APP_URL
5. CEO_ROLE_CODE
6. MANAGER_ROLE_CODE

### Build Command
```bash
npm run build
```

### Node Version
20.x or 18.x

### Framework
Next.js 16.1.4 (App Router)

---

**Last Updated:** 2026-01-31
**Status:** ✅ Ready for Production
