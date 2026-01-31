-- ============================================
-- SETTINGS ENHANCEMENT FOR SUPABASE AUTH
-- ============================================
-- This migration adds settings columns to your existing 'users' table
-- Compatible with Supabase Auth (auth.users)
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ADD SETTINGS COLUMNS TO USERS TABLE
-- ============================================

-- Add profile and settings columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add appearance preferences
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT false;

-- Add notification settings
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
    "email_notifications": true,
    "submission_notifications": true,
    "competition_notifications": true,
    "wheel_notifications": true,
    "weekly_digest": false
  }'::jsonb;

-- Add security tracking
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;

-- Add constraints
DO $$ 
BEGIN
  -- Theme constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_theme_check'
  ) THEN
    ALTER TABLE users 
      ADD CONSTRAINT users_theme_check 
      CHECK (theme IN ('light', 'dark', 'auto'));
  END IF;

  -- Language constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_language_check'
  ) THEN
    ALTER TABLE users 
      ADD CONSTRAINT users_language_check 
      CHECK (language IN ('ar', 'en'));
  END IF;

  -- Font size constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_font_size_check'
  ) THEN
    ALTER TABLE users 
      ADD CONSTRAINT users_font_size_check 
      CHECK (font_size IN ('small', 'medium', 'large'));
  END IF;
END $$;

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_theme ON users(theme);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name) WHERE display_name IS NOT NULL;

-- ============================================
-- 3. CREATE SYSTEM_SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
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

-- ============================================
-- 4. CREATE USER_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- ============================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- System settings policies (LRC_MANAGER only)
DROP POLICY IF EXISTS "LRC_MANAGER can view system settings" ON system_settings;
CREATE POLICY "LRC_MANAGER can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'LRC_MANAGER'
    )
  );

DROP POLICY IF EXISTS "LRC_MANAGER can update system settings" ON system_settings;
CREATE POLICY "LRC_MANAGER can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'LRC_MANAGER'
    )
  );

DROP POLICY IF EXISTS "LRC_MANAGER can insert system settings" ON system_settings;
CREATE POLICY "LRC_MANAGER can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'LRC_MANAGER'
    )
  );

-- User sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
CREATE POLICY "Users can insert their own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
CREATE POLICY "Users can delete their own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Update users table RLS to allow users to update their own settings
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, UPDATE ON users TO authenticated;
GRANT SELECT, UPDATE, INSERT ON system_settings TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_sessions TO authenticated;

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Verify new columns in users table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('phone', 'bio', 'display_name', 'avatar_url', 'theme', 'language', 'font_size', 'compact_mode', 'notification_settings', 'last_password_change')
ORDER BY column_name;

-- Verify system_settings table
SELECT COUNT(*) as settings_count FROM system_settings;

-- Verify user_sessions table exists
SELECT COUNT(*) as sessions_count FROM user_sessions;

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%theme%' OR conname LIKE '%language%' OR conname LIKE '%font_size%';

-- ============================================
-- 9. ADD COMMENTS
-- ============================================

COMMENT ON COLUMN users.phone IS 'User phone number (optional)';
COMMENT ON COLUMN users.bio IS 'User biography (optional)';
COMMENT ON COLUMN users.display_name IS 'Display name (defaults to username)';
COMMENT ON COLUMN users.avatar_url IS 'Profile picture URL';
COMMENT ON COLUMN users.theme IS 'UI theme preference: light, dark, or auto';
COMMENT ON COLUMN users.language IS 'Language preference: ar or en';
COMMENT ON COLUMN users.font_size IS 'Font size preference: small, medium, or large';
COMMENT ON COLUMN users.compact_mode IS 'Compact UI mode enabled';
COMMENT ON COLUMN users.notification_settings IS 'Notification preferences as JSONB';
COMMENT ON COLUMN users.last_password_change IS 'Timestamp of last password change';

COMMENT ON TABLE system_settings IS 'System-wide settings managed by LRC_MANAGER';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security management';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Settings enhancement migration completed successfully!';
  RAISE NOTICE '📊 Added 10 new columns to users table';
  RAISE NOTICE '📦 Created system_settings table';
  RAISE NOTICE '🔐 Created user_sessions table';
  RAISE NOTICE '🔒 Set up RLS policies';
  RAISE NOTICE '⚡ Created performance indexes';
  RAISE NOTICE '🎉 All settings features are now ready to use!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Test the Settings page at /dashboard';
  RAISE NOTICE '   2. Update profile information';
  RAISE NOTICE '   3. Change theme and see it persist';
  RAISE NOTICE '   4. Test password change with strength meter';
END $$;
