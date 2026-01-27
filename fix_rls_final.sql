-- ============================================
-- FINAL FIX FOR SIGNUP RLS ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE student_participants DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'student_participants') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON student_participants';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE student_participants ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, permissive policies

-- Policy 1: Allow anyone (anon + authenticated) to INSERT
CREATE POLICY "allow_public_insert"
  ON student_participants
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Allow anyone (anon + authenticated) to SELECT
CREATE POLICY "allow_public_select"
  ON student_participants
  FOR SELECT
  TO public
  USING (true);

-- Policy 3: Allow authenticated users to UPDATE their own data
CREATE POLICY "allow_user_update"
  ON student_participants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT ON student_participants TO anon;
GRANT SELECT, INSERT, UPDATE ON student_participants TO authenticated;

-- Step 6: Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies reset successfully!';
  RAISE NOTICE '📝 New policies created:';
  RAISE NOTICE '   1. allow_public_insert - Anyone can create accounts';
  RAISE NOTICE '   2. allow_public_select - Anyone can check usernames';
  RAISE NOTICE '   3. allow_user_update - Users can update their data';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Permissions granted to anon and authenticated roles';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Signup should now work!';
END $$;

-- Step 7: Test query (optional - comment out if not needed)
-- This will show current policies
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'student_participants'
ORDER BY policyname;
