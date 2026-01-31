# Vercel Environment Variables - Quick Setup

## 🚨 CRITICAL: You MUST add these to Vercel Dashboard

### Step 1: Get Your Supabase Credentials

1. Go to: https://app.supabase.com/project/_/settings/api
2. Copy these values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Add to Vercel

1. Go to: https://vercel.com/your-username/msoec/settings/environment-variables
2. Add each variable below:

#### Required Variables (Copy-Paste Ready)

```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Paste your Supabase Project URL]
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Paste your Supabase anon key]
Environment: Production, Preview, Development
```

```
Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste your Supabase service_role key]
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://msoec.vercel.app
Environment: Production, Preview, Development
```

```
Variable Name: CEO_ROLE_CODE
Value: CEO2024
Environment: Production, Preview, Development
```

```
Variable Name: MANAGER_ROLE_CODE
Value: MANAGER2024
Environment: Production, Preview, Development
```

### Step 3: Redeploy

After adding ALL variables:

1. Go to: https://vercel.com/your-username/msoec
2. Click **Deployments** tab
3. Click **"..."** menu on latest deployment
4. Click **Redeploy**
5. Wait for deployment to complete

### Step 4: Verify

1. Open: https://msoec.vercel.app
2. Check:
   - ✅ Favicon appears in browser tab
   - ✅ Homepage loads without errors
   - ✅ No 500 Internal Server Error
   - ✅ Console has no errors (F12 → Console)

## Troubleshooting

### Still getting 500 error?

1. Check Vercel Function Logs:
   - Go to Deployments → Click latest → Functions tab
   - Look for error messages

2. Verify environment variables:
   - Settings → Environment Variables
   - Make sure ALL 6 variables are set
   - Make sure they're set for "Production"

3. Check Supabase:
   - Make sure project is not paused
   - Verify keys are correct
   - Check database tables exist

### Favicon still 404?

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check `app/icon.svg` exists in repository

## Quick Checklist

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `NEXT_PUBLIC_APP_URL`
- [ ] Added `CEO_ROLE_CODE`
- [ ] Added `MANAGER_ROLE_CODE`
- [ ] Redeployed application
- [ ] Tested homepage loads
- [ ] Verified favicon appears
- [ ] Checked console for errors

## Need Help?

Check the full guide: `VERCEL_DEPLOYMENT_FIX.md`
