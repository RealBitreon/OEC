-- ============================================
-- WHEEL MANAGEMENT SCHEMA
-- ============================================

-- Add wheel_runs table if not exists
CREATE TABLE IF NOT EXISTS wheel_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  locked_snapshot JSONB NOT NULL,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES student_participants(id),
  winner_id UUID REFERENCES student_participants(id),
  run_at TIMESTAMPTZ,
  run_by UUID REFERENCES student_participants(id),
  is_published BOOLEAN DEFAULT false,
  show_winner_name BOOLEAN DEFAULT true,
  winner_display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition ON wheel_runs(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_winner ON wheel_runs(winner_id);

-- Add RLS policies
ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;

-- Allow managers to read/write
CREATE POLICY "Managers can manage wheel runs"
  ON wheel_runs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- Allow public to read published results
CREATE POLICY "Public can view published results"
  ON wheel_runs
  FOR SELECT
  USING (is_published = true);

-- Update competitions table to support rules if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'competitions' AND column_name = 'rules') THEN
    ALTER TABLE competitions ADD COLUMN rules JSONB DEFAULT '{
      "eligibilityMode": "all_correct",
      "ticketsPerCorrect": 1,
      "earlyBonusTiers": []
    }'::jsonb;
  END IF;
END $$;

-- Add allowManualAdjustments to rules if needed
UPDATE competitions
SET rules = jsonb_set(
  COALESCE(rules, '{}'::jsonb),
  '{allowManualAdjustments}',
  'true'::jsonb,
  true
)
WHERE rules IS NULL OR NOT (rules ? 'allowManualAdjustments');

COMMENT ON TABLE wheel_runs IS 'Stores wheel draw snapshots and results';
COMMENT ON COLUMN wheel_runs.locked_snapshot IS 'Immutable snapshot of eligible students with tickets';
COMMENT ON COLUMN wheel_runs.is_published IS 'Whether results are visible to public';
COMMENT ON COLUMN wheel_runs.show_winner_name IS 'Whether to show real winner name';
COMMENT ON COLUMN wheel_runs.winner_display_name IS 'Optional alias for winner';
