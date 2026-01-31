# ⚡ Quick Start - Deploy to Vercel

## 🎯 3-Step Deployment

### Step 1: Test Build (2 min)
```bash
npm run verify-build
npm run build
```
✅ If successful, continue to Step 2
❌ If fails, see [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)

---

### Step 2: Add Env Vars to Vercel (2 min)

**Go to:** Vercel Dashboard > Settings > Environment Variables

**Add these 6 variables** (select Production, Preview, Development):

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

---

### Step 3: Deploy (1 min)
```bash
git add .
git commit -m "fix: production build ready"
git push origin main
```

Vercel will auto-deploy! 🚀

---

## 📋 If Build Fails

### On Vercel:
1. Check build logs in Vercel Dashboard
2. Find first ERROR line
3. See [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)

### Locally:
```bash
# Run quick fix
quick-fix.bat

# Or manual fix
npm run clean
npm install
npm run build
```

---

## ✅ After Deployment

Test your site:
- Visit: https://msoec.vercel.app
- Test login/signup
- Check dashboard
- Verify no console errors (F12)

---

## 📚 Full Documentation

- **Complete Guide:** [DEPLOY_TO_VERCEL_NOW.md](DEPLOY_TO_VERCEL_NOW.md)
- **Error Fixes:** [BUILD_ERROR_FIXES.md](BUILD_ERROR_FIXES.md)
- **Checklist:** [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)
- **Summary:** [VERCEL_BUILD_FIX_SUMMARY.md](VERCEL_BUILD_FIX_SUMMARY.md)

---

**Ready? Run Step 1 now! ⚡**
