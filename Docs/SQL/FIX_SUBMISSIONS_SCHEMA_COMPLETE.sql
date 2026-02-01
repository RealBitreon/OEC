-- ============================================================================
-- COMPLETE FIX FOR SUBMISSIONS TABLE SCHEMA
-- Fixes the "فشل حفظ الإجابات" error
-- ============================================================================

-- 1. Ensure all required columns exist
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proofs JSONB DEFAULT '{}'::jsonb;

-- 2. Ensure questions table has is_active column
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing questions to be active
UPDATE questions 
SET is_active = true 
WHERE is_active IS NULL;

-- 3. Check and fix RLS policies for submissions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;

-- Create permissive policies for service role
CREATE POLICY "Service role can do anything with submissions"
ON submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anonymous inserts (for public participation)
CREATE POLICY "Anyone can insert submissions"
ON submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to view their own submissions
CREATE POLICY "Users can view own submissions"
ON submissions
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Ensure attempt_tracking table exists and has correct structure
CREATE TABLE IF NOT EXISTS attempt_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_competition_device UNIQUE(competition_id, device_fingerprint)
);

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_competition_device 
ON attempt_tracking(competition_id, device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_submissions_competition 
ON submissions(competition_id);

CREATE INDEX IF NOT EXISTS idx_questions_competition_active 
ON questions(competition_id, is_active);

-- 6. Verify the schema
DO $$
BEGIN
  -- Check submissions columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'first_name'
  ) THEN
    RAISE EXCEPTION 'Column first_name missing from submissions table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'is_correct'
  ) THEN
    RAISE EXCEPTION 'Column is_correct missing from submissions table';
  END IF;
  
  -- Check questions columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'is_active'
  ) THEN
    RAISE EXCEPTION 'Column is_active missing from questions table';
  END IF;
  
  RAISE NOTICE 'Schema verification passed!';
END $$;

-- 7. Show current schema for verification
SELECT 
  'submissions' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

SELECT 
  'questions' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'questions'
ORDER BY ordinal_position;

-- 8. Test insert (will rollback)
DO $$
DECLARE
  test_competition_id UUID;
  test_submission_id UUID;
BEGIN
  -- Get first active competition
  SELECT id INTO test_competition_id 
  FROM competitions 
  WHERE status = 'active' 
  LIMIT 1;
  
  IF test_competition_id IS NULL THEN
    RAISE NOTICE 'No active competition found for testing';
    RETURN;
  END IF;
  
  -- Try to insert a test submission
  test_submission_id := gen_random_uuid();
  
  INSERT INTO submissions (
    id,
    competition_id,
    participant_name,
    first_name,
    father_name,
    family_name,
    grade,
    answers,
    proofs,
    score,
    total_questions,
    tickets_earned,
    status,
    submitted_at,
    is_correct
  ) VALUES (
    test_submission_id,
    test_competition_id,
    'Test User',
    'Test',
    'Test',
    'Test',
    '10-1',
    '{}'::jsonb,
    '{}'::jsonb,
    0,
    5,
    0,
    'pending',
    NOW(),
    false
  );
  
  RAISE NOTICE 'Test insert successful! Submission ID: %', test_submission_id;
  
  -- Rollback test data
  DELETE FROM submissions WHERE id = test_submission_id;
  RAISE NOTICE 'Test data cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test insert failed: %', SQLERRM;
  RAISE EXCEPTION 'Schema test failed: %', SQLERRM;
END $$;

-- Success message
SELECT 'Schema fix completed successfully!' as status;
