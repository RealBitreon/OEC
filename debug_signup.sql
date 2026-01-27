-- ============================================
-- DEBUG SIGNUP ISSUE
-- Run this to check current RLS policies
-- ============================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'student_participants'
) as table_exists;

-- Check current policies on student_participants
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'student_participants'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'student_participants';

-- Test insert permission for anon role
-- This will show if anon can insert
SELECT has_table_privilege('anon', 'student_participants', 'INSERT') as anon_can_insert;
SELECT has_table_privilege('anon', 'student_participants', 'SELECT') as anon_can_select;

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'student_participants'
ORDER BY ordinal_position;
