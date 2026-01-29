-- Fix: Add source_ref column to questions table if missing
-- This ensures the column exists in the database

-- Add source_ref column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'source_ref'
  ) THEN
    ALTER TABLE questions ADD COLUMN source_ref JSONB NOT NULL DEFAULT '{
      "volume": "",
      "page": "",
      "lineFrom": "",
      "lineTo": ""
    }'::jsonb;
    
    RAISE NOTICE 'Added source_ref column to questions table';
  ELSE
    RAISE NOTICE 'source_ref column already exists';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN questions.source_ref IS 'Reference to the source material: volume, page, line numbers';

-- Verify the column exists
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'source_ref'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE '✓ source_ref column verified successfully';
  ELSE
    RAISE EXCEPTION '✗ source_ref column still missing!';
  END IF;
END $$;
