-- ============================================================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================================================

-- Drop all existing policies on users table
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policies that don't cause recursion
-- Users can read their own profile (using auth.uid() directly)
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Users can update their own profile (using auth.uid() directly)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read all users (simplified - no role check to avoid recursion)
CREATE POLICY "Authenticated can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- For INSERT/DELETE, only service role (used by triggers and admin functions)
CREATE POLICY "Service role can insert"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can delete"
  ON users FOR DELETE
  TO service_role
  USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
