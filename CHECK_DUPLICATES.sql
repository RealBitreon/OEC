-- ============================================================================
-- DIAGNOSTIC: Check for Duplicate Submissions
-- ============================================================================
-- Run this BEFORE the migration to see what duplicates exist
-- ============================================================================

-- 1. Show all duplicate submissions with details
SELECT 
  participant_name,
  competition_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::TEXT, ', ' ORDER BY submitted_at DESC) as submission_ids,
  STRING_AGG(submitted_at::TEXT, ', ' ORDER BY submitted_at DESC) as submission_dates,
  STRING_AGG(COALESCE(score::TEXT, 'NULL'), ', ' ORDER BY submitted_at DESC) as scores
FROM submissions
WHERE participant_name IS NOT NULL
GROUP BY participant_name, competition_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, participant_name;

-- 2. Count total duplicates
SELECT 
  COUNT(*) as total_duplicate_groups,
  SUM(duplicate_count - 1) as submissions_to_be_removed
FROM (
  SELECT 
    participant_name,
    competition_id,
    COUNT(*) as duplicate_count
  FROM submissions
  WHERE participant_name IS NOT NULL
  GROUP BY participant_name, competition_id
  HAVING COUNT(*) > 1
) duplicates;

-- 3. Show which submissions will be KEPT (most recent)
WITH ranked_submissions AS (
  SELECT 
    id,
    participant_name,
    competition_id,
    submitted_at,
    score,
    ROW_NUMBER() OVER (
      PARTITION BY participant_name, competition_id 
      ORDER BY submitted_at DESC, id DESC
    ) as rn
  FROM submissions
  WHERE participant_name IS NOT NULL
)
SELECT 
  participant_name,
  competition_id,
  id as kept_submission_id,
  submitted_at as kept_submission_date,
  score as kept_score
FROM ranked_submissions
WHERE rn = 1
AND participant_name IN (
  SELECT participant_name
  FROM submissions
  WHERE participant_name IS NOT NULL
  GROUP BY participant_name, competition_id
  HAVING COUNT(*) > 1
)
ORDER BY participant_name, competition_id;

-- 4. Show which submissions will be DELETED (older ones)
WITH ranked_submissions AS (
  SELECT 
    id,
    participant_name,
    competition_id,
    submitted_at,
    score,
    ROW_NUMBER() OVER (
      PARTITION BY participant_name, competition_id 
      ORDER BY submitted_at DESC, id DESC
    ) as rn
  FROM submissions
  WHERE participant_name IS NOT NULL
)
SELECT 
  participant_name,
  competition_id,
  id as deleted_submission_id,
  submitted_at as deleted_submission_date,
  score as deleted_score,
  '❌ WILL BE DELETED' as action
FROM ranked_submissions
WHERE rn > 1
ORDER BY participant_name, competition_id, submitted_at DESC;

-- ============================================================================
-- DECISION GUIDE:
-- ============================================================================
-- If the results look correct (keeping most recent, deleting older):
--   → Run: Docs/SQL/001_fix_submissions_schema.sql
--
-- If you want to manually handle duplicates:
--   → Use the DELETE query from query #4 above
--   → Then run: Docs/SQL/001_fix_submissions_schema.sql
--
-- If you want to keep ALL submissions (not recommended):
--   → You'll need to modify the unique constraint to allow duplicates
--   → Or add a sequence number to make them unique
-- ============================================================================
