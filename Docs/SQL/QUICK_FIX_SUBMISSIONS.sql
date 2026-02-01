-- ============================================================================
-- QUICK FIX FOR SUBMISSIONS ERROR
-- Run this in Supabase SQL Editor to fix "فشل حفظ الإجابات"
-- ============================================================================

-- Step 1: Add missing columns to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proofs JSONB DEFAULT '{}'::jsonb;

-- Step 2: Add is_active column to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Update existing questions
UPDATE questions 
SET is_active = true 
WHERE is_active IS NULL;

-- Step 4: Fix RLS policies for submissions
-- Allow service role full access
DROP POLICY IF EXISTS "Service role can do anything with submissions" ON submissions;
CREATE POLICY "Service role can do anything with submissions"
ON submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public inserts
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
CREATE POLICY "Anyone can insert submissions"
ON submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 5: Verify schema
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'submissions'
  AND column_name IN ('first_name', 'father_name', 'family_name', 'grade', 'is_correct', 'proofs')
ORDER BY column_name;

-- If you see 6 rows above, the fix is complete!
