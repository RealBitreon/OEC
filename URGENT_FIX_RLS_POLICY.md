# 🚨 URGENT: Fix RLS Policy Error

## Error Message
```
Failed to update submission: record "new" has no field "user_id"
```

## Root Cause
The RLS (Row Level Security) policy on the `submissions` table is using the wrong role name. It's checking for `role = 'admin'` but your system uses `'CEO'` and `'LRC_MANAGER'`.

## ✅ SOLUTION - Run This SQL in Supabase NOW

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Paste This SQL

```sql
-- Fix RLS policy for submissions to allow CEO and LRC_MANAGER to update
-- This fixes the "Admins can update submissions" policy to use the correct roles

-- First, drop the old policy
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;

-- Create new policy with correct roles
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Also fix the view policy
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Verify the policies were created correctly
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'submissions' 
AND policyname LIKE '%Admin%'
ORDER BY policyname;
```

### Step 3: Run the Query
- Click **Run** button (or press Ctrl+Enter / Cmd+Enter)
- You should see "Success. No rows returned" or a table showing the policies

### Step 4: Verify
You should see output like:
```
policyname: "Admins can update submissions"
cmd: UPDATE
qual: (EXISTS ( SELECT 1 FROM users WHERE ((users.auth_id = auth.uid()) AND (users.role = ANY (ARRAY['CEO'::text, 'LRC_MANAGER'::text])))))
```

## 🧪 Test After Running SQL

1. Go to https://msoec.vercel.app/dashboard
2. Navigate to "مراجعة الإجابات" (Submissions Review)
3. Click on a submission
4. Try marking as winner (🏆) or loser (❌)
5. You should see success message!

## Why This Happened

The database schema file had:
```sql
WHERE users.role = 'admin'  ❌ WRONG
```

But your system uses:
```sql
WHERE users.role IN ('CEO', 'LRC_MANAGER')  ✅ CORRECT
```

## What This Fixes

- ✅ Allows CEO to mark winners/losers
- ✅ Allows LRC_MANAGER to mark winners/losers
- ✅ Prevents "record 'new' has no field 'user_id'" error
- ✅ Enables proper RLS policy checks

## If Still Not Working

### Check Your User Role
Run this in Supabase SQL Editor:
```sql
SELECT id, username, email, role, auth_id 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE';
```

Make sure your role is either `'CEO'` or `'LRC_MANAGER'`.

### Check All Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'submissions';
```

You should see policies for:
- Anyone can create submissions
- Users can view their own submissions
- Admins can view all submissions (with CEO/LRC_MANAGER check)
- Admins can update submissions (with CEO/LRC_MANAGER check)

---

## ⚠️ IMPORTANT
You MUST run the SQL script above in Supabase before the mark-winner feature will work!

The code changes have already been deployed to Vercel, but the database policies need to be updated manually.
