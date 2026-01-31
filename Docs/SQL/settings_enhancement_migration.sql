-- ============================================
-- SETTINGS ENHANCEMENT MIGRATION
-- ============================================
-- This migration adds all necessary columns for the enhanced Settings section
-- Run this in your Supabase SQL Editor AFTER running supabase_complete_setup.sql

-- First, verify the table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_participants') THEN
    RAISE EXCEPTION 'Table student_participants does not exist. Please run supabase_complete_setup.sql first.';
  END IF;
END $$;

-- Add missing columns to student_participants table
ALTER TABLE student_participants 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
    "email_notifications": true,
    "submission_notifications": true,
    "competition_notifications": true,
    "wheel_notifications": true,
    "weekly_digest": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;

-- Add constraints after columns are created
DO $$ 
BEGIN
  -- Add theme constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'student_participants_theme_check'
  ) THEN
    ALTER TABLE student_participants 
      ADD CONSTRAINT student_participants_theme_check 
      CHECK (theme IN ('light', 'dark', 'auto'));
  END IF;

  -- Add language constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'student_participants_language_check'
  ) THEN
    ALTER TABLE student_participants 
      ADD CONSTRAINT student_participants_language_check 
      CHECK (language IN ('ar', 'en'));
  END IF;

  -- Add font_size constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'student_participants_font_size_check'
  ) THEN
    ALTER TABLE student_participants 
      ADD CONSTRAINT student_participants_font_size_check 
      CHECK (font_size IN ('small', 'medium', 'large'));
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_participants_email ON student_participants(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_participants_phone ON student_participants(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_participants_theme ON student_participants(theme);

-- Create system_settings table for LRC_MANAGER settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES student_participants(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (key, value) VALUES
  ('site_name', '"منصة المسابقات"'::jsonb),
  ('site_description', '"منصة تفاعلية للمسابقات والأسئلة"'::jsonb),
  ('contact_email', '"support@example.com"'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('allow_registration', 'true'::jsonb),
  ('require_email_verification', 'false'::jsonb),
  ('max_submissions_per_user', '100'::jsonb),
  ('competition_auto_archive', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES student_participants(id) ON DELETE CASCADE,
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Update trigger for student_participants (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_participants_updated_at ON student_participants;
CREATE TRIGGER update_student_participants_updated_at
  BEFORE UPDATE ON student_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for system_settings (LRC_MANAGER only)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "LRC_MANAGER can view system settings" ON system_settings;
CREATE POLICY "LRC_MANAGER can view system settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role = 'LRC_MANAGER'
    )
  );

DROP POLICY IF EXISTS "LRC_MANAGER can update system settings" ON system_settings;
CREATE POLICY "LRC_MANAGER can update system settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role = 'LRC_MANAGER'
    )
  );

-- RLS Policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
CREATE POLICY "Users can delete their own sessions"
  ON user_sessions FOR DELETE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, UPDATE ON student_participants TO authenticated;
GRANT SELECT, UPDATE ON system_settings TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_sessions TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'student_participants'
AND column_name IN ('phone', 'bio', 'theme', 'language', 'font_size', 'compact_mode', 'notification_settings', 'avatar_url', 'last_password_change')
ORDER BY column_name;

-- Verify system_settings table
SELECT * FROM system_settings ORDER BY key;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'student_participants'
AND (indexname LIKE '%email%' OR indexname LIKE '%phone%' OR indexname LIKE '%theme%');

-- Add table comments
COMMENT ON TABLE student_participants IS 'Enhanced with settings columns for profile, appearance, and notifications';
COMMENT ON TABLE system_settings IS 'System-wide settings managed by LRC_MANAGER';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security management';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Settings enhancement migration completed successfully!';
  RAISE NOTICE '📊 Added 9 new columns to student_participants';
  RAISE NOTICE '📦 Created system_settings table';
  RAISE NOTICE '🔐 Created user_sessions table';
  RAISE NOTICE '🎉 All settings features are now ready to use!';
END $$;
