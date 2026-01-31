# 🔧 Infinite Recursion Fix - Quick Guide

## Problem
```
Profile error: {
  code: '42P17',
  message: 'infinite recursion detected in policy for relation "users"'
}
```

## Root Cause
RLS policies on the `users` table were referencing themselves, causing infinite recursion when trying to check permissions.

## Solution

### 1️⃣ Run the SQL Fix
Open Supabase SQL Editor and run:
```bash
FIX_INFINITE_RECURSION_COMPLETE.sql
```

This will:
- ✅ Drop all existing conflicting policies
- ✅ Create simple, non-recursive policies
- ✅ Create missing user profiles
- ✅ Verify the fix

### 2️⃣ Missing API Routes Fixed
Created these missing routes:
- ✅ `/api/session` - User session endpoint
- ✅ `/api/winners` - Winners list
- ✅ `/api/competitions/archived` - Archived competitions

### 3️⃣ Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## New RLS Policies (Non-Recursive)

### Policy 1: Read Own Profile
```sql
users_select_own: auth_id = auth.uid()
```

### Policy 2: Update Own Profile
```sql
users_update_own: auth_id = auth.uid()
```

### Policy 3: Service Role Access
```sql
users_service_role_all: true (for service_role only)
```

### Policy 4: Read All Users
```sql
users_select_all_authenticated: true (for authenticated users)
```

## Verification

After running the SQL:

1. **Check Policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. **Check Profiles:**
```sql
SELECT au.email, u.username, u.role
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id;
```

3. **Test Query:**
```sql
SELECT id, username, email, role FROM users LIMIT 5;
```

## Expected Results

✅ No more "infinite recursion" errors
✅ Login works correctly
✅ Dashboard loads without errors
✅ Session API returns user data
✅ Home page loads archived competitions and winners

## If Issues Persist

1. Clear browser cache and cookies
2. Restart Next.js dev server
3. Check Supabase logs for any remaining errors
4. Verify all policies are created correctly

## Testing Checklist

- [ ] Login works
- [ ] Dashboard loads
- [ ] Session API returns user data
- [ ] Home page shows archived competitions
- [ ] No console errors about infinite recursion
- [ ] WebSocket warnings are normal in dev mode (ignore them)
