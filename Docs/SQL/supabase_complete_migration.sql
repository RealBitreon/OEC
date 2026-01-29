-- ============================================================================
-- COMPLETE SUPABASE MIGRATION SCRIPT
-- Converts all JSON data to Supabase PostgreSQL
-- ============================================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS wheel_spins CASCADE;
DROP TABLE IF EXISTS wheel_prizes CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashed password
    role TEXT NOT NULL CHECK (role IN ('CEO', 'LRC_MANAGER', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. SESSIONS TABLE
-- ============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- 3. COMPETITIONS TABLE
-- ============================================================================
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    start_at DATE NOT NULL,
    end_at DATE NOT NULL,
    wheel_at DATE,
    rules JSONB NOT NULL DEFAULT '{
        "eligibilityMode": "all_correct",
        "minCorrectAnswers": 0,
        "ticketsPerCorrect": 1,
        "earlyBonusTiers": []
    }'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_at >= start_at),
    CONSTRAINT valid_wheel_date CHECK (wheel_at IS NULL OR wheel_at >= end_at)
);

-- Create indexes
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_slug ON competitions(slug);
CREATE INDEX idx_competitions_dates ON competitions(start_at, end_at);
CREATE INDEX idx_competitions_created_by ON competitions(created_by);

-- ============================================================================
-- 4. QUESTIONS TABLE
-- ============================================================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    is_training BOOLEAN DEFAULT false,
    type TEXT NOT NULL DEFAULT 'mcq' CHECK (type IN ('mcq', 'true_false', 'short_answer')),
    question_text TEXT NOT NULL,
    options JSONB, -- Array of options for MCQ
    correct_answer TEXT NOT NULL,
    volume TEXT,
    page TEXT,
    line_from TEXT,
    line_to TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_questions_competition_id ON questions(competition_id);
CREATE INDEX idx_questions_is_training ON questions(is_training);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_questions_type ON questions(type);

-- ============================================================================
-- 5. SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    
    -- Participant Information
    participant_name TEXT NOT NULL,
    participant_email TEXT,
    first_name TEXT,
    father_name TEXT,
    family_name TEXT,
    grade TEXT,
    
    -- Submission Data
    answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- {question_id: answer}
    proofs JSONB DEFAULT '{}'::jsonb, -- {question_id: proof_text}
    
    -- Scoring
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    tickets_earned INTEGER DEFAULT 0,
    
    -- Status & Metadata
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    
    -- Retry Logic
    retry_allowed BOOLEAN DEFAULT false,
    is_retry BOOLEAN DEFAULT false,
    previous_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_submissions_participant_name ON submissions(participant_name);
CREATE INDEX idx_submissions_reviewed_by ON submissions(reviewed_by);
CREATE INDEX idx_submissions_is_retry ON submissions(is_retry);

-- ============================================================================
-- 6. WHEEL PRIZES TABLE
-- ============================================================================
CREATE TABLE wheel_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    remaining INTEGER NOT NULL DEFAULT 1,
    probability DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- Percentage (0-100)
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_remaining CHECK (remaining >= 0 AND remaining <= quantity),
    CONSTRAINT valid_probability CHECK (probability >= 0 AND probability <= 100)
);

-- Create indexes
CREATE INDEX idx_wheel_prizes_competition_id ON wheel_prizes(competition_id);
CREATE INDEX idx_wheel_prizes_is_active ON wheel_prizes(is_active);

-- ============================================================================
-- 7. WHEEL SPINS TABLE
-- ============================================================================
CREATE TABLE wheel_spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    participant_name TEXT NOT NULL,
    prize_id UUID REFERENCES wheel_prizes(id) ON DELETE SET NULL,
    prize_name TEXT NOT NULL,
    spun_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wheel_spins_competition_id ON wheel_spins(competition_id);
CREATE INDEX idx_wheel_spins_submission_id ON wheel_spins(submission_id);
CREATE INDEX idx_wheel_spins_prize_id ON wheel_spins(prize_id);
CREATE INDEX idx_wheel_spins_spun_at ON wheel_spins(spun_at);

-- ============================================================================
-- 8. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'user', 'competition', 'question', 'submission', etc.
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wheel_prizes_updated_at BEFORE UPDATE ON wheel_prizes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only CEO can insert users" ON users FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);
CREATE POLICY "Only CEO can update users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);
CREATE POLICY "Only CEO can delete users" ON users FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own sessions" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own sessions" ON sessions FOR DELETE USING (user_id = auth.uid());

-- Competitions policies
CREATE POLICY "Anyone can view active competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "CEO and LRC_MANAGER can insert competitions" ON competitions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);
CREATE POLICY "CEO and LRC_MANAGER can update competitions" ON competitions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);
CREATE POLICY "Only CEO can delete competitions" ON competitions FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);

-- Questions policies
CREATE POLICY "Anyone can view active questions" ON questions FOR SELECT USING (true);
CREATE POLICY "CEO and LRC_MANAGER can insert questions" ON questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);
CREATE POLICY "CEO and LRC_MANAGER can update questions" ON questions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);
CREATE POLICY "CEO and LRC_MANAGER can delete questions" ON questions FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);

-- Submissions policies
CREATE POLICY "Anyone can view submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "CEO and LRC_MANAGER can update submissions" ON submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);
CREATE POLICY "Only CEO can delete submissions" ON submissions FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);

-- Wheel prizes policies
CREATE POLICY "Anyone can view wheel prizes" ON wheel_prizes FOR SELECT USING (true);
CREATE POLICY "CEO and LRC_MANAGER can manage wheel prizes" ON wheel_prizes FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);

-- Wheel spins policies
CREATE POLICY "Anyone can view wheel spins" ON wheel_spins FOR SELECT USING (true);
CREATE POLICY "CEO and LRC_MANAGER can manage wheel spins" ON wheel_spins FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('CEO', 'LRC_MANAGER'))
);

-- Audit logs policies
CREATE POLICY "Only CEO can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'CEO')
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================================
-- MIGRATE DATA FROM JSON FILES
-- ============================================================================

-- Insert Users
INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES
('82dabf49-7aa0-4ebe-8808-2c013b135c96', 'Youssef', '738e200cf1865d1ac055569294eeb37a2871f2763f402b771ef3cc559563d770', 'CEO', '2026-01-28T11:32:51.368Z', NOW()),
('c33008a2-1c03-482b-961a-b8c65e3137e3', 'youssefyoussef', '0f2d4ea3decaaddc7126d79281f4f36b3b6402dde7c361901ff4eaf352584990', 'CEO', '2026-01-28T11:33:15.993Z', NOW()),
('b39f8e4c-9228-4e0c-9d9c-c542c835b7a7', 'مصادر التعلم', '738e200cf1865d1ac055569294eeb37a2871f2763f402b771ef3cc559563d770', 'LRC_MANAGER', '2026-01-28T13:19:21.904Z', NOW());

-- Insert Sessions
INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES
('2b9a2745-055c-438d-af94-0cfea7ad0483', 'b39f8e4c-9228-4e0c-9d9c-c542c835b7a7', '2026-02-04T15:43:03.600Z', NOW());

-- Insert Competitions
INSERT INTO competitions (id, title, slug, description, status, start_at, end_at, wheel_at, rules, created_by, created_at, updated_at) VALUES
('897f09f1-b865-4ae5-994e-aa326f522f7a', 'DGV', 'dgv', 'DF', 'active', '2026-01-28', '2026-01-29', '2026-03-06', 
'{"eligibilityMode": "all_correct", "minCorrectAnswers": 5, "ticketsPerCorrect": 1, "earlyBonusTiers": []}'::jsonb,
'c33008a2-1c03-482b-961a-b8c65e3137e3', '2026-01-28T11:44:06.956Z', NOW());

-- Insert Questions
INSERT INTO questions (id, competition_id, is_training, type, question_text, options, correct_answer, volume, page, line_from, line_to, is_active, created_at, updated_at) VALUES
('eeb52161-0174-4e8d-a337-3b928b6deb30', '897f09f1-b865-4ae5-994e-aa326f522f7a', false, 'mcq', 'ما هي عاصمة سلطنة عمان؟', 
'["مسقط", "صلالة", "نزوى", "صحار"]'::jsonb, 'مسقط', '1', '1', '1', '1', false, '2026-01-28T15:57:54.926Z', '2026-01-28T15:58:03.292Z'),

('afb7bf5c-3796-4d93-a2e4-29fe748e0727', '897f09f1-b865-4ae5-994e-aa326f522f7a', false, 'mcq', 'ما هي عاصمة سلطنة عمان؟',
'["مسقط", "صلالة", "نزوى", "صحار"]'::jsonb, 'مسقط', '1', '1', '1', '1', false, '2026-01-28T15:57:59.998Z', '2026-01-28T16:07:16.506Z'),

('1954847f-406e-4f61-8023-2091b85303db', '897f09f1-b865-4ae5-994e-aa326f522f7a', false, 'mcq', 'في أي عام تم توحيد عمان الحديثة؟',
'["1970", "1971", "1980", "1990"]'::jsonb, '1970', '1', '1', '1', '1', false, '2026-01-28T16:07:08.551Z', '2026-01-28T16:07:17.989Z'),

('27a4cdf4-7c79-4881-81bc-101d78042842', NULL, false, 'mcq', 'ما هي عاصمة سلطنة عمان؟',
'["مسقط", "صلالة", "نزوى", "صحار"]'::jsonb, 'مسقط', '1', '1', '1', '1', false, '2026-01-28T16:07:48.439Z', '2026-01-28T16:08:08.683Z'),

('4c1c8fb9-dced-4d2d-99ea-0df8023ad85f', '897f09f1-b865-4ae5-994e-aa326f522f7a', false, 'mcq', 'ما هي عاصمة سلطنة عمان؟',
'["مسقط", "صلالة", "نزوى", "صحار"]'::jsonb, 'مسقط', '1', '1', '1', '1', true, '2026-01-28T16:08:16.805Z', '2026-01-28T16:08:16.805Z');

-- Insert Submissions
INSERT INTO submissions (id, competition_id, participant_name, participant_email, first_name, father_name, family_name, grade, answers, proofs, score, total_questions, tickets_earned, status, submitted_at, retry_allowed, is_retry, previous_submission_id) VALUES
('654979f5-52ae-4358-8d0d-dd8f5bb0fce0', '897f09f1-b865-4ae5-994e-aa326f522f7a', 'محمد محمد صبح', NULL, NULL, NULL, NULL, NULL,
'{"afb7bf5c-3796-4d93-a2e4-29fe748e0727": "مسقط"}'::jsonb, '{}'::jsonb, 1, 1, 0, 'pending', '2026-01-28T16:00:54.215Z', false, false, NULL),

('61637e7b-ca78-4946-8ba6-08332b188fe6', '897f09f1-b865-4ae5-994e-aa326f522f7a', '876', NULL, NULL, NULL, NULL, NULL,
'{"4c1c8fb9-dced-4d2d-99ea-0df8023ad85f": "مسقط"}'::jsonb, '{}'::jsonb, 1, 1, 0, 'pending', '2026-01-28T16:08:26.406Z', false, false, NULL),

('d1d3d433-a3f4-45ae-bd3f-8b3383baf82d', '897f09f1-b865-4ae5-994e-aa326f522f7a', 'احمد محمد صبح', NULL, 'احمد', 'محمد', 'صبح', '10',
'{"4c1c8fb9-dced-4d2d-99ea-0df8023ad85f": "مسقط"}'::jsonb, '{"4c1c8fb9-dced-4d2d-99ea-0df8023ad85f": "ثص"}'::jsonb, 1, 1, 1, 'pending', '2026-01-28T16:31:31.794Z', false, false, NULL);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get active competition
CREATE OR REPLACE FUNCTION get_active_competition()
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    status TEXT,
    start_at DATE,
    end_at DATE,
    wheel_at DATE,
    rules JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.* FROM competitions c
    WHERE c.status = 'active'
    AND c.start_at <= CURRENT_DATE
    AND c.end_at >= CURRENT_DATE
    ORDER BY c.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate submission score
CREATE OR REPLACE FUNCTION calculate_submission_score(
    p_competition_id UUID,
    p_answers JSONB
)
RETURNS TABLE (
    score INTEGER,
    total_questions INTEGER,
    tickets_earned INTEGER
) AS $$
DECLARE
    v_score INTEGER := 0;
    v_total INTEGER := 0;
    v_tickets INTEGER := 0;
    v_rules JSONB;
    v_question RECORD;
BEGIN
    -- Get competition rules
    SELECT c.rules INTO v_rules
    FROM competitions c
    WHERE c.id = p_competition_id;
    
    -- Calculate score
    FOR v_question IN 
        SELECT q.id, q.correct_answer
        FROM questions q
        WHERE q.competition_id = p_competition_id
        AND q.is_active = true
    LOOP
        v_total := v_total + 1;
        
        IF p_answers ? v_question.id::text THEN
            IF p_answers->>v_question.id::text = v_question.correct_answer THEN
                v_score := v_score + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Calculate tickets based on rules
    IF v_rules->>'eligibilityMode' = 'all_correct' THEN
        IF v_score = v_total THEN
            v_tickets := (v_rules->>'ticketsPerCorrect')::INTEGER * v_score;
        END IF;
    ELSIF v_rules->>'eligibilityMode' = 'min_correct' THEN
        IF v_score >= (v_rules->>'minCorrectAnswers')::INTEGER THEN
            v_tickets := (v_rules->>'ticketsPerCorrect')::INTEGER * v_score;
        END IF;
    ELSE
        v_tickets := (v_rules->>'ticketsPerCorrect')::INTEGER * v_score;
    END IF;
    
    RETURN QUERY SELECT v_score, v_total, v_tickets;
END;
$$ LANGUAGE plpgsql;

-- Function to get competition statistics
CREATE OR REPLACE FUNCTION get_competition_stats(p_competition_id UUID)
RETURNS TABLE (
    total_submissions BIGINT,
    pending_submissions BIGINT,
    approved_submissions BIGINT,
    rejected_submissions BIGINT,
    total_participants BIGINT,
    avg_score NUMERIC,
    total_tickets BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_submissions,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_submissions,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_submissions,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_submissions,
        COUNT(DISTINCT participant_name)::BIGINT as total_participants,
        COALESCE(AVG(score), 0) as avg_score,
        COALESCE(SUM(tickets_earned), 0)::BIGINT as total_tickets
    FROM submissions
    WHERE competition_id = p_competition_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active questions with competition info
CREATE OR REPLACE VIEW active_questions_view AS
SELECT 
    q.*,
    c.title as competition_title,
    c.slug as competition_slug,
    c.status as competition_status
FROM questions q
LEFT JOIN competitions c ON q.competition_id = c.id
WHERE q.is_active = true;

-- View for submissions with participant details
CREATE OR REPLACE VIEW submissions_detailed_view AS
SELECT 
    s.*,
    c.title as competition_title,
    c.slug as competition_slug,
    c.status as competition_status,
    u.username as reviewed_by_username
FROM submissions s
JOIN competitions c ON s.competition_id = c.id
LEFT JOIN users u ON s.reviewed_by = u.id;

-- View for wheel prizes with availability
CREATE OR REPLACE VIEW wheel_prizes_available_view AS
SELECT 
    wp.*,
    c.title as competition_title,
    c.slug as competition_slug,
    (wp.remaining::FLOAT / NULLIF(wp.quantity, 0) * 100) as availability_percentage
FROM wheel_prizes wp
JOIN competitions c ON wp.competition_id = c.id
WHERE wp.is_active = true
AND wp.remaining > 0;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables created: 8';
    RAISE NOTICE 'Users migrated: 3';
    RAISE NOTICE 'Sessions migrated: 1';
    RAISE NOTICE 'Competitions migrated: 1';
    RAISE NOTICE 'Questions migrated: 5';
    RAISE NOTICE 'Submissions migrated: 3';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env file with Supabase credentials';
    RAISE NOTICE '2. Update repository implementations to use Supabase client';
    RAISE NOTICE '3. Test all CRUD operations';
    RAISE NOTICE '4. Remove JSON file dependencies';
    RAISE NOTICE '============================================================================';
END $$;
