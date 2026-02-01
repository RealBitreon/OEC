-- ============================================================================
-- MIGRATION 003: Eligibility Check Functions
-- ============================================================================
-- Purpose: Provide consistent eligibility checking across frontend and backend
--          Single source of truth for "is user in the wheel?"
-- ============================================================================

-- Function to check if user is eligible for wheel (has tickets)
CREATE OR REPLACE FUNCTION is_user_eligible_for_wheel(
  p_user_identifier TEXT,  -- Can be user_id (UUID) or participant_name
  p_competition_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_ticket_count INTEGER;
  v_user_id UUID;
BEGIN
  -- Try to parse as UUID
  BEGIN
    v_user_id := p_user_identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If not UUID, treat as participant_name and lookup
    SELECT id INTO v_user_id 
    FROM student_participants 
    WHERE username = p_user_identifier 
       OR display_name = p_user_identifier
    LIMIT 1;
  END;
  
  -- Count tickets for this user/competition
  SELECT COALESCE(SUM(count), 0) INTO v_ticket_count
  FROM tickets
  WHERE competition_id = p_competition_id
  AND (
    (v_user_id IS NOT NULL AND user_id = v_user_id)
    OR (v_user_id IS NULL AND user_id IS NULL)
  );
  
  RETURN v_ticket_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user ticket count
CREATE OR REPLACE FUNCTION get_user_ticket_count(
  p_user_identifier TEXT,
  p_competition_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_ticket_count INTEGER;
  v_user_id UUID;
BEGIN
  -- Try to parse as UUID
  BEGIN
    v_user_id := p_user_identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If not UUID, treat as participant_name and lookup
    SELECT id INTO v_user_id 
    FROM student_participants 
    WHERE username = p_user_identifier 
       OR display_name = p_user_identifier
    LIMIT 1;
  END;
  
  -- Count tickets for this user/competition
  SELECT COALESCE(SUM(count), 0) INTO v_ticket_count
  FROM tickets
  WHERE competition_id = p_competition_id
  AND (
    (v_user_id IS NOT NULL AND user_id = v_user_id)
    OR (v_user_id IS NULL AND user_id IS NULL)
  );
  
  RETURN v_ticket_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get detailed eligibility info
CREATE OR REPLACE FUNCTION get_user_eligibility_info(
  p_user_identifier TEXT,
  p_competition_id UUID
)
RETURNS TABLE (
  is_eligible BOOLEAN,
  ticket_count INTEGER,
  submission_count INTEGER,
  approved_submissions INTEGER,
  latest_submission_status TEXT,
  latest_submission_score INTEGER
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to parse as UUID
  BEGIN
    v_user_id := p_user_identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If not UUID, treat as participant_name and lookup
    SELECT id INTO v_user_id 
    FROM student_participants 
    WHERE username = p_user_identifier 
       OR display_name = p_user_identifier
    LIMIT 1;
  END;
  
  RETURN QUERY
  SELECT
    get_user_ticket_count(p_user_identifier, p_competition_id) > 0 AS is_eligible,
    get_user_ticket_count(p_user_identifier, p_competition_id) AS ticket_count,
    COUNT(s.id)::INTEGER AS submission_count,
    COUNT(s.id) FILTER (WHERE s.status = 'approved')::INTEGER AS approved_submissions,
    (SELECT status FROM submissions WHERE competition_id = p_competition_id AND (user_id = v_user_id OR participant_name = p_user_identifier) ORDER BY submitted_at DESC LIMIT 1) AS latest_submission_status,
    (SELECT score FROM submissions WHERE competition_id = p_competition_id AND (user_id = v_user_id OR participant_name = p_user_identifier) ORDER BY submitted_at DESC LIMIT 1) AS latest_submission_score
  FROM submissions s
  WHERE s.competition_id = p_competition_id
  AND (s.user_id = v_user_id OR s.participant_name = p_user_identifier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION is_user_eligible_for_wheel IS 'Returns TRUE if user has at least 1 ticket for the competition';
COMMENT ON FUNCTION get_user_ticket_count IS 'Returns total number of tickets user has for the competition';
COMMENT ON FUNCTION get_user_eligibility_info IS 'Returns comprehensive eligibility information for a user';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 003 completed: Eligibility functions created';
  RAISE NOTICE '   - is_user_eligible_for_wheel(user_identifier, competition_id)';
  RAISE NOTICE '   - get_user_ticket_count(user_identifier, competition_id)';
  RAISE NOTICE '   - get_user_eligibility_info(user_identifier, competition_id)';
END $$;
