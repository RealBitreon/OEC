-- Add attempt tracking system for competitions
-- This allows limiting how many times a student can participate

-- Add max_attempts column to competitions table
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 2 CHECK (max_attempts >= 1 AND max_attempts <= 4);

-- Create attempt_tracking table to track device/browser attempts
CREATE TABLE IF NOT EXISTS attempt_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  user_id UUID DEFAULT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, device_fingerprint)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attempt_tracking_competition_device 
ON attempt_tracking(competition_id, device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_attempt_tracking_user 
ON attempt_tracking(user_id);

-- Enable RLS
ALTER TABLE attempt_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read attempts
CREATE POLICY "Anyone can read attempts"
ON attempt_tracking FOR SELECT
USING (true);

-- Policy: Anyone can insert their attempts
CREATE POLICY "Anyone can track attempts"
ON attempt_tracking FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update their attempts
CREATE POLICY "Anyone can update attempts"
ON attempt_tracking FOR UPDATE
USING (true);

-- Policy: Authenticated users can delete (for admin cleanup)
CREATE POLICY "Authenticated users can delete attempts"
ON attempt_tracking FOR DELETE
TO authenticated
USING (true);

-- Function to check if user can attempt
CREATE OR REPLACE FUNCTION can_attempt_competition(
  p_competition_id UUID,
  p_device_fingerprint TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_max_attempts INTEGER;
  v_current_attempts INTEGER;
BEGIN
  -- Get max attempts for competition
  SELECT max_attempts INTO v_max_attempts
  FROM competitions
  WHERE id = p_competition_id;
  
  -- Get current attempts
  SELECT COALESCE(attempt_count, 0) INTO v_current_attempts
  FROM attempt_tracking
  WHERE competition_id = p_competition_id
  AND device_fingerprint = p_device_fingerprint;
  
  -- Return true if under limit
  RETURN COALESCE(v_current_attempts, 0) < COALESCE(v_max_attempts, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment attempt count
CREATE OR REPLACE FUNCTION increment_attempt(
  p_competition_id UUID,
  p_device_fingerprint TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  INSERT INTO attempt_tracking (
    competition_id,
    device_fingerprint,
    user_id,
    attempt_count,
    last_attempt_at
  ) VALUES (
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
    user_id = COALESCE(EXCLUDED.user_id, attempt_tracking.user_id),
    updated_at = NOW()
  RETURNING attempt_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE attempt_tracking IS 'Tracks competition participation attempts per device/browser';
COMMENT ON COLUMN competitions.max_attempts IS 'Maximum number of attempts allowed per device (1-4, default 2)';


