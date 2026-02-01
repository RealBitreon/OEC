-- ============================================================================
-- MIGRATION 001: Fix Submissions Table Schema (SAFE VERSION)
-- ============================================================================
-- This version shows you duplicates before removing them
-- Use this if you want to review duplicates first
-- ============================================================================

-- STEP 1: Check for duplicates (run this first to see what will be removed)
SELECT 
  participant_name,
  competition_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ') as submission_ids,
  STRING_AGG(submitted_at::TEXT, ', ') as submission_dates
FROM submissions
WHERE participant_name IS NOT NULL
GROUP BY participant_name, competition_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- STEP 2: If you're happy with removing older duplicates, run the full migration
-- (This is the same as 001_fix_submissions_schema.sql)

-- Add missing columns to submissions table
ALTER TABLE submissions 
  ADD COLUMN IF NOT EXISTS participant_name TEXT,
  ADD COLUMN IF NOT EXISTS participant_email TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS family_name TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS proofs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tickets_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS retry_allowed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_retry BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_submissions_participant_name ON submissions(participant_name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);
CREATE INDEX IF NOT EXISTS idx_submissions_tickets_earned ON submissions(tickets_earned);

-- Drop old constraint if exists
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS unique_user_question_submission;

-- Handle duplicate submissions before adding unique constraint
-- Keep only the most recent submission for each participant/competition pair
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Find and delete older duplicate submissions
  WITH ranked_submissions AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY participant_name, competition_id 
        ORDER BY submitted_at DESC, id DESC
      ) as rn
    FROM submissions
    WHERE participant_name IS NOT NULL
  )
  DELETE FROM submissions
  WHERE id IN (
    SELECT id FROM ranked_submissions WHERE rn > 1
  );
  
  GET DIAGNOSTICS duplicate_count = ROW_COUNT;
  RAISE NOTICE 'Removed % duplicate submissions', duplicate_count;
END $$;

-- Now add the unique constraint
ALTER TABLE submissions ADD CONSTRAINT unique_user_competition_submission 
  UNIQUE (participant_name, competition_id);

-- Make user_id and question_id nullable (we use participant_name and answers JSON now)
ALTER TABLE submissions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE submissions ALTER COLUMN question_id DROP NOT NULL;

-- Update existing data to have proper status
UPDATE submissions 
SET status = CASE 
  WHEN final_result = 'correct' THEN 'approved'
  WHEN final_result = 'incorrect' THEN 'rejected'
  ELSE 'pending'
END
WHERE status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN submissions.participant_name IS 'Full name of participant (used as identifier for anonymous submissions)';
COMMENT ON COLUMN submissions.answers IS 'JSON object mapping question_id to answer';
COMMENT ON COLUMN submissions.proofs IS 'JSON object mapping question_id to evidence/proof text';
COMMENT ON COLUMN submissions.status IS 'Review status: pending, under_review, approved, rejected';
COMMENT ON COLUMN submissions.tickets_earned IS 'Number of lottery tickets earned (calculated on submission based on competition rules)';
COMMENT ON COLUMN submissions.score IS 'Number of correct answers';
COMMENT ON COLUMN submissions.total_questions IS 'Total number of questions in the competition';
COMMENT ON COLUMN submissions.retry_allowed IS 'Whether admin has allowed this participant to retry after rejection';
COMMENT ON COLUMN submissions.is_retry IS 'Whether this submission is a retry attempt';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 001 completed: Submissions table schema fixed';
END $$;
