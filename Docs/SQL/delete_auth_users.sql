-- ============================================
-- DELETE AUTHENTICATION USERS - EXTREME CAUTION! ⚠️⚠️⚠️
-- ============================================
-- This script deletes user authentication accounts
-- This is IRREVERSIBLE and will log out all users
-- 
-- ONLY use this for:
-- - Development/testing environments
-- - Complete system reset
-- - Starting fresh
-- 
-- DO NOT use in production without backup!
-- ============================================

-- ============================================
-- STEP 1: Backup check
-- ============================================
-- Verify you have a backup before proceeding
-- In Supabase: Database > Backups > Check latest backup

-- ============================================
-- STEP 2: View current users
-- ============================================
-- See what users exist before deletion

SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC;

-- Count users
SELECT COUNT(*) as total_users FROM auth.users;

-- ============================================
-- STEP 3: Delete specific users (SAFER)
-- ============================================
-- Delete users by email pattern (e.g., test users)

/*
-- Delete test users only
DELETE FROM auth.users 
WHERE email LIKE '%test%' 
   OR email LIKE '%demo%'
   OR email LIKE '%example%';
*/

-- Delete users by date (e.g., created in last 24 hours)
/*
DELETE FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours';
*/

-- Delete specific user by email
/*
DELETE FROM auth.users 
WHERE email = 'specific@example.com';
*/

-- ============================================
-- STEP 4: Delete ALL users (DANGEROUS!)
-- ============================================
-- Uncomment ONLY if you want to delete ALL authentication accounts

/*
-- This will delete ALL users including admins!
DELETE FROM auth.users;
*/

-- ============================================
-- STEP 5: Verification
-- ============================================
-- Check remaining users

SELECT 
  COUNT(*) as remaining_users,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user
FROM auth.users;

-- ============================================
-- STEP 6: Clean up related data
-- ============================================
-- After deleting auth users, you may want to clean up related data

/*
-- Delete orphaned profiles (if you have a profiles table)
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Delete orphaned student_participants
DELETE FROM student_participants 
WHERE id NOT IN (SELECT id FROM auth.users);
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. Deleting auth.users will CASCADE to related tables if FK constraints exist
-- 2. Users will be immediately logged out
-- 3. Email addresses can be reused after deletion
-- 4. This does NOT delete data in your application tables (competitions, questions, etc.)
-- 5. To delete everything, run reset_all_data.sql first, then this script

-- ============================================
-- RECOVERY
-- ============================================
-- If you deleted users by mistake:
-- 1. Restore from Supabase backup
-- 2. Or manually recreate admin accounts:

/*
-- Example: Create new admin user (adjust as needed)
-- This requires Supabase Dashboard or API, cannot be done via SQL alone
-- Go to: Authentication > Users > Add User
*/
