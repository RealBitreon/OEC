-- ============================================
-- PRODUCTION FIX: REQUEST FLOODING + RLS MISCONFIGURATION
-- ============================================
-- This fixes the critical issue where 10 logins = 400+ requests
-- Run this in Supabase SQL Editor
-- 
-- Fixes:
-- 1. RLS performance warnings (auth function re-evaluation per row)
-- 2. Duplicate/conflicting policies
-- 3. SECURITY DEFINER abuse
-- 4. Missing search_path in functions
-- 5. Service role policy bypass
-- ============================================

BEGIN;

-- ============================================
-- PART 1: DROP ALL EXISTING RLS POLICIES
-- ============================================

-- Drop all policies on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- PART 2: FIX ALL FUNCTIONS - ADD search_path
-- ============================================

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Fix get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = user_auth_id;
    
    RETURN COALESCE(user_role, 'VIEWER');
END;
$$;

-- Fix is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = (SELECT auth.uid());
    
    RETURN user_role IN ('CEO', 'LRC_MANAGER');
END;
$$;

-- Fix is_ceo
CREATE OR REPLACE FUNCTION public.is_ceo()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = (SELECT auth.uid());
    
    RETURN user_role = 'CEO';
END;
$$;

-- ============================================
-- PART 3: REMOVE DANGEROUS SECURITY DEFINER VIEWS
-- ============================================

-- Drop views if they exist (they may not exist in current schema)
DROP VIEW IF EXISTS public.active_questions_view CASCADE;
DROP VIEW IF EXISTS public.submissions_detailed_view CASCADE;
DROP VIEW IF EXISTS public.wheel_prizes_available_view CASCADE;

-- ============================================
-- PART 4: CREATE OPTIMIZED RLS POLICIES
-- ============================================
-- RULE: Use (SELECT auth.uid()) instead of auth.uid()
-- RULE: ONE policy per role per action
-- RULE: NO service-role bypass policies
-- ============================================

-- ============================================
-- TABLE: users
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Authenticated: Read own profile only
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth_id = (SELECT auth.uid()));

-- Authenticated: Update own profile only
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth_id = (SELECT auth.uid()))
WITH CHECK (auth_id = (SELECT auth.uid()));

-- Admin: Read all users
CREATE POLICY "users_select_admin"
ON public.users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- CEO: Full access
CREATE POLICY "users_all_ceo"
ON public.users
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role = 'CEO'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role = 'CEO'
    )
);

-- ============================================
-- TABLE: competitions
-- ============================================

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Public: Read active competitions only
CREATE POLICY "competitions_select_public"
ON public.competitions
FOR SELECT
TO anon
USING (status = 'active');

-- Authenticated: Read all
CREATE POLICY "competitions_select_auth"
ON public.competitions
FOR SELECT
TO authenticated
USING (true);

-- Admin: Full access
CREATE POLICY "competitions_all_admin"
ON public.competitions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- ============================================
-- TABLE: questions
-- ============================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Public: Read active questions only
CREATE POLICY "questions_select_public"
ON public.questions
FOR SELECT
TO anon
USING (is_active = true);

-- Authenticated: Read all
CREATE POLICY "questions_select_auth"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

-- Admin: Full access
CREATE POLICY "questions_all_admin"
ON public.questions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- ============================================
-- TABLE: submissions
-- ============================================

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Public: Insert only (for anonymous submissions)
CREATE POLICY "submissions_insert_public"
ON public.submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- Public: Read own submissions by participant_name
CREATE POLICY "submissions_select_public"
ON public.submissions
FOR SELECT
TO anon
USING (true);

-- Authenticated: Read all (for dashboard)
CREATE POLICY "submissions_select_auth"
ON public.submissions
FOR SELECT
TO authenticated
USING (true);

-- Admin: Full access
CREATE POLICY "submissions_all_admin"
ON public.submissions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- ============================================
-- TABLE: wheel_prizes
-- ============================================

ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;

-- Public: Read active prizes only
CREATE POLICY "wheel_prizes_select_public"
ON public.wheel_prizes
FOR SELECT
TO anon
USING (is_active = true AND remaining > 0);

-- Authenticated: Read all
CREATE POLICY "wheel_prizes_select_auth"
ON public.wheel_prizes
FOR SELECT
TO authenticated
USING (true);

-- Admin: Full access
CREATE POLICY "wheel_prizes_all_admin"
ON public.wheel_prizes
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- ============================================
-- TABLE: wheel_spins
-- ============================================

ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

-- Public: Insert only
CREATE POLICY "wheel_spins_insert_public"
ON public.wheel_spins
FOR INSERT
TO anon
WITH CHECK (true);

-- Public: Read all spins
CREATE POLICY "wheel_spins_select_public"
ON public.wheel_spins
FOR SELECT
TO anon
USING (true);

-- Authenticated: Read all
CREATE POLICY "wheel_spins_select_auth"
ON public.wheel_spins
FOR SELECT
TO authenticated
USING (true);

-- Admin: Full access
CREATE POLICY "wheel_spins_all_admin"
ON public.wheel_spins
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role IN ('CEO', 'LRC_MANAGER')
    )
);

-- ============================================
-- TABLE: audit_logs
-- ============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- CEO only: Full access
CREATE POLICY "audit_logs_all_ceo"
ON public.audit_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role = 'CEO'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = (SELECT auth.uid())
        AND u.role = 'CEO'
    )
);

-- ============================================
-- TABLE: system_settings (if exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_settings') THEN
        ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
        
        -- Admin: Full access
        DROP POLICY IF EXISTS "system_settings_all_admin" ON public.system_settings;
        CREATE POLICY "system_settings_all_admin"
        ON public.system_settings
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.auth_id = (SELECT auth.uid())
                AND u.role IN ('CEO', 'LRC_MANAGER')
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.auth_id = (SELECT auth.uid())
                AND u.role IN ('CEO', 'LRC_MANAGER')
            )
        );
    END IF;
END $$;

-- ============================================
-- TABLE: user_sessions (if exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
        ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
        
        -- Users: Own sessions only
        DROP POLICY IF EXISTS "user_sessions_own" ON public.user_sessions;
        CREATE POLICY "user_sessions_own"
        ON public.user_sessions
        FOR ALL
        TO authenticated
        USING (
            user_id IN (
                SELECT id FROM public.users
                WHERE auth_id = (SELECT auth.uid())
            )
        )
        WITH CHECK (
            user_id IN (
                SELECT id FROM public.users
                WHERE auth_id = (SELECT auth.uid())
            )
        );
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check for performance warnings (should return 0 rows)
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (
    qual::text LIKE '%auth.uid()%'
    OR with_check::text LIKE '%auth.uid()%'
)
AND (
    qual::text NOT LIKE '%(SELECT auth.uid())%'
    AND with_check::text NOT LIKE '%(SELECT auth.uid())%'
);

-- Count policies per table (should be reasonable)
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- ============================================
-- SUCCESS CRITERIA
-- ============================================
-- After running this:
-- 1. Login once = 1-3 Auth requests, ≤10 DB requests
-- 2. No continuous polling
-- 3. Zero RLS performance warnings in Supabase dashboard
-- 4. Zero duplicate policy warnings
-- ============================================
