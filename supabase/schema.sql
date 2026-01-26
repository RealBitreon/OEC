-- Supabase Database Schema for LRC Competition Platform
-- This schema mirrors the JSON data structures
-- DO NOT EXECUTE AUTOMATICALLY - This is a migration plan only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (replaces users.json)
-- Note: We keep light auth with cookies, this is just for user metadata
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ceo', 'lrc_manager', 'student')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Competitions table
CREATE TABLE competitions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  wheel_spin_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  rules JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_slug ON competitions(slug);

-- Questions table
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'true_false', 'mcq')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_training BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_competition ON questions(competition_id);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_training ON questions(is_training);

-- Submissions table
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  student_username TEXT NOT NULL,
  answer JSONB NOT NULL,
  source JSONB NOT NULL,
  auto_result TEXT NOT NULL CHECK (auto_result IN ('correct', 'incorrect', 'pending')),
  final_result TEXT NOT NULL CHECK (final_result IN ('correct', 'incorrect', 'pending')),
  corrected_by TEXT,
  reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_competition ON submissions(competition_id);
CREATE INDEX idx_submissions_student ON submissions(student_username);
CREATE INDEX idx_submissions_question ON submissions(question_id);
CREATE INDEX idx_submissions_final_result ON submissions(final_result);

-- Training submissions table
CREATE TABLE training_submissions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  student_username TEXT NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_submissions_student ON training_submissions(student_username);
CREATE INDEX idx_training_submissions_question ON training_submissions(question_id);

-- Tickets table
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  student_username TEXT NOT NULL,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  count INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_competition ON tickets(competition_id);
CREATE INDEX idx_tickets_student ON tickets(student_username);
CREATE INDEX idx_tickets_submission ON tickets(submission_id);

-- Wheel runs table
CREATE TABLE wheel_runs (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  competition_slug TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ready', 'running', 'done')),
  locked_at TIMESTAMPTZ NOT NULL,
  run_at TIMESTAMPTZ,
  locked_by TEXT NOT NULL,
  rules_snapshot JSONB NOT NULL,
  candidates_snapshot JSONB NOT NULL,
  total_tickets INTEGER NOT NULL,
  winner_username TEXT,
  winner_ticket_index INTEGER,
  seed TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wheel_runs_competition ON wheel_runs(competition_id);
CREATE INDEX idx_wheel_runs_status ON wheel_runs(status);

-- Winners table
CREATE TABLE winners (
  id SERIAL PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  winner_username TEXT NOT NULL,
  run_at TIMESTAMPTZ NOT NULL,
  wheel_run_id TEXT REFERENCES wheel_runs(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_winners_competition ON winners(competition_id);
CREATE INDEX idx_winners_username ON winners(winner_username);

-- Audit log table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- RLS Policies (disabled for now, will be enabled when migrating)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Migration Notes:
-- 1. This schema is designed to match the JSON structure exactly
-- 2. All TEXT ids match the UUID format used in JSON files
-- 3. JSONB columns preserve complex nested structures (rules, source, answer, etc.)
-- 4. Indexes are added for common query patterns
-- 5. Foreign keys ensure referential integrity
-- 6. RLS policies are commented out - enable them when ready to add security
-- 7. The profiles table stores user data but auth remains cookie-based
