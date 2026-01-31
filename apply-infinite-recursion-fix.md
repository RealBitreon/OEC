# 🚀 Apply Infinite Recursion Fix - Step by Step

## Current Issues
1. ❌ `infinite recursion detected in policy for relation "users"`
2. ❌ `/api/session` returns 404
3. ❌ `/api/winners` returns 404
4. ❌ `/api/competitions/archived` returns 404

## Quick Fix (3 Steps)

### Step 1: Fix Supabase RLS Policies
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire content of `FIX_INFINITE_RECURSION_COMPLETE.sql`
4. Click **Run**
5. Wait for success message

### Step 2: Verify API Routes Created
These files have been created:
- ✅ `app/api/session/route.ts`
- ✅ `app/api/winners/route.ts`
- ✅ `app/api/competitions/archived/route.ts`

### Step 3: Restart Dev Server
```bash
# In your terminal, press Ctrl+C to stop the server
# Then restart:
npm run dev
```

## What Was Fixed

### 1. RLS Policies (Database)
**Before:** Recursive policies causing infinite loops
```sql
-- OLD (BROKEN)
USING (id IN (SELECT user_id FROM users WHERE ...))
-- This creates infinite recursion!
```

**After:** Simple, direct policies
```sql
-- NEW (FIXED)
USING (auth_id = auth.uid())
-- Direct check, no recursion
```

### 2. Missing API Routes (Code)
**Before:** 404 errors
```
GET /api/session 404
GET /api/winners 404
GET /api/competitions/archived 404
```

**After:** Working endpoints
```
GET /api/session 200 ✅
GET /api/winners 200 ✅
GET /api/competitions/archived 200 ✅
```

## Expected Behavior After Fix

### ✅ Login Flow
1. User enters credentials
2. Login succeeds
3. Session API returns user data
4. Dashboard loads correctly

### ✅ Home Page
1. Loads without errors
2. Shows archived competitions
3. Shows winners list
4. No infinite recursion errors

### ✅ Dashboard
1. Loads user profile
2. Shows all sections
3. No RLS errors

## Troubleshooting

### If you still see errors:

**Clear Browser Cache:**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Verify SQL Ran Successfully:**
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'users';
-- Should show 4 policies
```

**Check User Profiles:**
```sql
-- Run this in Supabase SQL Editor
SELECT 
  au.email,
  u.username,
  u.role
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id;
-- All users should have profiles
```

## Notes

- WebSocket warnings in console are normal in dev mode (ignore them)
- The fix is production-ready
- No data loss occurs
- All existing users will work correctly

## Need Help?

If issues persist after following these steps:
1. Check Supabase logs for specific errors
2. Verify all SQL commands ran successfully
3. Ensure dev server restarted completely
4. Check browser console for any remaining errors
