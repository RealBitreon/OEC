# Dashboard Access Fix - Step by Step

## Problem
When you go to `/dashboard`, you get kicked out to `/login` immediately.

## Solution Steps

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Diagnosis (Optional)
Copy and paste `DIAGNOSE_DASHBOARD_ISSUE.sql` to see what's wrong.

### Step 3: Apply the Fix
Copy and paste this into SQL Editor and click **Run**:

```sql
-- Fix users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Fix submissions table policies
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

DROP POLICY IF EXISTS "Admins can delete submissions" ON submissions;
CREATE POLICY "Admins can delete submissions" ON submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );
```

### Step 4: Verify Your User
Run this query (replace with your email):

```sql
SELECT id, username, email, role, auth_id
FROM users
WHERE email = 'your-email@example.com';
```

**Check:**
- ✅ Does the user exist?
- ✅ Is `auth_id` filled in?
- ✅ Is `role` set to `CEO` or `LRC_MANAGER`?

### Step 5: Fix User if Needed

**If user doesn't exist:**
```sql
-- Get your auth_id from Supabase Auth > Users page
INSERT INTO users (auth_id, username, email, role)
VALUES (
    'your-auth-id-from-supabase-auth',
    'your-username',
    'your-email@example.com',
    'CEO'
);
```

**If auth_id is missing:**
```sql
-- Get your auth_id from Supabase Auth > Users page
UPDATE users 
SET auth_id = 'your-auth-id-from-supabase-auth'
WHERE email = 'your-email@example.com';
```

**If role is wrong:**
```sql
UPDATE users 
SET role = 'CEO'
WHERE email = 'your-email@example.com';
```

### Step 6: Test
1. Clear your browser cookies (or use incognito)
2. Go to your app
3. Log in
4. Navigate to `/dashboard`
5. ✅ You should now have access!

## Still Not Working?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - "Profile not found for user"
   - "Authentication error"
   - "Failed to fetch user profile"

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** > **Postgres Logs**
3. Look for RLS policy errors

### Get Your Auth ID
1. Go to Supabase Dashboard
2. Click **Authentication** > **Users**
3. Find your user
4. Copy the **ID** (this is your auth_id)
5. Use it in the queries above

## What Each Fix Does

1. **Users can view their own profile** - Allows you to read your own user record (critical!)
2. **Users can update their own profile** - Allows you to update your settings
3. **Admins can view all users** - Allows CEO/LRC_MANAGER to see all users
4. **Admins can view/update/delete submissions** - Allows marking winners/losers

## Files to Use
- `FIX_DASHBOARD_ACCESS.sql` - Complete fix with all policies
- `DIAGNOSE_DASHBOARD_ISSUE.sql` - Diagnostic queries
- `QUICK_FIX_TRIGGER_ERROR.sql` - Fix for trigger errors

## Need More Help?
Check the browser console and Supabase logs for specific error messages.
