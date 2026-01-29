# 🚨 QUICK FIX: Profile Not Found Error

## The Problem
You're seeing "No user in session data" because the profile wasn't created in the `users` table when you signed up.

## The Solution (2 minutes)

### Step 1: Run This SQL
1. Go to: https://supabase.com/dashboard/project/wpkyzdpnhiucctdangwf/sql
2. Copy and paste this:

```sql
-- Create missing profiles
INSERT INTO users (id, auth_id, username, email, role, created_at, updated_at)
SELECT 
  au.id,
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'LRC_MANAGER'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL
ON CONFLICT (auth_id) DO NOTHING;

-- Verify
SELECT 
  au.email,
  u.username,
  u.role,
  CASE WHEN u.id IS NOT NULL THEN '✅ OK' ELSE '❌ MISSING' END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id;
```

3. Click "Run"
4. You should see "✅ OK" for all users

### Step 2: Refresh Your Browser
- Go back to your app
- Refresh the page
- Login again
- Dashboard should now work!

## If You Want the Complete Fix
Run `fix_auth_complete.sql` instead - it does everything including fixing the trigger.

## Still Not Working?
Check the browser console and server logs for the debug info now being logged.
