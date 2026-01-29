-- Enhanced Wheel Management System
-- This migration adds improved fields for wheel management

-- Add new columns to wheel_runs table if they don't exist
DO $$ 
BEGIN
  -- Add snapshot_metadata column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'snapshot_metadata'
  ) THEN
    ALTER TABLE wheel_runs ADD COLUMN snapshot_metadata JSONB;
  END IF;

  -- Add draw_metadata column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'draw_metadata'
  ) THEN
    ALTER TABLE wheel_runs ADD COLUMN draw_metadata JSONB;
  END IF;

  -- Add announcement_message column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'announcement_message'
  ) THEN
    ALTER TABLE wheel_runs ADD COLUMN announcement_message TEXT;
  END IF;

  -- Add published_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE wheel_runs ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  -- Add published_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wheel_runs' AND column_name = 'published_by'
  ) THEN
    ALTER TABLE wheel_runs ADD COLUMN published_by UUID REFERENCES student_participants(id);
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN wheel_runs.snapshot_metadata IS 'Metadata about the snapshot: total_students, total_tickets, locked_by_username, timestamp';
COMMENT ON COLUMN wheel_runs.draw_metadata IS 'Metadata about the draw: total_tickets, random_value, winner_ticket_index, draw_hash, run_by_username, timestamp';
COMMENT ON COLUMN wheel_runs.announcement_message IS 'Optional announcement message to display with the winner';
COMMENT ON COLUMN wheel_runs.published_at IS 'Timestamp when results were published';
COMMENT ON COLUMN wheel_runs.published_by IS 'User who published the results';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wheel_runs_published ON wheel_runs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition ON wheel_runs(competition_id);

-- Add RLS policies for public access to published results
ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published wheel runs
DROP POLICY IF EXISTS "Public can view published wheel runs" ON wheel_runs;
CREATE POLICY "Public can view published wheel runs"
  ON wheel_runs
  FOR SELECT
  USING (is_published = true);

-- Policy: LRC_MANAGER and CEO can view all wheel runs
DROP POLICY IF EXISTS "Managers can view all wheel runs" ON wheel_runs;
CREATE POLICY "Managers can view all wheel runs"
  ON wheel_runs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- Policy: LRC_MANAGER and CEO can insert wheel runs
DROP POLICY IF EXISTS "Managers can insert wheel runs" ON wheel_runs;
CREATE POLICY "Managers can insert wheel runs"
  ON wheel_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- Policy: LRC_MANAGER and CEO can update wheel runs
DROP POLICY IF EXISTS "Managers can update wheel runs" ON wheel_runs;
CREATE POLICY "Managers can update wheel runs"
  ON wheel_runs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- Policy: Only CEO can delete wheel runs
DROP POLICY IF EXISTS "CEO can delete wheel runs" ON wheel_runs;
CREATE POLICY "CEO can delete wheel runs"
  ON wheel_runs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role = 'CEO'
    )
  );

-- Create a view for public wheel results
CREATE OR REPLACE VIEW public_wheel_results AS
SELECT 
  wr.id,
  wr.competition_id,
  wr.winner_id,
  wr.locked_at,
  wr.run_at,
  wr.is_published,
  wr.show_winner_name,
  wr.winner_display_name,
  wr.announcement_message,
  wr.published_at,
  wr.locked_snapshot,
  wr.draw_metadata,
  sp.username as winner_username,
  sp.display_name as winner_display_name_actual,
  sp.class as winner_class
FROM wheel_runs wr
LEFT JOIN student_participants sp ON wr.winner_id = sp.id
WHERE wr.is_published = true;

-- Grant access to the view
GRANT SELECT ON public_wheel_results TO anon, authenticated;

-- Create function to get wheel statistics
CREATE OR REPLACE FUNCTION get_wheel_statistics(p_competition_id UUID)
RETURNS TABLE (
  total_students INTEGER,
  total_tickets INTEGER,
  avg_tickets_per_student NUMERIC,
  max_tickets INTEGER,
  min_tickets INTEGER,
  is_locked BOOLEAN,
  is_drawn BOOLEAN,
  is_published BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(jsonb_array_length(wr.locked_snapshot), 0)::INTEGER as total_students,
    COALESCE((wr.snapshot_metadata->>'total_tickets')::INTEGER, 0) as total_tickets,
    CASE 
      WHEN jsonb_array_length(wr.locked_snapshot) > 0 
      THEN COALESCE((wr.snapshot_metadata->>'total_tickets')::NUMERIC / jsonb_array_length(wr.locked_snapshot), 0)
      ELSE 0
    END as avg_tickets_per_student,
    COALESCE((
      SELECT MAX((elem->>'totalTickets')::INTEGER)
      FROM jsonb_array_elements(wr.locked_snapshot) elem
    ), 0) as max_tickets,
    COALESCE((
      SELECT MIN((elem->>'totalTickets')::INTEGER)
      FROM jsonb_array_elements(wr.locked_snapshot) elem
    ), 0) as min_tickets,
    (wr.locked_at IS NOT NULL) as is_locked,
    (wr.winner_id IS NOT NULL) as is_drawn,
    COALESCE(wr.is_published, false) as is_published
  FROM wheel_runs wr
  WHERE wr.competition_id = p_competition_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_wheel_statistics(UUID) TO authenticated;

COMMENT ON FUNCTION get_wheel_statistics IS 'Get comprehensive statistics for a wheel run';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced wheel management system installed successfully!';
  RAISE NOTICE 'New features:';
  RAISE NOTICE '  - Snapshot metadata tracking';
  RAISE NOTICE '  - Draw metadata with verification hash';
  RAISE NOTICE '  - Announcement messages';
  RAISE NOTICE '  - Publication tracking';
  RAISE NOTICE '  - Public view for results';
  RAISE NOTICE '  - Statistics function';
END $$;
