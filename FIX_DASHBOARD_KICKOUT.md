# Fix: Dashboard Kicks Users Out

## Problem
When accessing `/dashboard`, users are immediately redirected to `/login` even though they're logged in.

## Root Cause
The RLS (Row Level Security) policy on the `users` table is preventing users from reading their own profile. The dashboard layout tries to fetch the user profile and fails, causing a redirect to login.

## Solution

### Quick Fix
Run this in Supabase SQL Editor:

```sql
-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        auth.uid() = auth_id
    );

-- Allow admins to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users;

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );
```

### Complete Fix
Run the entire `FIX_DASHBOARD_ACCESS.sql` file in Supabase SQL Editor. This will:
1. Check current policies
2. Drop old restrictive policies
3. Create correct policies for users and submissions tables
4. Verify the policies were created

## How to Apply

1. **Open Supabase Dashboard**
   - Go to your project
   - Click "SQL Editor" in the left sidebar

2. **Run the Fix**
   - Copy the contents of `FIX_DASHBOARD_ACCESS.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Test**
   - Go to your app
   - Navigate to `/dashboard`
   - You should now be able to access it

## What This Does

The fix creates proper RLS policies that:
- ✅ Allow users to read their own profile (critical for dashboard)
- ✅ Allow users to update their own profile
- ✅ Allow CEO and LRC_MANAGER to view all users
- ✅ Allow CEO and LRC_MANAGER to view/update/delete submissions
- ✅ Allow CEO to manage all users

## Verification

After running the fix, verify it worked:

```sql
-- Check policies on users table
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
```

You should see:
- `Users can view their own profile` (SELECT)
- `Users can update their own profile` (UPDATE)
- `Admins can view all users` (SELECT)
- `CEO can manage users` (ALL)

## Common Issues

### Still Getting Kicked Out?
1. **Check your user role**: Make sure your user has role `CEO` or `LRC_MANAGER`
   ```sql
   SELECT id, username, email, role, auth_id
   FROM users
   WHERE email = 'your-email@example.com';
   ```

2. **Check auth_id matches**: Verify your `auth_id` in users table matches your Supabase auth user
   ```sql
   -- Get your auth user ID from Supabase Auth dashboard
   -- Then check if it exists in users table
   SELECT * FROM users WHERE auth_id = 'your-auth-id-here';
   ```

3. **Clear cookies**: Sometimes old session cookies cause issues
   - Clear browser cookies for your site
   - Log out and log back in

### Profile Not Found Error?
If you see "Profile not found" in console:
1. Your user exists in Supabase Auth but not in the `users` table
2. Create a user record:
   ```sql
   INSERT INTO users (auth_id, username, email, role)
   VALUES (
       'your-auth-id-from-supabase-auth',
       'your-username',
       'your-email@example.com',
       'CEO'  -- or 'LRC_MANAGER'
   );
   ```

## Related Files
- `FIX_DASHBOARD_ACCESS.sql` - Complete fix script
- `app/dashboard/layout.tsx` - Dashboard auth check
- `lib/supabase/server.ts` - Supabase server client
- `FIX_SUBMISSIONS_RLS_POLICY.sql` - Submissions policies fix

## Prevention
To prevent this in the future:
1. Always test RLS policies after changes
2. Ensure users can read their own profile
3. Don't make RLS policies too restrictive
4. Test with different user roles
