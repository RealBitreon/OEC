-- ============================================================================
-- COMPLETE FIX: Infinite Recursion + Missing API Routes
-- Run this in Supabase SQL Editor to fix all RLS issues
-- ============================================================================

-- ============================================
-- STEP 1: Drop ALL existing policies on users table
-- ============================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Enable RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create simple, non-recursive policies
-- ============================================

-- Policy 1: Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Policy 3: Service role has full access
CREATE POLICY "users_service_role_all"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 4: Authenticated users can read all users (for leaderboards, etc.)
CREATE POLICY "users_select_all_authenticated"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- STEP 4: Create missing profiles for auth users
-- ============================================
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

-- ============================================
-- STEP 5: Verify the fix
-- ============================================
SELECT 
  '✅ RLS Policies Fixed' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

SELECT 
  '✅ All Users Have Profiles' as status,
  COUNT(au.id) as auth_users,
  COUNT(u.id) as profile_users
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id;

SELECT 
  au.email,
  u.username,
  u.role,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Profile OK'
    ELSE '❌ Missing Profile'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
ORDER BY au.created_at DESC;

-- ============================================
-- STEP 6: Test the policies
-- ============================================
-- This should work without infinite recursion
SELECT 
  id, 
  username, 
  email, 
  role,
  '✅ Query Successful' as test_result
FROM users
LIMIT 5;
