-- ============================================================================
-- SUPABASE AUTH WITH USERNAME-ONLY (NO EMAIL REQUIRED)
-- Uses Supabase Auth but with username as the primary identifier
-- ============================================================================

-- ============================================================================
-- STEP 1: Update Users Table Schema
-- ============================================================================

-- Drop old sessions table (we'll use Supabase auth sessions)
DROP TABLE IF EXISTS sessions CASCADE;

-- Modify users table to work with Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make email optional
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Update indexes
DROP INDEX IF EXISTS idx_users_username;
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- STEP 2: Create Trigger to Sync Auth Users with Profile
-- ============================================================================

-- Function to create user profile when auth user is created
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

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile when auth user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    username = COALESCE(NEW.raw_user_meta_data->>'username', username),
    role = COALESCE(NEW.raw_user_meta_data->>'role', role),
    updated_at = NOW()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- ============================================================================
-- STEP 3: Update RLS Policies for Users Table
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can read all users" ON users;
DROP POLICY IF EXISTS "CEO can update users" ON users;
DROP POLICY IF EXISTS "CEO can delete users" ON users;
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "CEO can manage users" ON users;

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

-- Authenticated users can read all users (simplified)
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

-- ============================================================================
-- STEP 4: Update Other Table Policies to Use auth.uid()
-- ============================================================================

-- Competitions policies
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can insert competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can insert competitions" ON competitions;
CREATE POLICY "Admins can insert competitions"
  ON competitions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

DROP POLICY IF EXISTS "CEO and LRC_MANAGER can update competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can update competitions" ON competitions;
CREATE POLICY "Admins can update competitions"
  ON competitions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

DROP POLICY IF EXISTS "CEO and LRC_MANAGER can delete competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can delete competitions" ON competitions;
CREATE POLICY "Admins can delete competitions"
  ON competitions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

-- Questions policies
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
CREATE POLICY "Admins can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

DROP POLICY IF EXISTS "CEO and LRC_MANAGER can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
CREATE POLICY "Admins can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

DROP POLICY IF EXISTS "CEO and LRC_MANAGER can delete questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
CREATE POLICY "Admins can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

-- Submissions policies (no user_id column, so skip user-specific policies)
DROP POLICY IF EXISTS "Users can read own submissions" ON submissions;
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can read all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can read all submissions" ON submissions;
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can update submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;

CREATE POLICY "Admins can read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

-- Audit logs policies
DROP POLICY IF EXISTS "CEO and LRC_MANAGER can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('CEO', 'LRC_MANAGER')
    )
  );

-- ============================================================================
-- STEP 5: Helper Functions
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('CEO', 'LRC_MANAGER')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is CEO
CREATE OR REPLACE FUNCTION public.is_ceo()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role = 'CEO'
  );
$$ LANGUAGE sql SECURITY DEFINER;

COMMENT ON TABLE users IS 'User profiles synced with auth.users. Username is primary identifier, email is optional.';
COMMENT ON COLUMN users.auth_id IS 'References auth.users(id). Primary authentication ID.';
COMMENT ON COLUMN users.username IS 'Primary identifier for login. Must be unique.';
COMMENT ON COLUMN users.email IS 'Optional email address for notifications.';
COMMENT ON COLUMN users.role IS 'User role: CEO (full access), LRC_MANAGER (competition management), VIEWER (read-only)';
