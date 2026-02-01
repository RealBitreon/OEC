-- ============================================================================
-- MINIMAL FIX: Your Schema Already Has Most Columns
-- ============================================================================
-- Based on your indexes, you already have:
-- - participant_name ✅
-- - status ✅
-- - is_retry ✅
-- - is_winner ✅
-- - reviewed_by ✅
-- This migration just adds any missing columns and ensures constraints
-- ============================================================================

-- Add only the columns that might be missing
DO $$ 
BEGIN
  -- Add score if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='score') THEN
    ALTER TABLE submissions ADD COLUMN score INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added score column';
  ELSE
    RAISE NOTICE '⏭️ score column already exists';
  END IF;

  -- Add total_questions if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='total_questions') THEN
    ALTER TABLE submissions ADD COLUMN total_questions INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added total_questions column';
  ELSE
    RAISE NOTICE '⏭️ total_questions column already exists';
  END IF;

  -- Add tickets_earned if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='tickets_earned') THEN
    ALTER TABLE submissions ADD COLUMN tickets_earned INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added tickets_earned column';
  ELSE
    RAISE NOTICE '⏭️ tickets_earned column already exists';
  END IF;

  -- Add answers if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='answers') THEN
    ALTER TABLE submissions ADD COLUMN answers JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Added answers column';
  ELSE
    RAISE NOTICE '⏭️ answers column already exists';
  END IF;

  -- Add proofs if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='proofs') THEN
    ALTER TABLE submissions ADD COLUMN proofs JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Added proofs column';
  ELSE
    RAISE NOTICE '⏭️ proofs column already exists';
  END IF;

  -- Add participant_email if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='participant_email') THEN
    ALTER TABLE submissions ADD COLUMN participant_email TEXT;
    RAISE NOTICE '✅ Added participant_email column';
  ELSE
    RAISE NOTICE '⏭️ participant_email column already exists';
  END IF;

  -- Add first_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='first_name') THEN
    ALTER TABLE submissions ADD COLUMN first_name TEXT;
    RAISE NOTICE '✅ Added first_name column';
  ELSE
    RAISE NOTICE '⏭️ first_name column already exists';
  END IF;

  -- Add father_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='father_name') THEN
    ALTER TABLE submissions ADD COLUMN father_name TEXT;
    RAISE NOTICE '✅ Added father_name column';
  ELSE
    RAISE NOTICE '⏭️ father_name column already exists';
  END IF;

  -- Add family_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='family_name') THEN
    ALTER TABLE submissions ADD COLUMN family_name TEXT;
    RAISE NOTICE '✅ Added family_name column';
  ELSE
    RAISE NOTICE '⏭️ family_name column already exists';
  END IF;

  -- Add grade if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='grade') THEN
    ALTER TABLE submissions ADD COLUMN grade TEXT;
    RAISE NOTICE '✅ Added grade column';
  ELSE
    RAISE NOTICE '⏭️ grade column already exists';
  END IF;

  -- Add retry_allowed if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='retry_allowed') THEN
    ALTER TABLE submissions ADD COLUMN retry_allowed BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '✅ Added retry_allowed column';
  ELSE
    RAISE NOTICE '⏭️ retry_allowed column already exists';
  END IF;

  -- Add review_notes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='review_notes') THEN
    ALTER TABLE submissions ADD COLUMN review_notes TEXT;
    RAISE NOTICE '✅ Added review_notes column';
  ELSE
    RAISE NOTICE '⏭️ review_notes column already exists';
  END IF;

  -- Add reviewed_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='reviewed_at') THEN
    ALTER TABLE submissions ADD COLUMN reviewed_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Added reviewed_at column';
  ELSE
    RAISE NOTICE '⏭️ reviewed_at column already exists';
  END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);
CREATE INDEX IF NOT EXISTS idx_submissions_tickets_earned ON submissions(tickets_earned);

-- Add constraint to status column if it doesn't exist
DO $$
BEGIN
  -- Drop existing constraint if any
  ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
  -- Add new constraint
  ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected'));
  RAISE NOTICE '✅ Status constraint added/updated';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '⏭️ Status constraint already exists';
END $$;

-- Handle duplicates and add unique constraint
DO $$
DECLARE
  duplicate_count INTEGER;
  has_constraint BOOLEAN;
BEGIN
  -- Check if constraint already exists
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_competition_submission'
  ) INTO has_constraint;

  IF NOT has_constraint THEN
    -- Remove duplicates first
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
    RAISE NOTICE '✅ Removed % duplicate submissions', duplicate_count;
    
    -- Add unique constraint
    ALTER TABLE submissions ADD CONSTRAINT unique_user_competition_submission 
      UNIQUE (participant_name, competition_id);
    RAISE NOTICE '✅ Unique constraint added';
  ELSE
    RAISE NOTICE '⏭️ Unique constraint already exists';
  END IF;
END $$;

-- Set default status for any null values
UPDATE submissions 
SET status = 'pending'
WHERE status IS NULL OR status = '';

-- Add helpful comments
COMMENT ON COLUMN submissions.participant_name IS 'Full name of participant';
COMMENT ON COLUMN submissions.answers IS 'JSON object mapping question_id to answer';
COMMENT ON COLUMN submissions.proofs IS 'JSON object mapping question_id to evidence';
COMMENT ON COLUMN submissions.status IS 'Review status: pending, under_review, approved, rejected';
COMMENT ON COLUMN submissions.tickets_earned IS 'Number of lottery tickets earned';
COMMENT ON COLUMN submissions.score IS 'Number of correct answers';
COMMENT ON COLUMN submissions.total_questions IS 'Total number of questions';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Your submissions table is now ready!';
  RAISE NOTICE 'Next: Run 002_auto_ticket_creation.sql';
  RAISE NOTICE '========================================';
END $$;
