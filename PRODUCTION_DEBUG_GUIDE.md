# Production Debugging Guide - Dashboard 500 Errors

## Problem Summary
- `/dashboard` loads briefly then redirects to `/`
- Console shows: `GET /api/winners 500` and `GET /api/competitions/archived 500`

## Root Cause Analysis

### Why 500 Errors Occur on Vercel

1. **Missing Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` not set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set
   - `SUPABASE_SERVICE_ROLE_KEY` not set (if using service client)

2. **Database Connection Issues**
   - Supabase project paused/deleted
   - Network connectivity issues
   - Serverless function timeout (10s default)

3. **Schema Mismatch**
   - `is_winner` column missing from `submissions` table
   - `end_at` column missing from `competitions` table
   - Tables don't exist
   - RLS policies blocking queries

4. **Auth/Session Failures**
   - `createClient()` throws error
   - Cookie parsing fails
   - Session expired/invalid

### Why Dashboard Redirects to "/"

**NOT from middleware** (we don't have one that redirects to "/")
**NOT from layout** (only redirects to "/login")

**Likely causes:**
1. Client-side error boundary catching 500 errors
2. React error during render causing navigation reset
3. Browser navigation state corruption
4. `useRouter()` or `redirect()` being called somewhere in client components

## Verification Checklist

### 1. Vercel Environment Variables
```bash
# Go to: https://vercel.com/[your-team]/[your-project]/settings/environment-variables
# Verify these exist for Production:
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY (if needed)
```

### 2. Vercel Function Logs
```bash
# Go to: https://vercel.com/[your-team]/[your-project]/deployments/[latest]
# Click on "Functions" tab
# Find: /api/winners and /api/competitions/archived
# Look for:
- "Missing environment variable"
- "Failed to create Supabase client"
- "ECONNREFUSED"
- "Database query error"
- PostgreSQL error codes (42P01, 42703, etc.)
```

### 3. Database Schema Check
```sql
-- Run in Supabase SQL Editor:

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('submissions', 'competitions', 'users');

-- Check if is_winner column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name = 'is_winner';

-- Check if end_at column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'competitions' 
AND column_name = 'end_at';
```

### 4. Test API Endpoints Directly
```bash
# Test in browser or curl:
curl -v https://msoec.vercel.app/api/winners
curl -v https://msoec.vercel.app/api/competitions/archived

# Expected response format:
{
  "ok": true,
  "data": { "winners": [...] },
  "meta": { "timestamp": "...", "duration": 123, "count": 5 }
}

# Or on error:
{
  "ok": false,
  "error": "CONFIGURATION_ERROR",
  "message": "Database configuration missing",
  "hint": "Check NEXT_PUBLIC_SUPABASE_URL",
  "data": { "winners": [] },
  "meta": { "timestamp": "...", "duration": 45 }
}
```

## Code Changes Made

### 1. API Routes - Robust Error Handling

**Files:** `app/api/winners/route.ts`, `app/api/competitions/archived/route.ts`

**Changes:**
- ✅ Validate env vars before creating client
- ✅ Wrap `createClient()` in try/catch
- ✅ Return structured JSON: `{ ok, data?, error?, message?, hint?, meta }`
- ✅ Return 500 with meaningful error codes (not silent 200)
- ✅ Log detailed errors server-side
- ✅ Include timing metadata
- ✅ Handle specific PostgreSQL error codes (42P01, 42703)

**Response Format:**
```typescript
// Success
{
  ok: true,
  data: { winners: [...] },
  meta: { timestamp, duration, count }
}

// Error
{
  ok: false,
  error: "CONFIGURATION_ERROR" | "DATABASE_CONNECTION_ERROR" | "TABLE_NOT_FOUND" | "COLUMN_NOT_FOUND" | "DATABASE_QUERY_ERROR" | "INTERNAL_SERVER_ERROR",
  message: "Human-readable error",
  hint: "How to fix it",
  data: { winners: [] }, // Always include empty data
  meta: { timestamp, duration }
}
```

### 2. Client Component - Resilient Fetching

**File:** `components/ArchivedCompetitions.tsx`

**Changes:**
- ✅ Added 10s timeout with AbortController
- ✅ Parse new API response format (`data.winners` or fallback to `winners`)
- ✅ Handle both old and new response formats
- ✅ Log warnings (not errors) since this is optional content
- ✅ Never crash - always set empty arrays on error
- ✅ Clear timeout in finally block

### 3. Middleware - No Unwanted Redirects

**File:** `middleware.ts` (NEW)

**Changes:**
- ✅ Skip API routes, static files, public routes
- ✅ Let dashboard layout handle auth (don't redirect in middleware)
- ✅ NEVER redirect to "/" - only layout can redirect to "/login"

### 4. Dashboard Layout - Auth Only

**File:** `app/dashboard/layout.tsx` (NO CHANGES NEEDED)

**Current behavior:**
- ✅ Redirects to `/login` if no user
- ✅ Redirects to `/login` if no profile
- ✅ NEVER redirects to "/"

## Expected Behavior After Fix

### Status Code Handling

| Status | Behavior | User Experience |
|--------|----------|-----------------|
| 200 (ok: true) | Display data | Normal operation |
| 200 (ok: false) | Log warning, show empty state | Component hidden (no competitions) |
| 401/403 | Redirect to `/login?next=/dashboard` | Login required |
| 500 | Log error, show empty state | Component hidden (no competitions) |
| Timeout | Log error, show empty state | Component hidden (no competitions) |

### Dashboard Behavior

1. **On successful load:**
   - Dashboard renders
   - ArchivedCompetitions fetches data
   - If data exists, shows competitions
   - If no data, component is hidden (returns null)

2. **On API 500 error:**
   - Dashboard still renders
   - ArchivedCompetitions logs warning
   - Component is hidden (returns null)
   - User sees dashboard without archived section
   - NO redirect to "/"

3. **On auth failure:**
   - Layout detects no user
   - Redirects to `/login`
   - NOT to "/"

## Testing Steps

### Local Development
```bash
# 1. Test with missing env vars
# Remove NEXT_PUBLIC_SUPABASE_URL from .env.local
npm run dev
# Visit http://localhost:3000/dashboard
# Expected: Dashboard loads, ArchivedCompetitions hidden, console shows warning

# 2. Test with valid env vars
# Restore .env.local
npm run dev
# Visit http://localhost:3000/dashboard
# Expected: Dashboard loads, ArchivedCompetitions shows data (if exists)

# 3. Test API directly
curl http://localhost:3000/api/winners
curl http://localhost:3000/api/competitions/archived
# Expected: JSON with { ok, data, meta } or { ok: false, error, message, hint }
```

### Vercel Production
```bash
# 1. Deploy changes
git push origin main

# 2. Wait for deployment
# Go to: https://vercel.com/[your-team]/[your-project]/deployments

# 3. Check Function Logs
# Click latest deployment → Functions tab
# Look for /api/winners and /api/competitions/archived logs
# Should see: "[/api/winners] ..." logs with detailed error info

# 4. Test in browser
# Open: https://msoec.vercel.app/dashboard
# Expected: Dashboard loads and stays on /dashboard
# Check console: Should see warnings (not errors) if APIs fail

# 5. Test API directly
curl https://msoec.vercel.app/api/winners
curl https://msoec.vercel.app/api/competitions/archived
# Expected: JSON response with proper structure
```

## Debugging Commands

### Check Vercel Logs (CLI)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://msoec.vercel.app --follow

# Filter for specific function
vercel logs https://msoec.vercel.app --follow | grep "/api/winners"
```

### Check Database Connection
```bash
# In Supabase Dashboard → SQL Editor:
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public';

# Test query that API uses:
SELECT 
  id, 
  participant_name,
  is_winner,
  created_at
FROM submissions
WHERE is_winner = true
ORDER BY created_at DESC
LIMIT 10;
```

### Check RLS Policies
```sql
-- In Supabase Dashboard → SQL Editor:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('submissions', 'competitions');
```

## Common Issues & Solutions

### Issue 1: "Missing environment variable"
**Solution:** Add env vars in Vercel dashboard, redeploy

### Issue 2: "Failed to create Supabase client"
**Solution:** Check Supabase project status, verify URL/key are correct

### Issue 3: "Table not found" (42P01)
**Solution:** Run database migrations in Supabase SQL Editor

### Issue 4: "Column not found" (42703)
**Solution:** Run `ALTER TABLE` to add missing columns

### Issue 5: "Permission denied" (RLS)
**Solution:** Update RLS policies or use service role key

### Issue 6: Dashboard still redirects to "/"
**Solution:** 
1. Check browser console for React errors
2. Check if any client component has `router.push('/')`
3. Clear browser cache and cookies
4. Check if error boundary is redirecting

## Success Criteria

✅ `/api/winners` returns 200 with structured JSON (even on error)
✅ `/api/competitions/archived` returns 200 with structured JSON (even on error)
✅ Dashboard loads and stays on `/dashboard` (no redirect to "/")
✅ If APIs fail, ArchivedCompetitions component is hidden (not crashed)
✅ Vercel Function Logs show detailed error messages
✅ No 500 errors in browser console
✅ Auth failures redirect to `/login` (not "/")

## Next Steps

1. Deploy changes to Vercel
2. Check Function Logs for detailed error messages
3. Verify environment variables are set
4. Test database schema matches expected structure
5. If still failing, share Function Logs for further debugging
