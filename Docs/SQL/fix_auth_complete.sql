-- ============================================================================
-- COMPLETE AUTH FIX
-- Run this to fix all auth issues in one go
-- ============================================================================

-- ============================================================================
-- STEP 1: Create missing profiles for existing auth users
-- ============================================================================

DO $$
BEGIN
  -- Create profiles for all auth users that don't have them
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

  RAISE NOTICE 'Created missing profiles';
END $$;

-- ============================================================================
-- STEP 2: Fix any VIEWER roles
-- ============================================================================

UPDATE users 
SET role = 'LRC_MANAGER' 
WHERE role NOT IN ('CEO', 'LRC_MANAGER');

-- ============================================================================
-- STEP 3: Update RLS policies to avoid infinite recursion
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "CEO can manage users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can read all users" ON users;
DROP POLICY IF EXISTS "CEO can update users" ON users;
DROP POLICY IF EXISTS "CEO can delete users" ON users;
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Authenticated can read all users" ON users;
DROP POLICY IF EXISTS "Service role can insert" ON users;
DROP POLICY IF EXISTS "Service role can delete" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policies that don't cause recursion
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Service role full access"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can delete"
  ON users FOR DELETE
  TO service_role
  USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to LRC_MANAGER
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'LRC_MANAGER');
  
  -- Ensure role is valid
  IF user_role NOT IN ('CEO', 'LRC_MANAGER') THEN
    user_role := 'LRC_MANAGER';
  END IF;

  -- Insert profile
  INSERT INTO public.users (id, auth_id, username, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO UPDATE
  SET
    username = COALESCE(EXCLUDED.username, users.username),
    email = COALESCE(EXCLUDED.email, users.email),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Update trigger to be more robust
-- ============================================================================

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{username}',
    to_jsonb((SELECT username FROM users WHERE users.auth_id = auth.users.id))
  ),
  '{role}',
  to_jsonb((SELECT role FROM users WHERE users.auth_id = auth.users.id))
)
WHERE id IN (SELECT auth_id FROM users);

-- ============================================================================
-- STEP 5: Sync auth metadata with users table
-- ============================================================================

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{username}',
    to_jsonb((SELECT username FROM users WHERE users.auth_id = auth.users.id))
  ),
  '{role}',
  to_jsonb((SELECT role FROM users WHERE users.auth_id = auth.users.id))
)
WHERE id IN (SELECT auth_id FROM users);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all users have profiles
SELECT 
  '=== AUTH USERS ===' as section,
  COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
  '=== PROFILES ===' as section,
  COUNT(*) as total_profiles
FROM users;

SELECT 
  '=== MISSING PROFILES ===' as section,
  COUNT(*) as missing_profiles
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL;

-- Show all users
SELECT 
  au.id as auth_id,
  au.email,
  u.username,
  u.role,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ OK'
    ELSE '❌ MISSING'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
ORDER BY au.created_at DESC;

-- Show role distribution
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;
