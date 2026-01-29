-- ============================================================================
-- FIX USER ROLES
-- Updates any users with incorrect roles based on their signup
-- ============================================================================

-- Check current users and their roles
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- Update all VIEWER users to LRC_MANAGER (since VIEWER is no longer valid)
UPDATE users 
SET role = 'LRC_MANAGER' 
WHERE role = 'VIEWER';

-- If you want to make specific users CEO, run:
-- UPDATE users SET role = 'CEO' WHERE username = 'your-username';

-- Verify the changes
SELECT 
  id,
  username,
  email,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- Also update the auth metadata to match
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  to_jsonb((SELECT role FROM users WHERE users.auth_id = auth.users.id))
)
WHERE id IN (SELECT auth_id FROM users);
