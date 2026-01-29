-- ============================================================================
-- CREATE MISSING PROFILES
-- Creates profiles for auth users that don't have them
-- ============================================================================

-- First, check which auth users don't have profiles
SELECT 
  au.id as auth_id,
  au.email,
  au.raw_user_meta_data->>'username' as username,
  au.raw_user_meta_data->>'role' as role,
  au.created_at
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL;

-- Create profiles for all auth users that don't have them
INSERT INTO users (id, auth_id, username, email, role, created_at, updated_at)
SELECT 
  au.id,
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'LRC_MANAGER'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL;

-- Verify all users now have profiles
SELECT 
  au.id as auth_id,
  au.email,
  u.username,
  u.role,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Has Profile'
    ELSE '❌ Missing Profile'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
ORDER BY au.created_at DESC;

-- Check the users table
SELECT 
  id,
  auth_id,
  username,
  email,
  role,
  created_at
FROM users
ORDER BY created_at DESC;
