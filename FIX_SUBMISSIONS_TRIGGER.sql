-- ============================================================================
-- FIX SUBMISSIONS TRIGGER ERROR
-- Error: record "new" has no field "user_id"
-- ============================================================================

-- Step 1: Check for any problematic triggers on submissions table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'submissions'
ORDER BY trigger_name;

-- Step 2: Drop any custom triggers that might be causing issues
-- (Keep only the standard updated_at trigger)

-- Drop any audit or logging triggers that reference user_id
DROP TRIGGER IF EXISTS audit_submission_changes ON submissions;
DROP TRIGGER IF EXISTS log_submission_updates ON submissions;
DROP TRIGGER IF EXISTS track_submission_changes ON submissions;

-- Step 3: Recreate the standard updated_at trigger
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- Ensure the update_updated_at_column function exists and is correct
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Verify the submissions table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- Step 5: Test the update (this should work now)
-- Uncomment to test with a real submission ID:
-- UPDATE submissions 
-- SET is_winner = true, status = 'approved'
-- WHERE id = 'YOUR_SUBMISSION_ID_HERE';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all triggers on submissions table
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_orientation,
    p.proname as function_name
FROM information_schema.triggers t
LEFT JOIN pg_trigger pt ON pt.tgname = t.trigger_name
LEFT JOIN pg_proc p ON p.oid = pt.tgfoid
WHERE t.event_object_table = 'submissions';

-- Check for any functions that reference user_id in submissions context
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) ILIKE '%submissions%'
  AND pg_get_functiondef(p.oid) ILIKE '%user_id%';

-- ============================================================================
-- NOTES
-- ============================================================================
-- The submissions table does NOT have a user_id column.
-- It has: participant_name, participant_email, reviewed_by (which is a user reference)
-- If you need to track who updated a submission, use reviewed_by instead.
-- ============================================================================
