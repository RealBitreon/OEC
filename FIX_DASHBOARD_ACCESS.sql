-- ============================================================================
-- FIX DASHBOARD ACCESS - Users Getting Kicked Out
-- ============================================================================

-- The issue: Users can't access dashboard because they can't read their own profile
-- Root cause: RLS policy is too restrictive

-- Step 1: Check current policies on users table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 2: Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Step 3: Create correct policies for users table

-- Allow users to view their own profile (CRITICAL for dashboard access)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        auth.uid() = auth_id
    );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        auth.uid() = auth_id
    );

-- Allow CEO and LRC_MANAGER to view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Allow CEO to manage all users
CREATE POLICY "CEO can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'CEO'
        )
    );

-- Step 4: Verify policies were created
SELECT 
    policyname, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 5: Test query (should return your profile)
-- Replace 'your-auth-id' with your actual auth.uid()
-- SELECT id, username, email, role, created_at
-- FROM users
-- WHERE auth_id = 'your-auth-id';

-- ============================================================================
-- ADDITIONAL FIX: Ensure submissions policies are correct
-- ============================================================================

-- Fix submissions policies for CEO and LRC_MANAGER
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies
SELECT 
    tablename,
    policyname, 
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename IN ('users', 'submissions')
ORDER BY tablename, policyname;

-- Done! Try accessing /dashboard again
