-- ============================================================================
-- CHECK CURRENT SUBMISSIONS TABLE SCHEMA
-- ============================================================================
-- Run this to see what columns actually exist in your submissions table
-- ============================================================================

-- 1. Show all columns in submissions table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- 2. Show all constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'submissions'::regclass;

-- 3. Show all indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'submissions';
