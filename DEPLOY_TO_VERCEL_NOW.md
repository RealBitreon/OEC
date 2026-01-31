# 🚀 Deploy to Vercel - Complete Guide

## ⚡ QUICK START (5 Minutes)

### Step 1: Test Build Locally (2 min)
```bash
npm run verify-build
npm run build
```

**Expected:** Build completes successfully
**If fails:** See [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)

### Step 2: Add Environment Variables to Vercel (2 min)

Go to: **Vercel Dashboard > Your Project > Settings > Environment Variables**

Copy-paste these **6 variables** (select Production, Preview, Development for each):

```
NEXT_PUBLIC_SUPABASE_URL
https://wpkyzdpnhiucctdangwf.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwa3l6ZHBuaGl1Y2N0ZGFuZ3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTc4MjEsImV4cCI6MjA4NTE5MzgyMX0.eHVO2KzXswtLJuXBGQ4dLghjHvLR-AX_5pjxEIxdQsI

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwa3l6ZHBuaGl1Y2N0ZGFuZ3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxNzgyMSwiZXhwIjoyMDg1MTkzODIxfQ.0Enuavmzw9TRWkTBIUW8Rj9BYd3_GOpQB3qxgtpwb84

NEXT_PUBLIC_APP_URL
https://msoec.vercel.app

CEO_ROLE_CODE
CE@

MANAGER_ROLE_CODE
MG$
```

### Step 3: Deploy (1 min)

**Option A: Git Push (Recommended)**
```bash
git add .
git commit -m "fix: production build ready"
git push origin main
```

**Option B: Vercel CLI**
```bash
vercel --prod
```

---

## 📋 DETAILED STEPS

### Before You Start

✅ You have a Vercel account
✅ Your project is connected to Vercel
✅ You have Supabase credentials
✅ Local build works (`npm run build`)

---

### 1. Verify Local Build

Run the verification script:
```bash
node verify-build.js
```

This checks:
- ✅ Environment variables exist
- ✅ Configuration files are correct
- ✅ Dependencies are installed
- ✅ Critical files are present

If verification passes, run the build:
```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB           XX kB
└ ○ /dashboard                           X kB           XX kB
...

○  (Static)  prerendered as static content
```

**If build fails:**
1. Read the error message carefully
2. Check [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)
3. Fix the issue
4. Run `npm run build` again

---

### 2. Configure Vercel Dashboard

#### A. Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add each variable:

**For each variable:**
- Click "Add New"
- Enter **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
- Enter **Value** (copy from `.env.production`)
- Select: ✅ Production ✅ Preview ✅ Development
- Click "Save"

**Required Variables (6 total):**

| Name | Value | Description |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wpkyzdpnhiucctdangwf.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | `https://msoec.vercel.app` | Your app URL |
| `CEO_ROLE_CODE` | `CE@` | CEO signup code |
| `MANAGER_ROLE_CODE` | `MG$` | Manager signup code |

#### B. Build Settings

1. Go to **Settings > General**
2. Verify these settings:

**Framework Preset:** Next.js
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`
**Node.js Version:** 20.x

#### C. Root Directory

If your Next.js app is in a subdirectory:
1. Go to **Settings > General**
2. Set **Root Directory** to your app folder
3. Click "Save"

---

### 3. Deploy

#### Option A: Git Push (Recommended)

Vercel automatically deploys when you push to your main branch:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "fix: production build configuration for Vercel"

# Push to GitHub/GitLab/Bitbucket
git push origin main
```

Vercel will:
1. Detect the push
2. Start building automatically
3. Deploy if build succeeds
4. Send you a notification

#### Option B: Vercel CLI

Install Vercel CLI (first time only):
```bash
npm install -g vercel
```

Deploy:
```bash
# Login (first time only)
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **Y**
- What's your project name? Select your project

---

### 4. Monitor Deployment

#### Watch Build Progress

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click **Deployments** tab
4. Click the latest deployment (top of list)
5. Click **View Build Logs**

**What to look for:**

✅ **Success:**
```
Running build in Washington, D.C., USA (East) – iad1
Cloning repository...
Installing dependencies...
Running "npm run build"
Build Completed in Xm Ys
Deploying...
Deployment Complete
```

❌ **Failure:**
```
Error: Command "npm run build" exited with 1
```

If build fails:
1. Click "View Build Logs"
2. Find the first ERROR line
3. Copy the full error message
4. Check [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)
5. Fix the issue
6. Push again or click "Redeploy"

---

### 5. Verify Deployment

Once deployment succeeds, test your live site:

#### A. Basic Checks

Visit: `https://msoec.vercel.app`

✅ Homepage loads
✅ No console errors (press F12)
✅ Images load correctly
✅ Navigation works

#### B. Authentication

1. Go to `/login`
2. Try logging in with test account
3. Verify redirect to dashboard works

#### C. Database Connection

1. Login to dashboard
2. Check if data loads
3. Try creating/editing something
4. Verify changes save to Supabase

#### D. API Routes

Test these endpoints:
- `/api/session` - Should return user session
- `/api/competitions/active` - Should return competitions
- `/api/winners` - Should return winners

---

## 🚨 TROUBLESHOOTING

### Build Fails on Vercel but Works Locally

**Cause:** Environment variables missing or incorrect

**Fix:**
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Verify all 6 variables are present
3. Check for typos in variable names
4. Ensure values are correct (no extra spaces)
5. Click "Redeploy" after fixing

---

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Fix:**
1. Add the variable in Vercel Dashboard
2. Make sure you selected "Production" environment
3. Redeploy

---

### Error: "cookies() expects to be called within a request scope"

**Cause:** Using `cookies()` at build time

**Fix:**
Check these files don't call `createClient()` at top level:
- `app/layout.tsx`
- `app/page.tsx`
- Any file without `async function`

See [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md) for detailed fix.

---

### Error: "Type error: ..."

**Cause:** TypeScript errors

**Fix:**
1. Run `npm run build` locally to see the error
2. Fix the TypeScript issue
3. Push again

---

### Site Loads but Shows Errors

**Cause:** Database schema mismatch

**Fix:**
Run missing SQL migrations in Supabase:

```sql
-- Add is_winner column
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;

-- Verify end_at column exists
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
```

---

### 500 Internal Server Error

**Cause:** Runtime error in server code

**Fix:**
1. Check Vercel logs: Dashboard > Deployments > Latest > Runtime Logs
2. Find the error message
3. Fix the issue in code
4. Push again

---

## 📊 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Homepage loads correctly
- [ ] Login/Signup works
- [ ] Dashboard loads after login
- [ ] Database queries work
- [ ] Images load
- [ ] No console errors
- [ ] Mobile view works
- [ ] All pages accessible
- [ ] API routes respond
- [ ] Forms submit correctly

---

## 🔄 REDEPLOYING

To redeploy after making changes:

### Method 1: Git Push
```bash
git add .
git commit -m "your changes"
git push origin main
```

### Method 2: Vercel Dashboard
1. Go to Deployments
2. Click "..." on any deployment
3. Click "Redeploy"

### Method 3: Vercel CLI
```bash
vercel --prod
```

---

## 🎯 QUICK REFERENCE

### Required Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
CEO_ROLE_CODE
MANAGER_ROLE_CODE
```

### Build Commands
```bash
# Verify before deploy
npm run verify-build

# Test build locally
npm run build

# Clean build
npm run clean
npm install
npm run build

# Deploy
git push origin main
# or
vercel --prod
```

### Important Links
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Your Site: https://msoec.vercel.app

---

## 📞 NEED HELP?

If you're still stuck:

1. **Check build logs** in Vercel Dashboard
2. **Copy the full error message**
3. **Search in [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)**
4. **Test locally** with `npm run build`
5. **Verify env vars** are set correctly

---

## ✅ SUCCESS!

Once deployed successfully:

🎉 Your site is live at: https://msoec.vercel.app
📊 Monitor at: Vercel Dashboard
🔄 Auto-deploys on every push to main branch
⚡ Vercel handles scaling automatically

---

**Last Updated:** 2026-01-31
**Status:** ✅ Production Ready
