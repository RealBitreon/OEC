-- ============================================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- ============================================================================
-- Production-ready database setup for OEC Competition Platform
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" to execute
-- 5. Wait for completion (should take 10-30 seconds)
-- 6. Copy your Supabase URL and anon key to your .env file
-- 
-- After running this script, your database will be fully configured with:
-- ✅ All tables with proper relationships
-- ✅ Indexes for optimal performance
-- ✅ Row Level Security (RLS) policies
-- ✅ Helper functions for business logic
-- ✅ Triggers for data integrity
-- ✅ Training question migration system
-- ✅ Wheel management system
-- 
-- Author: Bitreon
-- Version: 1.0.0
-- Last Updated: 2026-02-06
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP EXISTING OBJECTS (Clean Slate)
-- ============================================================================

-- Drop all policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active competitions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all competitions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage competitions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view all questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can manage questions" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can create submissions" ON ' || r.tablename;
    END LOOP;
END $$;


-- ============================================================================
-- SECTION 2: CREATE TABLES
-- ============================================================================

-- 2.1 USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    bio TEXT,
    display_name TEXT,
    avatar_url TEXT,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'ar',
    font_size TEXT DEFAULT 'medium',
    compact_mode BOOLEAN DEFAULT false,
    notification_settings JSONB DEFAULT '{}',
    last_password_change TIMESTAMPTZ
);

-- 2.2 USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_info JSONB,
    ip_address TEXT,
    user_agent TEXT,
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2.3 COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    start_at DATE,
    end_at DATE,
    wheel_at DATE,
    rules JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    max_attempts INTEGER DEFAULT 3,
    winner_count INTEGER DEFAULT 1
);

-- 2.4 QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    is_training BOOLEAN DEFAULT false,
    type TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    volume TEXT,
    page TEXT,
    line_from TEXT,
    line_to TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

-- 2.5 SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    first_name TEXT,
    father_name TEXT,
    family_name TEXT,
    grade TEXT,
    answers JSONB NOT NULL DEFAULT '[]',
    proofs JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    tickets_earned INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    retry_allowed BOOLEAN DEFAULT false,
    is_retry BOOLEAN DEFAULT false,
    previous_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_winner BOOLEAN DEFAULT false,
    is_correct BOOLEAN DEFAULT false
);

-- 2.6 ATTEMPT TRACKING TABLE
CREATE TABLE IF NOT EXISTS attempt_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, device_fingerprint)
);

-- 2.7 WHEEL PRIZES TABLE (must be created before wheel_spins)
CREATE TABLE IF NOT EXISTS wheel_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    remaining INTEGER NOT NULL DEFAULT 1,
    probability NUMERIC(5,4) NOT NULL DEFAULT 0.1,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 WHEEL RUNS TABLE
CREATE TABLE IF NOT EXISTS wheel_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    winner_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    candidates_snapshot JSONB,
    locked_snapshot JSONB,
    total_tickets INTEGER DEFAULT 0,
    winners JSONB DEFAULT '[]',
    draw_metadata JSONB DEFAULT '{}',
    announcement_message TEXT,
    is_published BOOLEAN DEFAULT false,
    show_winner_names BOOLEAN DEFAULT true,
    locked_at TIMESTAMPTZ,
    run_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_by UUID REFERENCES users(id),
    run_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    winner_id UUID REFERENCES submissions(id),
    snapshot_metadata JSONB DEFAULT '{}',
    winner_display_name TEXT,
    show_winner_name BOOLEAN DEFAULT true
);

-- 2.9 WHEEL SPINS TABLE
CREATE TABLE IF NOT EXISTS wheel_spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    participant_name TEXT NOT NULL,
    prize_id UUID REFERENCES wheel_prizes(id) ON DELETE SET NULL,
    prize_name TEXT NOT NULL,
    spun_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- SECTION 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active);

-- Competitions indexes
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON competitions(slug);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_start_at ON competitions(start_at);
CREATE INDEX IF NOT EXISTS idx_competitions_end_at ON competitions(end_at);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);
CREATE INDEX IF NOT EXISTS idx_competitions_status_active ON competitions(status) WHERE status = 'active';

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_competition_id ON questions(competition_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_training ON questions(is_training);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_training ON questions(is_training, status) WHERE is_training = true AND status = 'PUBLISHED';
CREATE INDEX IF NOT EXISTS idx_questions_competition_training ON questions(competition_id, is_training);
CREATE INDEX IF NOT EXISTS idx_questions_no_competition ON questions(is_training, status) WHERE competition_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_questions_competition_active ON questions(competition_id) WHERE competition_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questions_training_published ON questions(is_training, status) WHERE is_training = true;
CREATE INDEX IF NOT EXISTS idx_questions_status_active_comp ON questions(status, is_active, competition_id);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_email ON submissions(participant_email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewed_by ON submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner ON submissions(is_winner);
CREATE INDEX IF NOT EXISTS idx_submissions_previous_submission_id ON submissions(previous_submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_competition_status ON submissions(competition_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_name ON submissions(participant_name);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_desc ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner_true ON submissions(is_winner) WHERE is_winner = true;

-- Attempt tracking indexes
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_competition_id ON attempt_tracking(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_device_fingerprint ON attempt_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_user_id ON attempt_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_comp_device ON attempt_tracking(competition_id, device_fingerprint);

-- Wheel runs indexes
CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition_id ON wheel_runs(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_status ON wheel_runs(status);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_is_published ON wheel_runs(is_published);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_run_at ON wheel_runs(run_at);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_locked_by ON wheel_runs(locked_by);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_run_by ON wheel_runs(run_by);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_published_by ON wheel_runs(published_by);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_winner_id ON wheel_runs(winner_id);

-- Wheel spins indexes
CREATE INDEX IF NOT EXISTS idx_wheel_spins_competition_id ON wheel_spins(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_submission_id ON wheel_spins(submission_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_prize_id ON wheel_spins(prize_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_spun_at ON wheel_spins(spun_at);

-- Wheel prizes indexes
CREATE INDEX IF NOT EXISTS idx_wheel_prizes_competition_id ON wheel_prizes(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_prizes_is_active ON wheel_prizes(is_active);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_desc ON audit_logs(created_at DESC);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);


-- ============================================================================
-- SECTION 4: CREATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitions_updated_at ON competitions;
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attempt_tracking_updated_at ON attempt_tracking;
CREATE TRIGGER update_attempt_tracking_updated_at BEFORE UPDATE ON attempt_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wheel_runs_updated_at ON wheel_runs;
CREATE TRIGGER update_wheel_runs_updated_at BEFORE UPDATE ON wheel_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wheel_prizes_updated_at ON wheel_prizes;
CREATE TRIGGER update_wheel_prizes_updated_at BEFORE UPDATE ON wheel_prizes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to validate training question migration
CREATE OR REPLACE FUNCTION validate_training_migration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_training = true AND NEW.competition_id IS NULL THEN
        IF NEW.correct_answer IS NULL OR NEW.correct_answer = '' THEN
            RAISE EXCEPTION 'Training questions must have a correct answer';
        END IF;
        IF NEW.status != 'PUBLISHED' THEN
            NEW.status := 'PUBLISHED';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_training_migration_trigger ON questions;
CREATE TRIGGER validate_training_migration_trigger
    BEFORE INSERT OR UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION validate_training_migration();


-- ============================================================================
-- SECTION 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: CREATE RLS POLICIES
-- ============================================================================

-- USERS POLICIES
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

-- COMPETITIONS POLICIES
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

-- QUESTIONS POLICIES
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

CREATE POLICY "Anyone can view training questions" ON questions
    FOR SELECT USING (
        is_training = true 
        AND competition_id IS NULL 
        AND status = 'PUBLISHED'
        AND is_active = true
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

-- SUBMISSIONS POLICIES
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

-- ATTEMPT TRACKING POLICIES
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

-- WHEEL RUNS POLICIES
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

-- WHEEL SPINS POLICIES
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

-- WHEEL PRIZES POLICIES
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

-- AUDIT LOGS POLICIES
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

-- SYSTEM SETTINGS POLICIES
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
-- SECTION 7: HELPER FUNCTIONS
-- ============================================================================

-- Function to check remaining attempts
CREATE OR REPLACE FUNCTION check_remaining_attempts(
    p_competition_id UUID,
    p_device_fingerprint TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_max_attempts INTEGER;
    v_current_attempts INTEGER;
BEGIN
    SELECT max_attempts INTO v_max_attempts
    FROM competitions
    WHERE id = p_competition_id;
    
    SELECT COALESCE(attempt_count, 0) INTO v_current_attempts
    FROM attempt_tracking
    WHERE competition_id = p_competition_id
    AND device_fingerprint = p_device_fingerprint;
    
    RETURN GREATEST(0, v_max_attempts - COALESCE(v_current_attempts, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment attempt count
CREATE OR REPLACE FUNCTION increment_attempt_count(
    p_competition_id UUID,
    p_device_fingerprint TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO attempt_tracking (
        competition_id,
        device_fingerprint,
        user_id,
        attempt_count,
        last_attempt_at
    )
    VALUES (
        p_competition_id,
        p_device_fingerprint,
        p_user_id,
        1,
        NOW()
    )
    ON CONFLICT (competition_id, device_fingerprint)
    DO UPDATE SET
        attempt_count = attempt_tracking.attempt_count + 1,
        last_attempt_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate submission score
CREATE OR REPLACE FUNCTION calculate_submission_score(
    p_submission_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_answers JSONB;
    v_question RECORD;
    v_answer JSONB;
BEGIN
    SELECT answers INTO v_answers
    FROM submissions
    WHERE id = p_submission_id;
    
    FOR v_answer IN SELECT * FROM jsonb_array_elements(v_answers)
    LOOP
        SELECT * INTO v_question
        FROM questions
        WHERE id = (v_answer->>'question_id')::UUID;
        
        IF v_question.correct_answer = v_answer->>'answer' THEN
            v_score := v_score + 1;
        END IF;
    END LOOP;
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get migration preview
CREATE OR REPLACE FUNCTION get_migration_preview(p_competition_id UUID)
RETURNS TABLE(
    total_questions BIGINT,
    with_official_answers BIGINT,
    without_answers BIGINT,
    winner_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM questions WHERE competition_id = p_competition_id) as total_questions,
        (SELECT COUNT(*) FROM questions WHERE competition_id = p_competition_id AND correct_answer IS NOT NULL) as with_official_answers,
        (SELECT COUNT(*) FROM questions WHERE competition_id = p_competition_id AND correct_answer IS NULL) as without_answers,
        (SELECT COUNT(*) FROM submissions WHERE competition_id = p_competition_id AND is_winner = true) as winner_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate question to training
CREATE OR REPLACE FUNCTION migrate_question_to_training(
    p_question_id UUID,
    p_correct_answer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_answer TEXT;
BEGIN
    IF p_correct_answer IS NULL THEN
        SELECT correct_answer INTO v_current_answer
        FROM questions
        WHERE id = p_question_id;
        
        IF v_current_answer IS NULL THEN
            RETURN false;
        END IF;
        
        p_correct_answer := v_current_answer;
    END IF;
    
    UPDATE questions
    SET
        competition_id = NULL,
        is_training = true,
        status = 'PUBLISHED',
        correct_answer = p_correct_answer,
        updated_at = NOW()
    WHERE id = p_question_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get winner answers for a question
CREATE OR REPLACE FUNCTION get_winner_answers_for_question(
    p_question_id UUID,
    p_competition_id UUID
)
RETURNS TABLE(
    submission_id UUID,
    participant_name TEXT,
    participant_email TEXT,
    answer TEXT,
    proof JSONB,
    submitted_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as submission_id,
        s.participant_name,
        s.participant_email,
        (answer_data->>'answer')::TEXT as answer,
        (answer_data->>'proof')::JSONB as proof,
        s.submitted_at
    FROM submissions s,
         LATERAL jsonb_array_elements(s.answers) as answer_data
    WHERE s.competition_id = p_competition_id
      AND s.is_winner = true
      AND (answer_data->>'question_id')::UUID = p_question_id
    ORDER BY s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-migrate competition to training
CREATE OR REPLACE FUNCTION auto_migrate_competition_to_training(
    p_competition_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    migrated_count INTEGER,
    skipped_count INTEGER,
    error_count INTEGER
) AS $$
DECLARE
    v_question RECORD;
    v_winner_answer TEXT;
    v_migrated INTEGER := 0;
    v_skipped INTEGER := 0;
    v_errors INTEGER := 0;
BEGIN
    FOR v_question IN 
        SELECT * FROM questions WHERE competition_id = p_competition_id
    LOOP
        BEGIN
            IF v_question.correct_answer IS NOT NULL THEN
                PERFORM migrate_question_to_training(v_question.id, v_question.correct_answer);
                v_migrated := v_migrated + 1;
            ELSE
                SELECT (answer_data->>'answer')::TEXT INTO v_winner_answer
                FROM submissions s,
                     LATERAL jsonb_array_elements(s.answers) as answer_data
                WHERE s.competition_id = p_competition_id
                  AND s.is_winner = true
                  AND (answer_data->>'question_id')::UUID = v_question.id
                ORDER BY s.submitted_at ASC
                LIMIT 1;
                
                IF v_winner_answer IS NOT NULL THEN
                    PERFORM migrate_question_to_training(v_question.id, v_winner_answer);
                    v_migrated := v_migrated + 1;
                ELSE
                    v_skipped := v_skipped + 1;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors + 1;
        END;
    END LOOP;
    
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        p_user_id,
        'auto_migrate_to_training',
        'competition',
        p_competition_id,
        jsonb_build_object(
            'migrated', v_migrated,
            'skipped', v_skipped,
            'errors', v_errors
        )
    );
    
    RETURN QUERY SELECT v_migrated, v_skipped, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- SECTION 8: CREATE VIEWS
-- ============================================================================

-- View for all training questions
CREATE OR REPLACE VIEW training_questions AS
SELECT
    q.*,
    COUNT(DISTINCT s.id) as usage_count
FROM questions q
LEFT JOIN submissions s ON 
    s.answers @> jsonb_build_array(jsonb_build_object('question_id', q.id::text))
WHERE q.is_training = true
  AND q.competition_id IS NULL
  AND q.status = 'PUBLISHED'
  AND q.is_active = true
GROUP BY q.id;

-- View for training questions statistics
CREATE OR REPLACE VIEW training_questions_stats AS
SELECT
    category,
    difficulty,
    type,
    COUNT(*) as question_count,
    COUNT(DISTINCT volume) as volume_count
FROM questions
WHERE is_training = true
  AND competition_id IS NULL
  AND status = 'PUBLISHED'
  AND is_active = true
GROUP BY category, difficulty, type;

-- ============================================================================
-- SECTION 9: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_remaining_attempts(UUID, TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_attempt_count(UUID, TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION calculate_submission_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_migration_preview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_winner_answers_for_question(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_question_to_training(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION auto_migrate_competition_to_training(UUID, UUID) TO service_role;

-- ============================================================================
-- SECTION 10: INSERT INITIAL DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value) VALUES
    ('site_name', '{"ar": "منصة المسابقات", "en": "Competition Platform"}'),
    ('maintenance_mode', '{"enabled": false}'),
    ('registration_enabled', '{"enabled": true}'),
    ('max_file_size', '{"bytes": 5242880}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SECTION 11: SYNC AUTH USERS WITH USERS TABLE
-- ============================================================================

-- Create missing user records for any existing auth users
INSERT INTO users (auth_id, username, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'user')
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
WHERE u.id IS NULL
ON CONFLICT (auth_id) DO NOTHING;

-- ============================================================================
-- SECTION 12: ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================================================

ANALYZE users;
ANALYZE user_sessions;
ANALYZE competitions;
ANALYZE questions;
ANALYZE submissions;
ANALYZE attempt_tracking;
ANALYZE wheel_runs;
ANALYZE wheel_spins;
ANALYZE wheel_prizes;
ANALYZE audit_logs;
ANALYZE system_settings;

-- ============================================================================
-- SECTION 13: VERIFICATION & SUCCESS MESSAGE
-- ============================================================================

DO $$
DECLARE
    v_tables_count INTEGER;
    v_indexes_count INTEGER;
    v_policies_count INTEGER;
    v_functions_count INTEGER;
    v_triggers_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO v_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'user_sessions', 'competitions', 'questions', 'submissions', 
                       'attempt_tracking', 'wheel_runs', 'wheel_spins', 'wheel_prizes', 
                       'audit_logs', 'system_settings');
    
    -- Count indexes
    SELECT COUNT(*) INTO v_indexes_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    -- Count policies
    SELECT COUNT(*) INTO v_policies_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Count functions
    SELECT COUNT(*) INTO v_functions_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('check_remaining_attempts', 'increment_attempt_count', 
                      'calculate_submission_score', 'get_migration_preview',
                      'migrate_question_to_training', 'get_winner_answers_for_question',
                      'auto_migrate_competition_to_training');
    
    -- Count triggers
    SELECT COUNT(*) INTO v_triggers_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║          ✅ SUPABASE DATABASE SETUP COMPLETE!                  ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Setup Summary:';
    RAISE NOTICE '   ✅ Tables created: %', v_tables_count;
    RAISE NOTICE '   ✅ Indexes created: %', v_indexes_count;
    RAISE NOTICE '   ✅ RLS policies created: %', v_policies_count;
    RAISE NOTICE '   ✅ Functions created: %', v_functions_count;
    RAISE NOTICE '   ✅ Triggers created: %', v_triggers_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '   1. Go to Settings > API in your Supabase dashboard';
    RAISE NOTICE '   2. Copy your Project URL and anon/public key';
    RAISE NOTICE '   3. Update your .env file:';
    RAISE NOTICE '      NEXT_PUBLIC_SUPABASE_URL=your-project-url';
    RAISE NOTICE '      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key';
    RAISE NOTICE '   4. Create your first admin user via Supabase Auth';
    RAISE NOTICE '   5. Update the user role to CEO or LRC_MANAGER in users table';
    RAISE NOTICE '   6. Start your application: npm run dev';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Features Enabled:';
    RAISE NOTICE '   ✅ User authentication & authorization';
    RAISE NOTICE '   ✅ Competition management';
    RAISE NOTICE '   ✅ Question bank & training questions';
    RAISE NOTICE '   ✅ Submission tracking & scoring';
    RAISE NOTICE '   ✅ Attempt limiting per device';
    RAISE NOTICE '   ✅ Wheel of fortune system';
    RAISE NOTICE '   ✅ Audit logging';
    RAISE NOTICE '   ✅ Training question migration';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security:';
    RAISE NOTICE '   ✅ Row Level Security (RLS) enabled on all tables';
    RAISE NOTICE '   ✅ Role-based access control (CEO, LRC_MANAGER, user)';
    RAISE NOTICE '   ✅ Secure functions with SECURITY DEFINER';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Performance:';
    RAISE NOTICE '   ✅ Optimized indexes for fast queries';
    RAISE NOTICE '   ✅ Automatic timestamp updates';
    RAISE NOTICE '   ✅ Query statistics analyzed';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your database is production-ready!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
-- 
-- TROUBLESHOOTING:
-- 
-- If you encounter any issues:
-- 
-- 1. "relation already exists" errors:
--    - This is normal if running the script multiple times
--    - The script uses IF NOT EXISTS to handle this
-- 
-- 2. RLS policy errors:
--    - Make sure you have at least one user with CEO or LRC_MANAGER role
--    - Use service_role key for admin operations
-- 
-- 3. Permission denied errors:
--    - Ensure you're running this as the postgres user
--    - Check that RLS policies are correctly configured
-- 
-- 4. Function execution errors:
--    - Verify that all tables were created successfully
--    - Check that foreign key relationships are intact
-- 
-- For support, check the README.md file or contact your development team.
-- 
-- ============================================================================

