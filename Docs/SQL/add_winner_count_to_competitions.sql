-- ============================================================================
-- ADD WINNER COUNT CONFIGURATION TO COMPETITIONS
-- Allows CEO/LRC Manager to specify how many winners per competition
-- ============================================================================

-- Add winner_count column to competitions table
DO $$ 
BEGIN
    -- Check if winner_count column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'competitions' 
        AND column_name = 'winner_count'
    ) THEN
        -- Add winner_count column with default of 1
        ALTER TABLE competitions 
        ADD COLUMN winner_count INTEGER NOT NULL DEFAULT 1;
        
        -- Add check constraint to ensure valid winner count (1-10)
        ALTER TABLE competitions
        ADD CONSTRAINT valid_winner_count CHECK (winner_count >= 1 AND winner_count <= 10);
        
        RAISE NOTICE 'Added winner_count column to competitions table';
    ELSE
        RAISE NOTICE 'winner_count column already exists in competitions table';
    END IF;
END $$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_competitions_winner_count ON competitions(winner_count);

-- Add comment
COMMENT ON COLUMN competitions.winner_count IS 'Number of winners to select in the draw (1-10)';

-- ============================================================================
-- UPDATE EXISTING COMPETITIONS
-- Set default winner count to 3 for existing competitions
-- ============================================================================
UPDATE competitions 
SET winner_count = 3
WHERE winner_count = 1; -- Only update if still at default

-- ============================================================================
-- CREATE WHEEL_RUNS TABLE (if not exists)
-- Tracks draw execution and multiple winners
-- ============================================================================
CREATE TABLE IF NOT EXISTS wheel_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    
    -- Draw Configuration
    winner_count INTEGER NOT NULL DEFAULT 1,
    
    -- Draw State
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'completed', 'cancelled')),
    
    -- Snapshot Data
    candidates_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    locked_snapshot JSONB,
    total_tickets INTEGER DEFAULT 0,
    
    -- Winners (array of winner objects)
    winners JSONB DEFAULT '[]'::jsonb, -- [{username, display_name, ticket_index, position}, ...]
    
    -- Metadata
    draw_metadata JSONB DEFAULT '{}'::jsonb,
    announcement_message TEXT,
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    show_winner_names BOOLEAN DEFAULT true,
    
    -- Timestamps
    locked_at TIMESTAMPTZ,
    run_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_winner_count_run CHECK (winner_count >= 1 AND winner_count <= 10)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wheel_runs_competition_id ON wheel_runs(competition_id);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_status ON wheel_runs(status);
CREATE INDEX IF NOT EXISTS idx_wheel_runs_is_published ON wheel_runs(is_published);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_wheel_runs_updated_at ON wheel_runs;
CREATE TRIGGER update_wheel_runs_updated_at 
    BEFORE UPDATE ON wheel_runs
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE wheel_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published wheel runs" ON wheel_runs;
CREATE POLICY "Anyone can view published wheel runs" 
    ON wheel_runs FOR SELECT 
    USING (is_published = true);

DROP POLICY IF EXISTS "Service role can manage wheel runs" ON wheel_runs;
CREATE POLICY "Service role can manage wheel runs" 
    ON wheel_runs FOR ALL 
    USING (true);

-- Add comments
COMMENT ON TABLE wheel_runs IS 'Tracks draw execution with support for multiple winners';
COMMENT ON COLUMN wheel_runs.winner_count IS 'Number of winners to select (1-10)';
COMMENT ON COLUMN wheel_runs.winners IS 'Array of winner objects with username, display_name, ticket_index, position';
COMMENT ON COLUMN wheel_runs.candidates_snapshot IS 'Snapshot of all eligible candidates at lock time';

-- ============================================================================
-- HELPER FUNCTION: Get Competition Winner Count
-- ============================================================================
CREATE OR REPLACE FUNCTION get_competition_winner_count(p_competition_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_winner_count INTEGER;
BEGIN
    SELECT winner_count INTO v_winner_count
    FROM competitions
    WHERE id = p_competition_id;
    
    RETURN COALESCE(v_winner_count, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '✅ WINNER COUNT CONFIGURATION ADDED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  1. Added winner_count column to competitions (default: 1, range: 1-10)';
    RAISE NOTICE '  2. Created/updated wheel_runs table with multi-winner support';
    RAISE NOTICE '  3. Added helper function: get_competition_winner_count()';
    RAISE NOTICE '  4. Added indexes and RLS policies';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Update competition forms to allow setting winner_count';
    RAISE NOTICE '  2. Update draw simulator to handle multiple winners';
    RAISE NOTICE '  3. Update UI to display multiple winners';
    RAISE NOTICE '============================================================================';
END $$;
