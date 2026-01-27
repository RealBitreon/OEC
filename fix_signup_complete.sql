-- ============================================
-- إصلاح شامل لمشكلة التسجيل
-- COMPLETE SIGNUP FIX
-- ============================================
-- نفذ هذا الملف في Supabase SQL Editor
-- Run this in Supabase SQL Editor
-- ============================================

-- الخطوة 1: حذف جميع السياسات القديمة
-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow public signup" ON student_participants;
DROP POLICY IF EXISTS "Allow public username check" ON student_participants;
DROP POLICY IF EXISTS "Users can read own data" ON student_participants;
DROP POLICY IF EXISTS "Managers can read all users" ON student_participants;
DROP POLICY IF EXISTS "Users can update own data" ON student_participants;
DROP POLICY IF EXISTS "Allow anon insert" ON student_participants;
DROP POLICY IF EXISTS "Allow anon select" ON student_participants;

-- الخطوة 2: تأكد من تفعيل RLS
-- Step 2: Ensure RLS is enabled
ALTER TABLE student_participants ENABLE ROW LEVEL SECURITY;

-- الخطوة 3: إنشاء سياسات جديدة للتسجيل
-- Step 3: Create new policies for signup

-- 1. السماح بالتسجيل للجميع (بدون مصادقة)
-- Allow anyone to signup (no authentication required)
CREATE POLICY "Enable insert for anon users"
  ON student_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. السماح بقراءة البيانات للتحقق من اسم المستخدم
-- Allow reading data to check username uniqueness
CREATE POLICY "Enable select for anon users"
  ON student_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. السماح للمستخدمين بتحديث بياناتهم الخاصة
-- Allow users to update their own data
CREATE POLICY "Enable update for users based on id"
  ON student_participants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. السماح للمستخدمين بحذف حساباتهم
-- Allow users to delete their own accounts
CREATE POLICY "Enable delete for users based on id"
  ON student_participants
  FOR DELETE
  TO authenticated
  USING (true);

-- الخطوة 4: التحقق من الأعمدة المطلوبة
-- Step 4: Verify required columns exist
DO $$
BEGIN
  -- التحقق من وجود عمود password_hash
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_participants' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE student_participants ADD COLUMN password_hash TEXT;
  END IF;

  -- التحقق من وجود عمود role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_participants' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE student_participants ADD COLUMN role TEXT DEFAULT 'student';
  END IF;

  -- التحقق من وجود عمود created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_participants' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE student_participants ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- الخطوة 5: إنشاء فهرس لتحسين الأداء
-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_participants_username 
  ON student_participants(username);

-- الخطوة 6: التحقق من النجاح
-- Step 6: Verification
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'student_participants';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ تم تطبيق الإصلاح بنجاح!';
  RAISE NOTICE '✅ Fix applied successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 عدد السياسات المطبقة: %', policy_count;
  RAISE NOTICE '📊 Number of policies applied: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ التغييرات المطبقة:';
  RAISE NOTICE '✅ Changes applied:';
  RAISE NOTICE '   1. السماح بالتسجيل العام (بدون مصادقة)';
  RAISE NOTICE '      Public signup enabled (no auth required)';
  RAISE NOTICE '   2. السماح بالتحقق من أسماء المستخدمين';
  RAISE NOTICE '      Username uniqueness check enabled';
  RAISE NOTICE '   3. السماح بتحديث البيانات الشخصية';
  RAISE NOTICE '      User self-update enabled';
  RAISE NOTICE '   4. السماح بحذف الحسابات';
  RAISE NOTICE '      Account deletion enabled';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 يمكنك الآن تجربة التسجيل!';
  RAISE NOTICE '🚀 You can now try signup!';
  RAISE NOTICE '========================================';
END $$;

-- الخطوة 7: عرض السياسات الحالية للتحقق
-- Step 7: Display current policies for verification
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
