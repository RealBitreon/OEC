-- ============================================================================
-- MIGRATION 002: Automatic Ticket Creation on Approval
-- ============================================================================
-- Purpose: Automatically create lottery tickets when admin approves a submission
--          This ensures eligibility is properly tracked and wheel logic works
-- ============================================================================

-- Function to automatically create tickets when submission is approved
CREATE OR REPLACE FUNCTION create_tickets_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_has_user_id_column BOOLEAN;
BEGIN
  -- Check if user_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'user_id'
  ) INTO v_has_user_id_column;

  -- Only create tickets when status changes to 'approved' and tickets_earned > 0
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.tickets_earned > 0 THEN
    
    -- Determine user_id (try from submission if column exists, fallback to lookup by participant_name)
    IF v_has_user_id_column THEN
      v_user_id := NEW.user_id;
    ELSE
      v_user_id := NULL;
    END IF;
    
    IF v_user_id IS NULL AND NEW.participant_name IS NOT NULL THEN
      -- Try to find user by participant_name
      SELECT id INTO v_user_id 
      FROM student_participants 
      WHERE username = NEW.participant_name 
         OR display_name = NEW.participant_name
      LIMIT 1;
    END IF;
    
    -- Check if tickets already exist for this submission
    IF NOT EXISTS (
      SELECT 1 FROM tickets 
      WHERE competition_id = NEW.competition_id 
      AND (
        (v_user_id IS NOT NULL AND user_id = v_user_id)
        OR reason LIKE '%' || NEW.id || '%'
      )
      AND reason IN ('submission_approved', 'correct_answers')
    ) THEN
      -- Insert tickets
      INSERT INTO tickets (user_id, competition_id, count, reason, created_at)
      VALUES (
        v_user_id,
        NEW.competition_id,
        NEW.tickets_earned,
        'submission_approved',
        NOW()
      );
      
      RAISE NOTICE 'Created % tickets for submission % (user: %)', NEW.tickets_earned, NEW.id, COALESCE(v_user_id::TEXT, NEW.participant_name);
    END IF;
  END IF;
  
  -- If status changes from approved to rejected, remove tickets
  IF OLD.status = 'approved' AND NEW.status = 'rejected' THEN
    IF v_has_user_id_column AND NEW.user_id IS NOT NULL THEN
      DELETE FROM tickets
      WHERE competition_id = NEW.competition_id
      AND user_id = NEW.user_id
      AND reason IN ('submission_approved', 'correct_answers');
    ELSE
      -- If no user_id, delete by reason pattern
      DELETE FROM tickets
      WHERE competition_id = NEW.competition_id
      AND reason LIKE '%' || NEW.id || '%'
      AND reason IN ('submission_approved', 'correct_answers');
    END IF;
    
    RAISE NOTICE 'Removed tickets for rejected submission %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_tickets_on_approval ON submissions;
CREATE TRIGGER trigger_create_tickets_on_approval
  AFTER UPDATE ON submissions
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION create_tickets_on_approval();

-- Add comment
COMMENT ON FUNCTION create_tickets_on_approval IS 'Automatically creates/removes lottery tickets when submission status changes';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 002 completed: Automatic ticket creation trigger installed';
END $$;
