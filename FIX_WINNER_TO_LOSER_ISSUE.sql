-- Fix: Allow changing winner to loser
-- Issue: Can change loser to winner, but not winner to loser

-- 1. Check current RLS policies on submissions table
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
WHERE tablename = 'submissions'
ORDER BY policyname;

-- 2. Drop any restrictive policies that might prevent winner->loser change
DROP POLICY IF EXISTS "prevent_winner_modification" ON submissions;
DROP POLICY IF EXISTS "winners_cannot_be_changed" ON submissions;

-- 3. Ensure admins can update all submissions
DROP POLICY IF EXISTS "admins_can_update_submissions" ON submissions;

CREATE POLICY "admins_can_update_submissions"
ON submissions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- 4. Check if there are any triggers that might prevent the update
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'submissions'
ORDER BY trigger_name;

-- 5. Test update directly (run this to test if SQL update works)
-- Replace 'YOUR_SUBMISSION_ID' with an actual winner submission ID
/*
UPDATE submissions
SET 
    is_winner = false,
    status = 'rejected',
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE id = 'YOUR_SUBMISSION_ID'
AND is_winner = true
RETURNING *;
*/

-- 6. Check if is_winner column has any constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'submissions'
AND (kcu.column_name = 'is_winner' OR cc.check_clause LIKE '%is_winner%')
ORDER BY tc.constraint_type;

-- 7. Verify the submissions table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'submissions'
AND column_name IN ('is_winner', 'status', 'reviewed_at', 'reviewed_by')
ORDER BY ordinal_position;

-- 8. Check for any foreign key constraints that might cause issues
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'submissions';

-- 9. Grant necessary permissions (if needed)
GRANT UPDATE ON submissions TO authenticated;

-- 10. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- DIAGNOSTIC QUERIES
-- ============================================

-- Check a specific winner submission
SELECT 
    id,
    participant_name,
    is_winner,
    status,
    reviewed_at,
    reviewed_by,
    created_at,
    updated_at
FROM submissions
WHERE is_winner = true
LIMIT 5;

-- Check recent updates to submissions
SELECT 
    id,
    participant_name,
    is_winner,
    status,
    updated_at,
    reviewed_at
FROM submissions
ORDER BY updated_at DESC
LIMIT 10;

-- ============================================
-- MANUAL FIX (if needed)
-- ============================================

-- If you need to manually change a winner to loser:
/*
UPDATE submissions
SET 
    is_winner = false,
    status = 'rejected',
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE id = 'SUBMISSION_ID_HERE';
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- After running the fixes, verify:
-- 1. Try to update a winner to loser through the API
-- 2. Check the audit_logs table to see if the action was logged
SELECT 
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
FROM audit_logs
WHERE entity_type = 'submission'
AND action = 'submission_reviewed'
ORDER BY created_at DESC
LIMIT 10;
