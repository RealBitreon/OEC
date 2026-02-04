-- ============================================================================
-- QUICK FIX: Submissions Trigger Error (user_id field not found)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Drop any problematic triggers that might reference user_id
DROP TRIGGER IF EXISTS audit_submission_changes ON submissions CASCADE;
DROP TRIGGER IF EXISTS log_submission_updates ON submissions CASCADE;
DROP TRIGGER IF EXISTS track_submission_changes ON submissions CASCADE;
DROP TRIGGER IF EXISTS submission_audit_trigger ON submissions CASCADE;

-- 2. Recreate the standard updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop and recreate the updated_at trigger for submissions
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Verify - should only show one trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'submissions';

-- 5. Test update (replace with real submission ID)
-- UPDATE submissions 
-- SET is_winner = true, status = 'approved', updated_at = NOW()
-- WHERE id = 'your-submission-id-here';

-- Done! Try marking winner/loser again in the dashboard.
