-- ============================================
-- ADD IS_WINNER COLUMN TO SUBMISSIONS TABLE
-- ============================================
-- This is OPTIONAL - only run if you want to track winners
-- directly in the submissions table instead of using wheel_winners
--
-- Current fix uses wheel_winners table instead
-- Run this only if you prefer the is_winner approach
-- ============================================

-- Add is_winner column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

-- Add index for performance (only indexes TRUE values)
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner 
ON submissions(is_winner) 
WHERE is_winner = true;

-- Add comment
COMMENT ON COLUMN submissions.is_winner IS 'Indicates if this submission won a prize in the wheel spin';

-- Optional: Update existing wheel winners to set is_winner = true
-- Only run this if you have data in wheel_winners table
UPDATE submissions s
SET is_winner = true
FROM wheel_winners ww
WHERE s.id = ww.submission_id
  AND s.is_winner = false;

-- Verify the changes
SELECT 
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE is_winner = true) as winners,
  COUNT(*) FILTER (WHERE is_winner = false) as non_winners
FROM submissions;
