-- ============================================
-- SELECTIVE DATA RESET
-- ============================================
-- Choose what data to delete by uncommenting sections
-- Safer than full reset - delete only what you need
-- ============================================

-- ============================================
-- OPTION 1: Delete only competition data (keep users)
-- ============================================
-- Uncomment this section to delete all competition-related data
-- but keep user accounts intact

/*
BEGIN;

-- Delete attempt tracking
DELETE FROM attempt_tracking;

-- Delete wheel data
DELETE FROM winners;
DELETE FROM wheel_runs;

-- Delete tickets
DELETE FROM tickets;

-- Delete submissions
DELETE FROM training_submissions;
DELETE FROM submissions;

-- Delete participants
DELETE FROM participants;

-- Delete questions
DELETE FROM questions;

-- Delete competitions
DELETE FROM competitions;

COMMIT;
*/

-- ============================================
-- OPTION 2: Delete only a specific competition
-- ============================================
-- Replace 'COMPETITION_ID_HERE' with actual competition ID

/*
BEGIN;

-- Set the competition ID to delete
DO $$
DECLARE
  comp_id UUID := 'COMPETITION_ID_HERE'; -- Replace with actual ID
BEGIN
  -- Delete attempt tracking for this competition
  DELETE FROM attempt_tracking WHERE competition_id = comp_id;
  
  -- Delete wheel data
  DELETE FROM winners WHERE competition_id = comp_id;
  DELETE FROM wheel_runs WHERE competition_id = comp_id;
  
  -- Delete tickets
  DELETE FROM tickets WHERE competition_id = comp_id;
  
  -- Delete submissions
  DELETE FROM submissions WHERE competition_id = comp_id;
  
  -- Delete participants
  DELETE FROM participants WHERE competition_id = comp_id;
  
  -- Delete questions
  DELETE FROM questions WHERE competition_id = comp_id;
  
  -- Delete the competition itself
  DELETE FROM competitions WHERE id = comp_id;
  
  RAISE NOTICE 'Competition % deleted successfully', comp_id;
END $$;

COMMIT;
*/

-- ============================================
-- OPTION 3: Delete only test/draft competitions
-- ============================================
-- Deletes competitions with status 'draft'

/*
BEGIN;

DELETE FROM attempt_tracking 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM winners 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM wheel_runs 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM tickets 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM submissions 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM participants 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM questions 
WHERE competition_id IN (SELECT id FROM competitions WHERE status = 'draft');

DELETE FROM competitions WHERE status = 'draft';

COMMIT;
*/

-- ============================================
-- OPTION 4: Delete only training questions
-- ============================================

/*
BEGIN;

DELETE FROM training_submissions;
DELETE FROM questions WHERE is_training = true;

COMMIT;
*/

-- ============================================
-- OPTION 5: Delete only submissions (keep questions)
-- ============================================

/*
BEGIN;

DELETE FROM training_submissions;
DELETE FROM submissions;
DELETE FROM participants;

COMMIT;
*/

-- ============================================
-- OPTION 6: Reset attempt tracking only
-- ============================================
-- Useful if you want to give students fresh attempts

/*
DELETE FROM attempt_tracking;
*/

-- ============================================
-- OPTION 7: Delete audit logs only
-- ============================================
-- Clean up old logs

/*
-- Delete logs older than 30 days
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Or delete all logs
-- DELETE FROM audit_logs;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check what data remains after deletion

SELECT 
  'attempt_tracking' as table_name, 
  COUNT(*) as count,
  pg_size_pretty(pg_total_relation_size('attempt_tracking')) as size
FROM attempt_tracking
UNION ALL
SELECT 'audit_logs', COUNT(*), pg_size_pretty(pg_total_relation_size('audit_logs'))
FROM audit_logs
UNION ALL
SELECT 'winners', COUNT(*), pg_size_pretty(pg_total_relation_size('winners'))
FROM winners
UNION ALL
SELECT 'wheel_runs', COUNT(*), pg_size_pretty(pg_total_relation_size('wheel_runs'))
FROM wheel_runs
UNION ALL
SELECT 'tickets', COUNT(*), pg_size_pretty(pg_total_relation_size('tickets'))
FROM tickets
UNION ALL
SELECT 'training_submissions', COUNT(*), pg_size_pretty(pg_total_relation_size('training_submissions'))
FROM training_submissions
UNION ALL
SELECT 'submissions', COUNT(*), pg_size_pretty(pg_total_relation_size('submissions'))
FROM submissions
UNION ALL
SELECT 'participants', COUNT(*), pg_size_pretty(pg_total_relation_size('participants'))
FROM participants
UNION ALL
SELECT 'questions', COUNT(*), pg_size_pretty(pg_total_relation_size('questions'))
FROM questions
UNION ALL
SELECT 'competitions', COUNT(*), pg_size_pretty(pg_total_relation_size('competitions'))
FROM competitions
ORDER BY table_name;

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- List all competitions with their data counts
/*
SELECT 
  c.id,
  c.title,
  c.status,
  COUNT(DISTINCT q.id) as questions_count,
  COUNT(DISTINCT s.id) as submissions_count,
  COUNT(DISTINCT p.id) as participants_count,
  COUNT(DISTINCT t.id) as tickets_count
FROM competitions c
LEFT JOIN questions q ON q.competition_id = c.id
LEFT JOIN submissions s ON s.competition_id = c.id
LEFT JOIN participants p ON p.competition_id = c.id
LEFT JOIN tickets t ON t.competition_id = c.id
GROUP BY c.id, c.title, c.status
ORDER BY c.created_at DESC;
*/

-- Find competitions by slug
/*
SELECT id, title, slug, status 
FROM competitions 
WHERE slug LIKE '%test%' OR title LIKE '%test%';
*/
