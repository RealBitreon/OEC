-- ============================================
-- RESET ALL DATA - DANGER ZONE! ⚠️
-- ============================================
-- This script deletes ALL data from the database
-- Use with EXTREME caution - this cannot be undone!
-- 
-- RECOMMENDED: Create a backup before running this!
-- In Supabase: Database > Backups > Create backup
-- ============================================

-- Disable triggers temporarily to speed up deletion
SET session_replication_role = 'replica';

-- ============================================
-- DELETE ALL DATA (in correct order to respect foreign keys)
-- ============================================

-- 1. Delete attempt tracking data
TRUNCATE TABLE attempt_tracking CASCADE;

-- 2. Delete audit logs
TRUNCATE TABLE audit_logs CASCADE;

-- 3. Delete wheel data
TRUNCATE TABLE winners CASCADE;
TRUNCATE TABLE wheel_runs CASCADE;

-- 4. Delete tickets
TRUNCATE TABLE tickets CASCADE;

-- 5. Delete submissions
TRUNCATE TABLE training_submissions CASCADE;
TRUNCATE TABLE submissions CASCADE;

-- 6. Delete participants
TRUNCATE TABLE participants CASCADE;

-- 7. Delete questions
TRUNCATE TABLE questions CASCADE;

-- 8. Delete competitions
TRUNCATE TABLE competitions CASCADE;

-- 9. Delete users (if using custom auth table)
-- TRUNCATE TABLE student_participants CASCADE;

-- 10. Delete Supabase Auth users (CAREFUL!)
-- This will delete all authentication accounts
-- Uncomment ONLY if you want to delete all user accounts
-- DELETE FROM auth.users;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify all data is deleted

SELECT 'attempt_tracking' as table_name, COUNT(*) as count FROM attempt_tracking
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'winners', COUNT(*) FROM winners
UNION ALL
SELECT 'wheel_runs', COUNT(*) FROM wheel_runs
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'training_submissions', COUNT(*) FROM training_submissions
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'participants', COUNT(*) FROM participants
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'competitions', COUNT(*) FROM competitions
ORDER BY table_name;

-- ============================================
-- NOTES
-- ============================================
-- 1. This script uses TRUNCATE which is faster than DELETE
-- 2. CASCADE automatically handles foreign key constraints
-- 3. Auth users are NOT deleted by default (uncomment if needed)
-- 4. Table structure and RLS policies remain intact
-- 5. Sequences are reset to 1
