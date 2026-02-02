-- Add is_winner column to submissions table if it doesn't exist
-- This column tracks pass/fail status for student submissions

DO $$ 
BEGIN
    -- Check if is_winner column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'is_winner'
    ) THEN
        -- Add is_winner column
        ALTER TABLE submissions 
        ADD COLUMN is_winner BOOLEAN DEFAULT NULL;
        
        RAISE NOTICE 'Added is_winner column to submissions table';
    ELSE
        RAISE NOTICE 'is_winner column already exists in submissions table';
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner ON submissions(is_winner);

-- Update existing submissions based on status
-- approved = winner (passed), rejected = not winner (failed)
UPDATE submissions 
SET is_winner = CASE 
    WHEN status = 'approved' THEN true
    WHEN status = 'rejected' THEN false
    ELSE NULL
END
WHERE is_winner IS NULL;

COMMENT ON COLUMN submissions.is_winner IS 'Pass/fail status: true = passed (winner), false = failed (not winner), null = pending review';
