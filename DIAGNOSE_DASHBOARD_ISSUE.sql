-- ============================================================================
-- DIAGNOSE DASHBOARD ACCESS ISSUE
-- Run this to understand why users are getting kicked out of dashboard
-- ============================================================================

-- Step 1: Check if RLS is enabled on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- Step 2: Check all policies on users table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd,
    qual as using_clause,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 3: Check if you have a user record
-- Replace 'your-email@example.com' with your actual email
SELECT 
    id,
    username,
    email,
    role,
    auth_id,
    created_at
FROM users
WHERE email = 'your-email@example.com';

-- Step 4: Check if auth_id is set correctly
-- This should return your user if auth_id matches
-- Get your auth.uid() from Supabase Auth dashboard first
-- SELECT * FROM users WHERE auth_id = 'your-auth-uid-here';

-- Step 5: Test the exact query that dashboard uses
-- Replace 'your-auth-uid' with your actual auth.uid()
-- SELECT id, username, email, role, created_at
-- FROM users
-- WHERE auth_id = 'your-auth-uid'
-- LIMIT 1;

-- Step 6: Check submissions policies (for mark winner/loser feature)
SELECT 
    policyname, 
    cmd,
    qual as using_clause
FROM pg_policies 
WHERE tablename = 'submissions'
AND policyname LIKE '%Admin%'
ORDER BY policyname;

-- Step 7: Check for any triggers that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'submissions')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- COMMON ISSUES AND SOLUTIONS
-- ============================================================================

-- ISSUE 1: No user record found
-- SOLUTION: Create user record
-- INSERT INTO users (auth_id, username, email, role)
-- VALUES ('your-auth-uid', 'your-username', 'your-email@example.com', 'CEO');

-- ISSUE 2: RLS policy too restrictive
-- SOLUTION: Run FIX_DASHBOARD_ACCESS.sql

-- ISSUE 3: auth_id doesn't match
-- SOLUTION: Update auth_id
-- UPDATE users 
-- SET auth_id = 'correct-auth-uid'
-- WHERE email = 'your-email@example.com';

-- ISSUE 4: Wrong role
-- SOLUTION: Update role to CEO or LRC_MANAGER
-- UPDATE users 
-- SET role = 'CEO'
-- WHERE email = 'your-email@example.com';

-- ============================================================================
-- QUICK FIX: Apply all necessary policies
-- ============================================================================

-- Uncomment and run this section if diagnosis shows policy issues:

/*
-- Fix users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

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
*/

-- Done! Review the output above to identify the issue.
