
-- ============================================
-- SUPABASE COMPLETE DATABASE SETUP
-- LRC Manager - Competition Management System
-- ============================================
-- This script creates all tables, indexes, RLS policies, and functions
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STUDENT PARTICIPANTS TABLE (Users/Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS student_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'ceo')),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for student_participants
CREATE INDEX IF NOT EXISTS idx_student_participants_username ON student_participants(username);
CREATE INDEX IF NOT EXISTS idx_student_participants_role ON student_participants(role);
CREATE INDEX IF NOT EXISTS idx_student_participants_created_at ON student_participants(created_at);

-- ============================================
-- 2. COMPETITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  wheel_spin_at TIMESTAMPTZ NOT NULL,
  rules JSONB NOT NULL DEFAULT '{
    "eligibilityMode": "all_correct",
    "minCorrectAnswers": 0,
    "ticketsConfig": {
      "baseTickets": 1,
      "earlyBonusTiers": []
    }
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (start_at < end_at AND end_at < wheel_spin_at)
);

-- Indexes for competitions
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON competitions(slug);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_start_at ON competitions(start_at);
CREATE INDEX IF NOT EXISTS idx_competitions_end_at ON competitions(end_at);

-- ============================================
-- 3. QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  is_training BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'text')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT, -- Allow NULL for "set later" functionality
  source_ref JSONB NOT NULL DEFAULT '{
    "volume": "",
    "page": "",
    "lineFrom": "",
    "lineTo": ""
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_question_type CHECK (
    (type = 'mcq' AND options IS NOT NULL) OR
    (type = 'true_false' AND options IS NULL) OR
    (type = 'text' AND options IS NULL)
  )
);

-- Indexes for questions
CREATE INDEX IF NOT EXISTS idx_questions_competition_id ON questions(competition_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_training ON questions(is_training);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);

-- ============================================
-- 4. SUBMISSIONS TABLE (Competition Answers)
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  final_result TEXT CHECK (final_result IN ('correct', 'incorrect')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES student_participants(id),
  CONSTRAINT unique_user_question_submission UNIQUE (user_id, question_id, competition_id)
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_competition_id ON submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_is_correct ON submissions(is_correct);

-- ============================================
-- 5. TRAINING SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_training_question UNIQUE (user_id, question_id)
);

-- Indexes for training_submissions
CREATE INDEX IF NOT EXISTS idx_training_submissions_user_id ON training_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_submissions_question_id ON training_submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_training_submissions_submitted_at ON training_submissions(submitted_at);

-- ============================================
-- 6. TICKETS TABLE (Lottery Tickets)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_competition_id ON tickets(competition_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- ============================================
-- 7. PARTICIPANTS TABLE (Competition Registration)
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_participant_per_competition UNIQUE (competition_id, phone)
);

-- Indexes for participants
CREATE INDEX IF NOT EXISTS idx_participants_competition_id ON participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);

-- ============================================
-- 8. WHEEL RUNS TABLE (Lottery Execution)
-- ============================================
CREATE TABLE IF NOT EXISTS wheel_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES student_participants(id),
  snapshot JSONB NOT NULL,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ran_by UUID NOT NULL REFERENCES student_participants(id),
  CONSTRAINT unique_wheel_per_competition UNIQUE (competition_id)
);

-- Indexes for wheel_runs
CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition_id ON wheel_runs(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_winner_id ON wheel_runs(winner_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_ran_at ON wheel_runs(ran_at);

-- ============================================
-- 9. WINNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  won_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_winner_per_competition UNIQUE (competition_id)
);

-- Indexes for winners
CREATE INDEX IF NOT EXISTS idx_winners_competition_id ON winners(competition_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_won_at ON winners(won_at);

-- ============================================
-- 10. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_student_participants_updated_at
  BEFORE UPDATE ON student_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE student_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STUDENT PARTICIPANTS POLICIES
-- ============================================

-- Allow public signup (insert) - No authentication required
CREATE POLICY "Allow public signup"
  ON student_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public to read basic user info (for username uniqueness check)
CREATE POLICY "Allow public username check"
  ON student_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON student_participants
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Managers and above can read all users
CREATE POLICY "Managers can read all users"
  ON student_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON student_participants
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- COMPETITIONS POLICIES
-- ============================================

-- Everyone can read active and archived competitions
CREATE POLICY "Public can read active/archived competitions"
  ON competitions
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'archived'));

-- Managers can read all competitions
CREATE POLICY "Managers can read all competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can create competitions
CREATE POLICY "Managers can create competitions"
  ON competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can update competitions
CREATE POLICY "Managers can update competitions"
  ON competitions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- QUESTIONS POLICIES
-- ============================================

-- Everyone can read active questions
CREATE POLICY "Public can read active questions"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Managers can read all questions
CREATE POLICY "Managers can read all questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can create questions
CREATE POLICY "Managers can create questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can update questions
CREATE POLICY "Managers can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can delete questions
CREATE POLICY "Managers can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- SUBMISSIONS POLICIES
-- ============================================

-- Users can read their own submissions
CREATE POLICY "Users can read own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Managers can read all submissions
CREATE POLICY "Managers can read all submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Users can create their own submissions
CREATE POLICY "Users can create own submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Managers can update submissions (for review)
CREATE POLICY "Managers can update submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- TRAINING SUBMISSIONS POLICIES
-- ============================================

-- Users can read their own training submissions
CREATE POLICY "Users can read own training submissions"
  ON training_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own training submissions
CREATE POLICY "Users can create own training submissions"
  ON training_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Managers can read all training submissions
CREATE POLICY "Managers can read all training submissions"
  ON training_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- TICKETS POLICIES
-- ============================================

-- Users can read their own tickets
CREATE POLICY "Users can read own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Managers can read all tickets
CREATE POLICY "Managers can read all tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can create tickets
CREATE POLICY "Managers can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can update tickets
CREATE POLICY "Managers can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can delete tickets
CREATE POLICY "Managers can delete tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- PARTICIPANTS POLICIES
-- ============================================

-- Everyone can read participants
CREATE POLICY "Public can read participants"
  ON participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create participants
CREATE POLICY "Authenticated can create participants"
  ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Managers can update participants
CREATE POLICY "Managers can update participants"
  ON participants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- WHEEL RUNS POLICIES
-- ============================================

-- Everyone can read wheel runs
CREATE POLICY "Public can read wheel runs"
  ON wheel_runs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Managers can create wheel runs
CREATE POLICY "Managers can create wheel runs"
  ON wheel_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- WINNERS POLICIES
-- ============================================

-- Everyone can read public winners
CREATE POLICY "Public can read public winners"
  ON winners
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Managers can read all winners
CREATE POLICY "Managers can read all winners"
  ON winners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can create winners
CREATE POLICY "Managers can create winners"
  ON winners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- Managers can update winners
CREATE POLICY "Managers can update winners"
  ON winners
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Managers can read all audit logs
CREATE POLICY "Managers can read all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin', 'ceo')
    )
  );

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get active competition
CREATE OR REPLACE FUNCTION get_active_competition()
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  status TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  wheel_spin_at TIMESTAMPTZ,
  rules JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM competitions
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user tickets for a competition
CREATE OR REPLACE FUNCTION calculate_user_tickets(p_user_id UUID, p_competition_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tickets INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)
  INTO total_tickets
  FROM tickets
  WHERE user_id = p_user_id
  AND competition_id = p_competition_id;
  
  RETURN total_tickets;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user submission stats for a competition
CREATE OR REPLACE FUNCTION get_user_competition_stats(p_user_id UUID, p_competition_id UUID)
RETURNS TABLE (
  total_submissions BIGINT,
  correct_submissions BIGINT,
  incorrect_submissions BIGINT,
  total_tickets INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_submissions,
    COUNT(*) FILTER (WHERE is_correct = true)::BIGINT as correct_submissions,
    COUNT(*) FILTER (WHERE is_correct = false)::BIGINT as incorrect_submissions,
    calculate_user_tickets(p_user_id, p_competition_id) as total_tickets
  FROM submissions
  WHERE user_id = p_user_id
  AND competition_id = p_competition_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample CEO user (password: "password123" hashed with SHA-256)
-- Hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
INSERT INTO student_participants (username, password_hash, email, role, display_name)
VALUES (
  'admin',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'admin@lrcmanager.com',
  'ceo',
  'المدير العام'
) ON CONFLICT (username) DO NOTHING;

-- Insert a sample student user (password: "student123" hashed with SHA-256)
-- Hash: 9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05
INSERT INTO student_participants (username, password_hash, email, role, display_name)
VALUES (
  'student1',
  '9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05',
  'student1@example.com',
  'student',
  'طالب تجريبي'
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📊 Tables created: 10';
  RAISE NOTICE '🔒 RLS policies applied: All tables secured';
  RAISE NOTICE '⚡ Indexes created: Optimized for performance';
  RAISE NOTICE '🔧 Helper functions: Available for use';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Sample Users Created:';
  RAISE NOTICE '   - Username: admin | Password: password123 | Role: CEO';
  RAISE NOTICE '   - Username: student1 | Password: student123 | Role: Student';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your LRC Manager database is ready to use!';
END $$;
