-- Add is_winner column to submissions table
-- This allows marking students as winners or losers after the wheel spin

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT NULL;

-- Add index for faster winner queries
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner 
ON submissions(is_winner) 
WHERE is_winner IS NOT NULL;

-- Add updated_at column if it doesn't exist
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
  AND column_name IN ('is_winner', 'updated_at')
ORDER BY column_name;

-- Success message
SELECT 'Winner status column added successfully!' as status;
