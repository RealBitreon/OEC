-- ============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this to fix the "infinite recursion detected" error
-- ============================================================================

-- Drop ALL existing policies on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
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

-- Create missing profiles if any
INSERT INTO users (id, auth_id, username, email, role, created_at, updated_at)
SELECT 
  au.id, au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'LRC_MANAGER'),
  au.created_at, NOW()
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL
ON CONFLICT (auth_id) DO NOTHING;

-- Verify
SELECT 
  '✅ Policies Fixed' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users';

SELECT 
  '✅ All Users Have Profiles' as status,
  COUNT(*) as user_count
FROM users;

SELECT 
  au.email,
  u.username,
  u.role,
  '✅ OK' as status
FROM auth.users au
JOIN users u ON u.auth_id = au.id
ORDER BY au.created_at DESC;
