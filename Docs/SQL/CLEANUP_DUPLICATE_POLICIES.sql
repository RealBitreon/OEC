-- ============================================================================
-- CLEANUP DUPLICATE RLS POLICIES
-- This script removes all duplicate and redundant policies
-- Run this BEFORE the migration script
-- ============================================================================

-- ============================================================================
-- ATTEMPT_TRACKING - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can read attempts" ON attempt_tracking;
DROP POLICY IF EXISTS "Anyone can track attempts" ON attempt_tracking;
DROP POLICY IF EXISTS "Anyone can update attempts" ON attempt_tracking;
DROP POLICY IF EXISTS "Authenticated users can delete attempts" ON attempt_tracking;

-- ============================================================================
-- AUDIT_LOGS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "audit_logs_all_ceo" ON audit_logs;

-- ============================================================================
-- COMPETITIONS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "competitions_all_admin" ON competitions;
DROP POLICY IF EXISTS "competitions_select_auth" ON competitions;
DROP POLICY IF EXISTS "competitions_select_public" ON competitions;

-- ============================================================================
-- QUESTIONS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "questions_all_admin" ON questions;
DROP POLICY IF EXISTS "questions_select_auth" ON questions;
DROP POLICY IF EXISTS "questions_select_public" ON questions;

-- ============================================================================
-- SUBMISSIONS - Remove duplicates (KEEP ONLY ESSENTIAL)
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Service role can do anything with submissions" ON submissions;
DROP POLICY IF EXISTS "submissions_all_admin" ON submissions;
DROP POLICY IF EXISTS "submissions_insert_public" ON submissions;
DROP POLICY IF EXISTS "submissions_select_auth" ON submissions;
DROP POLICY IF EXISTS "submissions_select_public" ON submissions;

-- ============================================================================
-- SYSTEM_SETTINGS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "system_settings_all_admin" ON system_settings;

-- ============================================================================
-- USER_SESSIONS - Keep only one
-- ============================================================================
-- Keep: user_sessions_own

-- ============================================================================
-- USERS - Remove duplicates (KEEP ONLY ESSENTIAL)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated can read all users" ON users;
DROP POLICY IF EXISTS "CEO can manage users" ON users;
DROP POLICY IF EXISTS "Service role can delete" ON users;
DROP POLICY IF EXISTS "Service role can insert" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- ============================================================================
-- WHEEL_PRIZES - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "wheel_prizes_all_admin" ON wheel_prizes;
DROP POLICY IF EXISTS "wheel_prizes_select_auth" ON wheel_prizes;
DROP POLICY IF EXISTS "wheel_prizes_select_public" ON wheel_prizes;

-- ============================================================================
-- WHEEL_RUNS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "Service role can manage wheel runs" ON wheel_runs;

-- ============================================================================
-- WHEEL_SPINS - Remove duplicates
-- ============================================================================
DROP POLICY IF EXISTS "wheel_spins_all_admin" ON wheel_spins;
DROP POLICY IF EXISTS "wheel_spins_insert_public" ON wheel_spins;
DROP POLICY IF EXISTS "wheel_spins_select_auth" ON wheel_spins;
DROP POLICY IF EXISTS "wheel_spins_select_public" ON wheel_spins;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check remaining policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Show all remaining policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
