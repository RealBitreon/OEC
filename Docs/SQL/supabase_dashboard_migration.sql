-- ============================================
-- DASHBOARD MIGRATION - PRODUCTION READY
-- ============================================
-- This migration updates the schema to match dashboard requirements
-- Run this AFTER supabase_complete_setup.sql

-- ============================================
-- 1. CREATE PROFILES TABLE (PROPER AUTH)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO', 'LRC_MANAGER', 'STUDENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop if exists first)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "CEO can read all profiles" ON profiles;
CREATE POLICY "CEO can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'CEO'
    )
  );

DROP POLICY IF EXISTS "CEO can update all profiles" ON profiles;
CREATE POLICY "CEO can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'CEO'
    )
  );

-- ============================================
-- 2. UPDATE COMPETITIONS TABLE
-- ============================================

-- Add created_by if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competitions' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE competitions ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Note: Keep wheel_spin_at as is (don't rename to avoid breaking existing data)
-- The application will use wheel_spin_at directly

-- ============================================
-- 3. UPDATE QUESTIONS TABLE
-- ============================================

-- Ensure questions table has correct structure
DO $$
BEGIN
  -- Add is_training if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'is_training'
  ) THEN
    ALTER TABLE questions ADD COLUMN is_training BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- Note: Keep question_text as is (application will handle both names)

  -- Flatten source_ref columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'source_ref'
  ) THEN
    ALTER TABLE questions DROP COLUMN source_ref;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'volume'
  ) THEN
    ALTER TABLE questions ADD COLUMN volume TEXT NOT NULL DEFAULT '';
    ALTER TABLE questions ADD COLUMN page TEXT NOT NULL DEFAULT '';
    ALTER TABLE questions ADD COLUMN line_from TEXT NOT NULL DEFAULT '';
    ALTER TABLE questions ADD COLUMN line_to TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- ============================================
-- 4. UPDATE SUBMISSIONS TABLE
-- ============================================

DO $$
BEGIN
  -- Rename user_id to student_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE submissions RENAME COLUMN user_id TO student_id;
  END IF;

  -- Rename is_correct to auto_result
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'is_correct'
  ) THEN
    ALTER TABLE submissions DROP COLUMN is_correct;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'auto_result'
  ) THEN
    ALTER TABLE submissions ADD COLUMN auto_result TEXT CHECK (auto_result IN ('correct', 'incorrect'));
  END IF;

  -- Rename submitted_at to created_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE submissions RENAME COLUMN submitted_at TO created_at;
  END IF;

  -- Rename reviewed_at to corrected_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE submissions RENAME COLUMN reviewed_at TO corrected_at;
  END IF;

  -- Rename reviewed_by to corrected_by
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE submissions RENAME COLUMN reviewed_by TO corrected_by;
  END IF;
END $$;

-- ============================================
-- 5. UPDATE TICKETS TABLE
-- ============================================

DO $$
BEGIN
  -- Rename user_id to student_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tickets RENAME COLUMN user_id TO student_id;
  END IF;
END $$;

-- ============================================
-- 6. UPDATE WHEEL_RUNS TABLE
-- ============================================

DO $$
BEGIN
  -- Rename snapshot to locked_snapshot
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'snapshot'
  ) THEN
    ALTER TABLE wheel_runs RENAME COLUMN snapshot TO locked_snapshot;
  END IF;

  -- Rename ran_at to run_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'ran_at'
  ) THEN
    ALTER TABLE wheel_runs RENAME COLUMN ran_at TO run_at;
  END IF;

  -- Remove ran_by (not needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'ran_by'
  ) THEN
    ALTER TABLE wheel_runs DROP COLUMN ran_by;
  END IF;
END $$;

-- ============================================
-- 7. UPDATE AUDIT_LOGS TABLE
-- ============================================

DO $$
BEGIN
  -- Rename user_id to actor_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE audit_logs RENAME COLUMN user_id TO actor_id;
  END IF;

  -- Rename details to meta
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'details'
  ) THEN
    ALTER TABLE audit_logs RENAME COLUMN details TO meta;
  END IF;

  -- Rename to audit_log (singular)
  ALTER TABLE IF EXISTS audit_logs RENAME TO audit_log;
END $$;

-- ============================================
-- 8. UPDATE RLS POLICIES FOR NEW STRUCTURE
-- ============================================

-- Update competitions policies to use profiles
DROP POLICY IF EXISTS "Managers can read all competitions" ON competitions;
DROP POLICY IF EXISTS "LRC_MANAGER can read all competitions" ON competitions;
CREATE POLICY "LRC_MANAGER can read all competitions"
  ON competitions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

DROP POLICY IF EXISTS "Managers can create competitions" ON competitions;
DROP POLICY IF EXISTS "LRC_MANAGER can create competitions" ON competitions;
CREATE POLICY "LRC_MANAGER can create competitions"
  ON competitions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

DROP POLICY IF EXISTS "Managers can update competitions" ON competitions;
DROP POLICY IF EXISTS "LRC_MANAGER can update competitions" ON competitions;
CREATE POLICY "LRC_MANAGER can update competitions"
  ON competitions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- Update questions policies
DROP POLICY IF EXISTS "Managers can read all questions" ON questions;
DROP POLICY IF EXISTS "LRC_MANAGER can read all questions" ON questions;
CREATE POLICY "LRC_MANAGER can read all questions"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

DROP POLICY IF EXISTS "Managers can create questions" ON questions;
DROP POLICY IF EXISTS "LRC_MANAGER can create questions" ON questions;
CREATE POLICY "LRC_MANAGER can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

DROP POLICY IF EXISTS "Managers can update questions" ON questions;
DROP POLICY IF EXISTS "LRC_MANAGER can update questions" ON questions;
CREATE POLICY "LRC_MANAGER can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

DROP POLICY IF EXISTS "Managers can delete questions" ON questions;
DROP POLICY IF EXISTS "LRC_MANAGER can delete questions" ON questions;
CREATE POLICY "LRC_MANAGER can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- ============================================
-- 9. CREATE TRIGGER FOR PROFILE CREATION
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Dashboard migration completed successfully!';
  RAISE NOTICE '📊 Tables updated for production dashboard';
  RAISE NOTICE '🔒 RLS policies updated';
  RAISE NOTICE '⚡ Triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Dashboard is ready to use!';
END $$;
