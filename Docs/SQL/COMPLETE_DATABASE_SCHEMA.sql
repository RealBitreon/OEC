-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR OEC COMPETITION PLATFORM
-- This file contains the full database structure based on the current schema
-- Run this on a fresh Supabase instance to recreate the entire database
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
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

-- Create index on auth_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. USER SESSIONS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active);

-- ============================================================================
-- 3. COMPETITIONS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_competitions_slug ON competitions(slug);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_start_at ON competitions(start_at);
CREATE INDEX IF NOT EXISTS idx_competitions_end_at ON competitions(end_at);
CREATE INDEX IF NOT EXISTS idx_competitions_created_by ON competitions(created_by);

-- ============================================================================
-- 4. QUESTIONS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_questions_competition_id ON questions(competition_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_training ON questions(is_training);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);

-- ============================================================================
-- 5. SUBMISSIONS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_email ON submissions(participant_email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewed_by ON submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner ON submissions(is_winner);
CREATE INDEX IF NOT EXISTS idx_submissions_previous_submission_id ON submissions(previous_submission_id);

-- ============================================================================
-- 6. ATTEMPT TRACKING TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_attempt_tracking_competition_id ON attempt_tracking(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_device_fingerprint ON attempt_tracking(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_user_id ON attempt_tracking(user_id);

-- ============================================================================
-- 7. WHEEL RUNS TABLE
-- ============================================================================
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition_id ON wheel_runs(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_status ON wheel_runs(status);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_is_published ON wheel_runs(is_published);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_run_at ON wheel_runs(run_at);

-- ============================================================================
-- 8. WHEEL SPINS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_wheel_spins_competition_id ON wheel_spins(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_submission_id ON wheel_spins(submission_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_prize_id ON wheel_spins(prize_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_spun_at ON wheel_spins(spun_at);

-- ============================================================================
-- 9. WHEEL PRIZES TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_wheel_prizes_competition_id ON wheel_prizes(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_prizes_is_active ON wheel_prizes(is_active);

-- ============================================================================
-- 10. AUDIT LOGS TABLE
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 11. SYSTEM SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at (drop if exists first)
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
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

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Competitions policies (public read for active competitions)
DROP POLICY IF EXISTS "Anyone can view active competitions" ON competitions;
CREATE POLICY "Anyone can view active competitions" ON competitions
    FOR SELECT USING (status = 'active' OR status = 'published');

DROP POLICY IF EXISTS "Admins can manage competitions" ON competitions;
CREATE POLICY "Admins can manage competitions" ON competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Questions policies
DROP POLICY IF EXISTS "Anyone can view active questions" ON questions;
CREATE POLICY "Anyone can view active questions" ON questions
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Submissions policies
DROP POLICY IF EXISTS "Anyone can create submissions" ON submissions;
CREATE POLICY "Anyone can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (
        participant_email = (
            SELECT email FROM users WHERE auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Attempt tracking policies
DROP POLICY IF EXISTS "Anyone can read attempt tracking" ON attempt_tracking;
CREATE POLICY "Anyone can read attempt tracking" ON attempt_tracking
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert attempt tracking" ON attempt_tracking;
CREATE POLICY "Anyone can insert attempt tracking" ON attempt_tracking
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update attempt tracking" ON attempt_tracking;
CREATE POLICY "Anyone can update attempt tracking" ON attempt_tracking
    FOR UPDATE USING (true);

-- Wheel runs policies
DROP POLICY IF EXISTS "Anyone can view published wheel runs" ON wheel_runs;
CREATE POLICY "Anyone can view published wheel runs" ON wheel_runs
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage wheel runs" ON wheel_runs;
CREATE POLICY "Admins can manage wheel runs" ON wheel_runs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Wheel spins policies
DROP POLICY IF EXISTS "Anyone can view wheel spins" ON wheel_spins;
CREATE POLICY "Anyone can view wheel spins" ON wheel_spins
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage wheel spins" ON wheel_spins;
CREATE POLICY "Admins can manage wheel spins" ON wheel_spins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Wheel prizes policies
DROP POLICY IF EXISTS "Anyone can view active prizes" ON wheel_prizes;
CREATE POLICY "Anyone can view active prizes" ON wheel_prizes
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage prizes" ON wheel_prizes;
CREATE POLICY "Admins can manage prizes" ON wheel_prizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Audit logs policies (admin only)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- System settings policies (admin only)
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has remaining attempts
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
    -- Get max attempts for competition
    SELECT max_attempts INTO v_max_attempts
    FROM competitions
    WHERE id = p_competition_id;
    
    -- Get current attempt count
    SELECT COALESCE(attempt_count, 0) INTO v_current_attempts
    FROM attempt_tracking
    WHERE competition_id = p_competition_id
    AND device_fingerprint = p_device_fingerprint;
    
    -- Return remaining attempts
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
    -- Get submission answers
    SELECT answers INTO v_answers
    FROM submissions
    WHERE id = p_submission_id;
    
    -- Loop through answers and check correctness
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

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value) VALUES
    ('site_name', '{"ar": "منصة المسابقات", "en": "Competition Platform"}'),
    ('maintenance_mode', '{"enabled": false}'),
    ('registration_enabled', '{"enabled": true}'),
    ('max_file_size', '{"bytes": 5242880}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Make sure to set up Supabase Auth before running this script
-- 2. Update RLS policies based on your specific security requirements
-- 3. Adjust indexes based on your query patterns
-- 4. Consider adding additional constraints for data validation
-- 5. Set up storage buckets for file uploads (proofs, avatars, etc.)
-- 6. Configure email templates in Supabase Auth settings
-- 7. Set up proper backup and recovery procedures
-- ============================================================================
