-- ============================================================================
-- QUESTION LIBRARY & TRAINING QUESTIONS MIGRATION
-- ============================================================================
-- This migration adds the status field and enforces the proper question flow:
-- 1. Question Library (Draft): status='DRAFT', is_training=false, competition_id=NULL
-- 2. Training Questions: status='PUBLISHED', is_training=true, competition_id=NULL
-- 3. Competition Questions: competition_id=<uuid>, is_training=false, status varies
-- ============================================================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'status'
    ) THEN
        ALTER TABLE questions 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'PUBLISHED'));
    END IF;
END $$;

-- Update existing questions to have proper status
-- Training questions should be PUBLISHED
UPDATE questions 
SET status = 'PUBLISHED' 
WHERE is_training = true AND status = 'DRAFT';

-- Competition questions should be PUBLISHED
UPDATE questions 
SET status = 'PUBLISHED' 
WHERE competition_id IS NOT NULL AND status = 'DRAFT';

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Add comment to table
COMMENT ON COLUMN questions.status IS 'DRAFT = Library (stored), PUBLISHED = Training or Competition';
COMMENT ON COLUMN questions.is_training IS 'true = Training Question, false = Library or Competition';
COMMENT ON COLUMN questions.competition_id IS 'NULL = Library or Training, UUID = Competition Question';

-- ============================================================================
-- RLS POLICIES UPDATE
-- ============================================================================
-- Ensure proper access control for question management

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;
DROP POLICY IF EXISTS "questions_delete_policy" ON questions;

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow public to view published training questions
CREATE POLICY "questions_select_public" ON questions
    FOR SELECT
    USING (
        is_training = true 
        AND status = 'PUBLISHED' 
        AND competition_id IS NULL
        AND is_active = true
    );

-- Allow authenticated users to view their competition questions
CREATE POLICY "questions_select_authenticated" ON questions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow only CEO and LRC_MANAGER to insert questions
CREATE POLICY "questions_insert_policy" ON questions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
        -- Enforce: Library/Training questions must have competition_id = NULL
        AND (
            competition_id IS NULL 
            OR EXISTS (
                SELECT 1 FROM competitions 
                WHERE competitions.id = competition_id
            )
        )
    );

-- Allow only CEO and LRC_MANAGER to update questions
CREATE POLICY "questions_update_policy" ON questions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- Allow only CEO and LRC_MANAGER to delete questions
CREATE POLICY "questions_delete_policy" ON questions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to move question to library
CREATE OR REPLACE FUNCTION move_question_to_library(question_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE questions
    SET 
        status = 'DRAFT',
        is_training = false,
        competition_id = NULL,
        updated_at = NOW()
    WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish question to training
CREATE OR REPLACE FUNCTION publish_question_to_training(question_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE questions
    SET 
        status = 'PUBLISHED',
        is_training = true,
        competition_id = NULL,
        updated_at = NOW()
    WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add question to competition (creates a copy)
CREATE OR REPLACE FUNCTION add_question_to_competition(
    source_question_id UUID,
    target_competition_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_question_id UUID;
BEGIN
    INSERT INTO questions (
        competition_id,
        is_training,
        status,
        type,
        category,
        difficulty,
        question_text,
        options,
        correct_answer,
        volume,
        page,
        line_from,
        line_to,
        is_active
    )
    SELECT
        target_competition_id,
        false,
        'PUBLISHED',
        type,
        category,
        difficulty,
        question_text,
        options,
        correct_answer,
        volume,
        page,
        line_from,
        line_to,
        is_active
    FROM questions
    WHERE id = source_question_id
    RETURNING id INTO new_question_id;
    
    RETURN new_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration worked correctly

-- Count questions by type
-- SELECT 
--     CASE 
--         WHEN competition_id IS NOT NULL THEN 'Competition'
--         WHEN is_training = true AND competition_id IS NULL THEN 'Training'
--         WHEN is_training = false AND competition_id IS NULL THEN 'Library'
--     END as question_type,
--     status,
--     COUNT(*) as count
-- FROM questions
-- GROUP BY question_type, status
-- ORDER BY question_type, status;
