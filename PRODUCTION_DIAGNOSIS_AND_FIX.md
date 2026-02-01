# PRODUCTION SYSTEM DIAGNOSIS & FIX PLAN
## LRC Manager Competition Platform - Complete Analysis

**Date:** 2026-02-01  
**Engineer:** Principal Next.js & Supabase Architect  
**Status:** CRITICAL - Production Inconsistencies Detected

---

## A) ROOT CAUSE DIAGNOSIS

### Problem 1: "In Wheel" UI vs Backend Mismatch

**Symptom:** Student sees "you are in the wheel" but backend shows 0 tickets and not eligible.

**Root Cause Analysis:**

1. **Disconnected Eligibility Logic:**
   - **Frontend (ParticipationForm.tsx lines 220-230):** Shows success message based ONLY on `correctCount === totalQuestions`
   - **Backend (submissions table):** Has NO `tickets_earned` column or eligibility snapshot
   - **Tickets Calculation:** Happens in `/api/competition/submit` but NOT persisted to submissions table
   - **Result:** UI claims eligibility based on client-side score, but tickets are never created in DB

2. **Missing Tickets Creation:**
   - File: `app/api/competition/submit/route.ts` (lines 95-110)
   - Code calculates `ticketsEarned` but NEVER inserts into `tickets` table
   - Only creates submission record, no ticket records
   - Dashboard queries `tickets` table which is empty → shows 0 tickets

3. **Schema Mismatch:**
   - `submissions` table (supabase_complete_setup.sql line 44-56):
     - Has: `user_id`, `competition_id`, `question_id`, `answer`, `is_correct`
     - Missing: `tickets_earned`, `score`, `total_questions`, `status`, `participant_name`
   - API expects: `participant_name`, `answers` (JSON), `score`, `status`
   - Repo layer (submissions.ts line 12-14) tries to read `status` field that doesn't exist in schema

**Evidence:**
```typescript
// app/api/competition/submit/route.ts:95-110
const ticketsEarned = computeTickets(...)  // ✓ Calculated
await submissionsRepo.create(submission)    // ✓ Submission created
// ❌ NO tickets table insert!
```

```sql
-- Docs/SQL/supabase_complete_setup.sql:44-56
CREATE TABLE submissions (
  -- ❌ Missing: participant_name, score, total_questions, status, tickets_earned
  user_id UUID NOT NULL,  -- But API uses participant_name (string)!
  question_id UUID NOT NULL,  -- But API stores all answers in JSON!
)
```

---

### Problem 2: Accept Action Fails

**Symptom:** Admin clicks "accept" but it fails silently or with error.

**Root Cause Analysis:**

1. **Schema Column Mismatch:**
   - `reviewSubmission` action (submissions.ts:58-90) updates `status` field
   - But `submissions` table schema has `final_result` not `status`
   - SQL error: `column "status" does not exist`
   - API returns 200 OK even on DB error (no proper error handling)

2. **Missing Status Column:**
   ```sql
   -- Current schema (supabase_complete_setup.sql)
   CREATE TABLE submissions (
     final_result TEXT CHECK (final_result IN ('correct', 'incorrect')),
     -- ❌ No 'status' column
   )
   ```
   
   ```typescript
   // app/dashboard/actions/submissions.ts:80-90
   await supabase.from('submissions').update({
     status,  // ❌ Column doesn't exist!
     reviewed_at,
     reviewed_by
   })
   ```

3. **No Ticket Creation on Accept:**
   - When admin accepts submission, no tickets are created
   - Missing trigger or logic to insert into `tickets` table
   - Student remains ineligible even after acceptance

---

### Problem 3: Duplicate Competition Forms

**Location 1:** `app/dashboard/competitions/[id]/manage/ManageCompetition.tsx`
- Uses: `datetime-local` inputs
- Fields: `status` select, `max_attempts`, `eligibilityMode`, `minCorrectAnswers`, `ticketsPerCorrect`
- Date fields: `start_at`, `end_at`, `wheel_at` (sliced to 16 chars for datetime-local)

**Location 2:** `app/dashboard/competition/[slug]/participate/ParticipationForm.tsx`
- This is NOT a competition form, it's a participation form (student-facing)
- Different purpose entirely

**Actual Issue:** Only ONE admin competition form exists, but it has inconsistent field naming:
- DB uses: `start_at`, `end_at`, `wheel_at` (timestamptz)
- Form uses: `start_at`, `end_at`, `wheel_at` (correct)
- But `rules` object structure varies between old/new schema

---

## B) DATABASE SCHEMA FIXES

### Migration 1: Fix Submissions Table

```sql
-- File: Docs/SQL/001_fix_submissions_schema.sql

-- Add missing columns to submissions table
ALTER TABLE submissions 
  ADD COLUMN IF NOT EXISTS participant_name TEXT,
  ADD COLUMN IF NOT EXISTS participant_email TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS family_name TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS proofs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tickets_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS retry_allowed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_retry BOOLEAN DEFAULT FALSE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_submissions_participant_name ON submissions(participant_name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);

-- Drop old constraint if exists and add new one
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS unique_user_question_submission;
ALTER TABLE submissions ADD CONSTRAINT unique_user_competition_submission 
  UNIQUE (participant_name, competition_id);

-- Make user_id and question_id nullable (we use participant_name and answers JSON now)
ALTER TABLE submissions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE submissions ALTER COLUMN question_id DROP NOT NULL;

-- Update existing data
UPDATE submissions 
SET status = CASE 
  WHEN final_result = 'correct' THEN 'approved'
  WHEN final_result = 'incorrect' THEN 'rejected'
  ELSE 'pending'
END
WHERE status IS NULL;

COMMENT ON COLUMN submissions.participant_name IS 'Full name of participant (used as identifier for anonymous submissions)';
COMMENT ON COLUMN submissions.answers IS 'JSON object mapping question_id to answer';
COMMENT ON COLUMN submissions.proofs IS 'JSON object mapping question_id to evidence/proof text';
COMMENT ON COLUMN submissions.status IS 'Review status: pending, under_review, approved, rejected';
COMMENT ON COLUMN submissions.tickets_earned IS 'Number of lottery tickets earned (calculated on submission)';
```

### Migration 2: Add Automatic Ticket Creation

```sql
-- File: Docs/SQL/002_auto_ticket_creation.sql

-- Function to automatically create tickets when submission is approved
CREATE OR REPLACE FUNCTION create_tickets_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create tickets when status changes to 'approved' and tickets_earned > 0
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.tickets_earned > 0 THEN
    -- Check if tickets already exist for this submission
    IF NOT EXISTS (
      SELECT 1 FROM tickets 
      WHERE user_id = NEW.user_id 
      AND competition_id = NEW.competition_id 
      AND reason = 'submission_approved'
    ) THEN
      -- Insert tickets
      INSERT INTO tickets (user_id, competition_id, count, reason)
      VALUES (
        COALESCE(NEW.user_id, (SELECT id FROM student_participants WHERE username = NEW.participant_name LIMIT 1)),
        NEW.competition_id,
        NEW.tickets_earned,
        'submission_approved'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_tickets_on_approval ON submissions;
CREATE TRIGGER trigger_create_tickets_on_approval
  AFTER UPDATE ON submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION create_tickets_on_approval();

COMMENT ON FUNCTION create_tickets_on_approval IS 'Automatically creates lottery tickets when submission is approved';
```

### Migration 3: Add Eligibility Check Function

```sql
-- File: Docs/SQL/003_eligibility_functions.sql

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
  -- Try to find user_id
  BEGIN
    v_user_id := p_user_identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If not UUID, treat as participant_name
    SELECT id INTO v_user_id 
    FROM student_participants 
    WHERE username = p_user_identifier OR display_name = p_user_identifier
    LIMIT 1;
  END;
  
  -- Count tickets
  SELECT COALESCE(SUM(count), 0) INTO v_ticket_count
  FROM tickets
  WHERE (user_id = v_user_id OR user_id IS NULL)
  AND competition_id = p_competition_id;
  
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
  -- Try to find user_id
  BEGIN
    v_user_id := p_user_identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    SELECT id INTO v_user_id 
    FROM student_participants 
    WHERE username = p_user_identifier OR display_name = p_user_identifier
    LIMIT 1;
  END;
  
  -- Count tickets
  SELECT COALESCE(SUM(count), 0) INTO v_ticket_count
  FROM tickets
  WHERE (user_id = v_user_id OR user_id IS NULL)
  AND competition_id = p_competition_id;
  
  RETURN v_ticket_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## C) API ROUTE FIXES

### Fix 1: Competition Submit Route

**File:** `app/api/competition/submit/route.ts`

**Changes:**
1. Actually insert tickets into tickets table
2. Return proper HTTP status codes
3. Add structured error responses
4. Add correlation IDs for logging

