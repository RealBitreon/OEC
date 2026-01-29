-- ============================================
-- TEST AUTH SETUP
-- Run this to verify everything is configured correctly
-- ============================================

-- Test 1: Check if profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE '✅ TEST 1 PASSED: profiles table exists';
  ELSE
    RAISE NOTICE '❌ TEST 1 FAILED: profiles table does NOT exist';
    RAISE NOTICE '   → Run fix_auth_setup.sql to create it';
  END IF;
END $$;

-- Test 2: Check table structure
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN ('id', 'username', 'role', 'created_at');
  
  IF col_count = 4 THEN
    RAISE NOTICE '✅ TEST 2 PASSED: profiles table has correct columns';
  ELSE
    RAISE NOTICE '❌ TEST 2 FAILED: profiles table missing columns (found % of 4)', col_count;
  END IF;
END $$;

-- Test 3: Check if RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ TEST 3 PASSED: RLS is enabled on profiles';
  ELSE
    RAISE NOTICE '❌ TEST 3 FAILED: RLS is NOT enabled on profiles';
    RAISE NOTICE '   → Run: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;';
  END IF;
END $$;

-- Test 4: Check RLS policies
DO $$
DECLARE
  policy_count INTEGER;
  has_insert_policy BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND cmd = 'INSERT'
  ) INTO has_insert_policy;
  
  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ TEST 4 PASSED: Found % RLS policies on profiles', policy_count;
  ELSE
    RAISE NOTICE '❌ TEST 4 FAILED: Only found % RLS policies (need at least 3)', policy_count;
  END IF;
  
  IF has_insert_policy THEN
    RAISE NOTICE '✅ TEST 4.1 PASSED: INSERT policy exists';
  ELSE
    RAISE NOTICE '❌ TEST 4.1 FAILED: No INSERT policy found';
    RAISE NOTICE '   → This is critical! Run fix_auth_setup.sql';
  END IF;
END $$;

-- Test 5: Check trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
  ) THEN
    RAISE NOTICE '✅ TEST 5 PASSED: Trigger on_auth_user_created exists';
  ELSE
    RAISE NOTICE '⚠️  TEST 5 WARNING: Trigger on_auth_user_created not found';
    RAISE NOTICE '   → This is OK if you are manually creating profiles in code';
  END IF;
END $$;

-- Test 6: Check trigger function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE '✅ TEST 6 PASSED: Function handle_new_user exists';
  ELSE
    RAISE NOTICE '⚠️  TEST 6 WARNING: Function handle_new_user not found';
    RAISE NOTICE '   → This is OK if you are manually creating profiles in code';
  END IF;
END $$;

-- Test 7: Check permissions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE table_name = 'profiles'
    AND grantee = 'authenticated'
    AND privilege_type IN ('INSERT', 'SELECT', 'UPDATE')
  ) THEN
    RAISE NOTICE '✅ TEST 7 PASSED: Permissions granted to authenticated role';
  ELSE
    RAISE NOTICE '⚠️  TEST 7 WARNING: Some permissions may be missing';
    RAISE NOTICE '   → Run: GRANT ALL ON public.profiles TO authenticated;';
  END IF;
END $$;

-- Test 8: List all policies for review
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📋 Current RLS Policies on profiles table:';
  
  FOR policy_record IN
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename = 'profiles'
  LOOP
    RAISE NOTICE '   - % (%) ', policy_record.policyname, policy_record.cmd;
  END LOOP;
  
  -- Summary
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'If all tests passed (✅), your auth setup is correct.';
  RAISE NOTICE 'If any test failed (❌), run fix_auth_setup.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Disable email confirmation in Supabase Dashboard';
  RAISE NOTICE '2. Try signing up in your app';
  RAISE NOTICE '3. Check browser console for detailed errors';
  RAISE NOTICE '========================================';
END $$;
