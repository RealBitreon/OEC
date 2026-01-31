-- ============================================================================
-- DASHBOARD RESTRUCTURE MIGRATION
-- Adds status field to questions table for Draft/Published states
-- ============================================================================

-- Add status column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED' 
CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Update existing questions to have proper status
-- Training questions: PUBLISHED
UPDATE questions 
SET status = 'PUBLISHED' 
WHERE is_training = true;

-- Competition questions: PUBLISHED (they're already active)
UPDATE questions 
SET status = 'PUBLISHED' 
WHERE competition_id IS NOT NULL;

-- ============================================================================
-- QUESTION TYPES EXPLANATION:
-- ============================================================================
-- 1) Training Question:
--    - is_training = true
--    - competition_id = null
--    - status = 'PUBLISHED'
--
-- 2) Draft/Stored Question (Bank):
--    - status = 'DRAFT'
--    - is_training = false
--    - competition_id = null
--
-- 3) Competition Question:
--    - competition_id = <competition.id>
--    - is_training = false
--    - status = 'DRAFT' or 'PUBLISHED' (published means active in competition)
-- ============================================================================

COMMENT ON COLUMN questions.status IS 'Question status: DRAFT (stored/bank) or PUBLISHED (active)';
