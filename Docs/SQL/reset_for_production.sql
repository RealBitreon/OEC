-- ============================================================================
-- PRODUCTION RESET SCRIPT
-- ============================================================================
-- This script removes ALL test data and prepares the database for real usage
-- WARNING: This will delete ALL users, competitions, submissions, and related data
-- Run this ONLY when you're ready to start with real data
-- ============================================================================

-- Step 1: Disable RLS temporarily to ensure clean deletion
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wheel_prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wheel_spins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempt_tracking DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete all data from tables (in correct order to respect foreign keys)
DELETE FROM public.audit_logs;
DELETE FROM public.wheel_spins;
DELETE FROM public.wheel_prizes;
DELETE FROM public.submissions;
DELETE FROM public.questions;
DELETE FROM public.competitions;
DELETE FROM public.tickets;
DELETE FROM public.attempt_tracking;
DELETE FROM public.settings;
DELETE FROM public.profiles;

-- Step 3: Delete all users from auth.users
-- This removes all authentication accounts
DELETE FROM auth.users;

-- Step 4: Reset sequences to start from 1
ALTER SEQUENCE IF EXISTS public.competitions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.questions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.submissions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.wheel_prizes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.wheel_spins_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.tickets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.audit_logs_id_seq RESTART WITH 1;

-- Step 5: Re-enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attempt_tracking ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify deletion
SELECT 'Users remaining: ' || COUNT(*) FROM auth.users;
SELECT 'Profiles remaining: ' || COUNT(*) FROM public.profiles;
SELECT 'Competitions remaining: ' || COUNT(*) FROM public.competitions;
SELECT 'Questions remaining: ' || COUNT(*) FROM public.questions;
SELECT 'Submissions remaining: ' || COUNT(*) FROM public.submissions;
SELECT 'Wheel prizes remaining: ' || COUNT(*) FROM public.wheel_prizes;
SELECT 'Wheel spins remaining: ' || COUNT(*) FROM public.wheel_spins;
SELECT 'Tickets remaining: ' || COUNT(*) FROM public.tickets;
SELECT 'Audit logs remaining: ' || COUNT(*) FROM public.audit_logs;
SELECT 'Attempt tracking remaining: ' || COUNT(*) FROM public.attempt_tracking;

-- ============================================================================
-- RESET COMPLETE
-- ============================================================================
-- Your database is now clean and ready for production data
-- Next steps:
-- 1. Create your first admin account through the signup page
-- 2. Manually set the role to 'admin' in the profiles table
-- 3. Start creating real competitions and questions
-- ============================================================================
