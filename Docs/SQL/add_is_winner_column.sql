-- ============================================
-- ADD IS_WINNER COLUMN TO SUBMISSIONS TABLE
-- ============================================
-- Run this to enable winner tracking in submissions table
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

-- Verify the changes
SELECT 
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE is_winner = true) as winners,
  COUNT(*) FILTER (WHERE is_winner = false) as non_winners
FROM submissions;
