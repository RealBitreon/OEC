# 🚀 Windows Deployment Commands

## ✅ ALL ISSUES RESOLVED - READY TO DEPLOY

---

## 🪟 Windows PowerShell Commands

### Option 1: Step by Step (Recommended)
```powershell
# Step 1: Verify
npm run verify

# Step 2: Build
npm run build

# Step 3: Deploy
vercel --prod
```

### Option 2: One Command (PowerShell)
```powershell
npm run verify; if ($?) { npm run build; if ($?) { vercel --prod } }
```

### Option 3: One Command (CMD)
```cmd
npm run verify && npm run build && vercel --prod
```

---

## 🚀 Quick Deploy (Copy & Paste)

### For PowerShell (Your Current Shell)
```powershell
npm run verify
npm run build
vercel --prod
```

### Alternative: Use CMD Instead
```cmd
cmd /c "npm run verify && npm run build && vercel --prod"
```

---

## 📋 Pre-Deployment Checklist

Before running the commands above:

1. **Install Vercel CLI** (if not installed)
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel** (if not logged in)
   ```powershell
   vercel login
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project → Settings → Environment Variables
   - Add all variables from `.env.example`

---

## 🌐 Environment Variables to Add in Vercel

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
CEO_ROLE_CODE=your_ceo_code
MANAGER_ROLE_CODE=your_manager_code
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

---

## ✅ Expected Output

### Step 1: Verify
```
🔍 Running Pre-Deployment Verification...
✅ All checks passed
⚠️  VERIFICATION PASSED WITH WARNINGS
   Review warnings but safe to deploy
```

### Step 2: Build
```
▲ Next.js 16.1.4 (Turbopack)
✓ Compiled successfully in 7.5s
✓ Finished TypeScript in 10.2s
Exit Code: 0
```

### Step 3: Deploy
```
🔍 Inspect: https://vercel.com/...
✅ Production: https://your-app.vercel.app
```

---

## 🆘 Troubleshooting

### PowerShell Command Issues
**Problem:** `&&` not recognized  
**Solution:** Use `;` instead or run commands separately

**Problem:** Execution policy error  
**Solution:** 
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Vercel CLI Issues
**Problem:** `vercel` command not found  
**Solution:**
```powershell
npm install -g vercel
```

**Problem:** Not logged in  
**Solution:**
```powershell
vercel login
```

---

## 🎯 Recommended: Step-by-Step Deployment

Just run these three commands one at a time:

```powershell
# 1. Verify everything is ready
npm run verify

# 2. Build the application
npm run build

# 3. Deploy to production
vercel --prod
```

That's it! 🎉

---

## 📚 Additional Resources

- `DEPLOYMENT_STATUS_FINAL.md` - Complete status report
- `DEPLOYMENT_READY.md` - Full deployment guide
- `README_DEPLOYMENT.md` - Quick start guide

---

**Ready to deploy? Start with:** `npm run verify`
