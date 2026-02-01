-- ============================================================================
-- ADD STATUS COLUMN TO QUESTIONS TABLE
-- ============================================================================
-- This migration adds a status column to track whether questions are
-- DRAFT (in library, not visible to students) or PUBLISHED (visible to students)
-- ============================================================================

-- Add status column
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED'
CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Update existing questions based on their current state:
-- 1. Training questions (is_training = true, competition_id = null) -> PUBLISHED
-- 2. Competition questions (competition_id IS NOT NULL) -> PUBLISHED
-- 3. Library questions (is_training = false, competition_id = null) -> DRAFT

UPDATE questions
SET status = CASE
  WHEN is_training = true AND competition_id IS NULL THEN 'PUBLISHED'
  WHEN competition_id IS NOT NULL THEN 'PUBLISHED'
  WHEN is_training = false AND competition_id IS NULL THEN 'DRAFT'
  ELSE 'PUBLISHED'
END;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check the status distribution
SELECT 
  status,
  is_training,
  competition_id IS NULL as is_standalone,
  COUNT(*) as count
FROM questions
GROUP BY status, is_training, competition_id IS NULL
ORDER BY status, is_training;

-- Verify library questions (should be DRAFT)
SELECT 
  id,
  question_text,
  status,
  is_training,
  competition_id
FROM questions
WHERE is_training = false 
  AND competition_id IS NULL
LIMIT 5;

-- Verify training questions (should be PUBLISHED)
SELECT 
  id,
  question_text,
  status,
  is_training,
  competition_id
FROM questions
WHERE is_training = true 
  AND competition_id IS NULL
LIMIT 5;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this migration:
-- 1. Library questions will have status = 'DRAFT' (not visible to students)
-- 2. Training questions will have status = 'PUBLISHED' (visible to students)
-- 3. Competition questions will have status = 'PUBLISHED' (visible in competitions)
-- 4. The UI will correctly filter questions based on status
-- ============================================================================
