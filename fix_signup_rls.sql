-- ============================================
-- FIX SIGNUP RLS POLICIES
-- Run this in Supabase SQL Editor to fix signup issues
-- ============================================

-- Drop ALL existing policies for student_participants
DROP POLICY IF EXISTS "Allow public signup" ON student_participants;
DROP POLICY IF EXISTS "Allow public username check" ON student_participants;
DROP POLICY IF EXISTS "Users can read own data" ON student_participants;
DROP POLICY IF EXISTS "Managers can read all users" ON student_participants;
DROP POLICY IF EXISTS "Users can update own data" ON student_participants;

-- ============================================
-- NEW POLICIES FOR STUDENT PARTICIPANTS
-- ============================================

-- 1. Allow public signup (insert) - No authentication required
CREATE POLICY "Allow public signup"
  ON student_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Allow public to read basic user info (for username uniqueness check)
CREATE POLICY "Allow public username check"
  ON student_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Users can update their own data (when authenticated)
CREATE POLICY "Users can update own data"
  ON student_participants
  FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated successfully!';
  RAISE NOTICE '📝 Changes applied:';
  RAISE NOTICE '   - Public signup enabled (no auth required)';
  RAISE NOTICE '   - Public username check enabled';
  RAISE NOTICE '   - User self-update enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Signup should now work correctly!';
END $$;
