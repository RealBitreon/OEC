-- ============================================================================
-- MIGRATION 001: Fix RLS Policies for Correct Role Names
-- Date: 2026-02-04
-- Description: Update all RLS policies to use correct role names (CEO, LRC_MANAGER)
-- ============================================================================

-- Drop all existing policies (including any that might exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Anyone can view active competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can view all competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Anyone can view active questions" ON questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Anyone can create submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON submissions;
DROP POLICY IF EXISTS "Anyone can read attempt tracking" ON attempt_tracking;
DROP POLICY IF EXISTS "Anyone can insert attempt tracking" ON attempt_tracking;
DROP POLICY IF EXISTS "Anyone can update attempt tracking" ON attempt_tracking;
DROP POLICY IF EXISTS "Admins can delete attempt tracking" ON attempt_tracking;
DROP POLICY IF EXISTS "Anyone can view published wheel runs" ON wheel_runs;
DROP POLICY IF EXISTS "Admins can view all wheel runs" ON wheel_runs;
DROP POLICY IF EXISTS "Admins can manage wheel runs" ON wheel_runs;
DROP POLICY IF EXISTS "Anyone can view wheel spins" ON wheel_spins;
DROP POLICY IF EXISTS "Admins can manage wheel spins" ON wheel_spins;
DROP POLICY IF EXISTS "Anyone can view active prizes" ON wheel_prizes;
DROP POLICY IF EXISTS "Admins can view all prizes" ON wheel_prizes;
DROP POLICY IF EXISTS "Admins can manage prizes" ON wheel_prizes;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_id = auth.uid() 
            AND u.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- COMPETITIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view active competitions" ON competitions
    FOR SELECT USING (status IN ('active', 'published'));

CREATE POLICY "Admins can view all competitions" ON competitions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage competitions" ON competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- QUESTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view active questions" ON questions
    FOR SELECT USING (
        is_active = true 
        AND (
            is_training = true 
            OR EXISTS (
                SELECT 1 FROM competitions 
                WHERE competitions.id = questions.competition_id 
                AND competitions.status = 'active'
            )
        )
    );

CREATE POLICY "Admins can view all questions" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- SUBMISSIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Anyone can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (
        participant_email = (
            SELECT email FROM users WHERE auth_id = auth.uid()
        )
        OR participant_name = (
            SELECT username FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can delete submissions" ON submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- ATTEMPT TRACKING POLICIES
-- ============================================================================

CREATE POLICY "Anyone can read attempt tracking" ON attempt_tracking
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert attempt tracking" ON attempt_tracking
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update attempt tracking" ON attempt_tracking
    FOR UPDATE USING (true);

CREATE POLICY "Admins can delete attempt tracking" ON attempt_tracking
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- WHEEL RUNS POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view published wheel runs" ON wheel_runs
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all wheel runs" ON wheel_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage wheel runs" ON wheel_runs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- WHEEL SPINS POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view wheel spins" ON wheel_spins
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage wheel spins" ON wheel_spins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- WHEEL PRIZES POLICIES
-- ============================================================================

CREATE POLICY "Anyone can view active prizes" ON wheel_prizes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all prizes" ON wheel_prizes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage prizes" ON wheel_prizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================================

CREATE POLICY "Admins can view system settings" ON system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test admin access (run as authenticated user with CEO or LRC_MANAGER role)
-- SELECT * FROM competitions; -- Should work for admins
-- SELECT * FROM submissions; -- Should work for admins
-- SELECT * FROM audit_logs; -- Should work for admins

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Run this migration on your Supabase instance via SQL Editor
-- 2. Test with different user roles to verify policies work correctly
-- 3. Monitor logs for any RLS policy violations
-- 4. Adjust policies based on your specific security requirements
-- ============================================================================
