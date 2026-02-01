-- ============================================================================
-- MIGRATION 001: Fix Submissions Table Schema (ADAPTIVE VERSION)
-- ============================================================================
-- This version adapts to your existing schema structure
-- It checks what columns exist before trying to modify them
-- ============================================================================

-- Add missing columns to submissions table (only if they don't exist)
DO $$ 
BEGIN
  -- Add participant_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='participant_name') THEN
    ALTER TABLE submissions ADD COLUMN participant_name TEXT;
  END IF;

  -- Add participant_email if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='participant_email') THEN
    ALTER TABLE submissions ADD COLUMN participant_email TEXT;
  END IF;

  -- Add first_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='first_name') THEN
    ALTER TABLE submissions ADD COLUMN first_name TEXT;
  END IF;

  -- Add father_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='father_name') THEN
    ALTER TABLE submissions ADD COLUMN father_name TEXT;
  END IF;

  -- Add family_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='family_name') THEN
    ALTER TABLE submissions ADD COLUMN family_name TEXT;
  END IF;

  -- Add grade if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='grade') THEN
    ALTER TABLE submissions ADD COLUMN grade TEXT;
  END IF;

  -- Add answers if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='answers') THEN
    ALTER TABLE submissions ADD COLUMN answers JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add proofs if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='proofs') THEN
    ALTER TABLE submissions ADD COLUMN proofs JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add score if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='score') THEN
    ALTER TABLE submissions ADD COLUMN score INTEGER DEFAULT 0;
  END IF;

  -- Add total_questions if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='total_questions') THEN
    ALTER TABLE submissions ADD COLUMN total_questions INTEGER DEFAULT 0;
  END IF;

  -- Add tickets_earned if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='tickets_earned') THEN
    ALTER TABLE submissions ADD COLUMN tickets_earned INTEGER DEFAULT 0;
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='status') THEN
    ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Add retry_allowed if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='retry_allowed') THEN
    ALTER TABLE submissions ADD COLUMN retry_allowed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_retry if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='is_retry') THEN
    ALTER TABLE submissions ADD COLUMN is_retry BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add review_notes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='review_notes') THEN
    ALTER TABLE submissions ADD COLUMN review_notes TEXT;
  END IF;

  RAISE NOTICE '✅ All required columns added or already exist';
END $$;

-- Add constraint to status column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='status') THEN
    -- Drop existing constraint if any
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
    -- Add new constraint
    ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
      CHECK (status IN ('pending', 'under_review', 'approved', 'rejected'));
    RAISE NOTICE '✅ Status constraint added';
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_submissions_participant_name ON submissions(participant_name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);
CREATE INDEX IF NOT EXISTS idx_submissions_tickets_earned ON submissions(tickets_earned);

-- Drop old constraints that might exist
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS unique_user_question_submission;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS unique_user_competition_submission;

-- Handle duplicate submissions before adding unique constraint
-- Keep only the most recent submission for each participant/competition pair
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Check if participant_name column exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='submissions' AND column_name='participant_name'
  ) THEN
    -- Find and delete older duplicate submissions
    WITH ranked_submissions AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          PARTITION BY participant_name, competition_id 
          ORDER BY 
            CASE WHEN submitted_at IS NOT NULL THEN submitted_at ELSE created_at END DESC,
            id DESC
        ) as rn
      FROM submissions
      WHERE participant_name IS NOT NULL
    )
    DELETE FROM submissions
    WHERE id IN (
      SELECT id FROM ranked_submissions WHERE rn > 1
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE '✅ Removed % duplicate submissions', duplicate_count;
    
    -- Now add the unique constraint
    ALTER TABLE submissions ADD CONSTRAINT unique_user_competition_submission 
      UNIQUE (participant_name, competition_id);
    RAISE NOTICE '✅ Unique constraint added';
  ELSE
    RAISE NOTICE '⚠️ participant_name column does not exist, skipping duplicate removal';
  END IF;
END $$;

-- Make user_id and question_id nullable if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='user_id') THEN
    ALTER TABLE submissions ALTER COLUMN user_id DROP NOT NULL;
    RAISE NOTICE '✅ user_id made nullable';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='question_id') THEN
    ALTER TABLE submissions ALTER COLUMN question_id DROP NOT NULL;
    RAISE NOTICE '✅ question_id made nullable';
  END IF;
END $$;

-- Update existing data to have proper status (only if status is null/empty)
DO $$
BEGIN
  -- Check if final_result column exists for migration
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='final_result') THEN
    UPDATE submissions 
    SET status = CASE 
      WHEN final_result = 'correct' THEN 'approved'
      WHEN final_result = 'incorrect' THEN 'rejected'
      ELSE 'pending'
    END
    WHERE status IS NULL OR status = '';
    RAISE NOTICE '✅ Migrated status from final_result';
  ELSE
    -- Just set pending for any null status
    UPDATE submissions 
    SET status = 'pending'
    WHERE status IS NULL OR status = '';
    RAISE NOTICE '✅ Set default status to pending';
  END IF;
END $$;

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
  RAISE NOTICE '📊 Run CHECK_CURRENT_SCHEMA.sql to verify the changes';
END $$;
