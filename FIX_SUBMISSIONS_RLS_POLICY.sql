-- Fix RLS policy for submissions to allow CEO and LRC_MANAGER to update
-- This fixes the "Admins can update submissions" policy to use the correct roles

-- First, drop the old policy
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;

-- Create new policy with correct roles
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Also fix the view policy
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Verify the policies were created correctly
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
AND policyname LIKE '%Admin%'
ORDER BY policyname;
