-- تحديث جدول submissions لدعم التحسينات الجديدة
-- Update submissions table to support new improvements

-- إضافة حقول الاسم الثلاثي
-- Add three-part name fields
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT;

-- إضافة حقل الصف الدراسي
-- Add grade field
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS grade TEXT;

-- إضافة حقل الأدلة (JSON)
-- Add proofs field (JSON)
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS proofs JSONB;

-- إضافة حقل التذاكر المكتسبة
-- Add tickets earned field
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS tickets_earned INTEGER DEFAULT 0;

-- إضافة حقول نظام إعادة المحاولة
-- Add retry system fields
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS retry_allowed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_retry BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS previous_submission_id UUID REFERENCES submissions(id),
ADD COLUMN IF NOT EXISTS retried BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS new_submission_id UUID REFERENCES submissions(id);

-- إضافة تعليقات على الأعمدة
-- Add column comments
COMMENT ON COLUMN submissions.first_name IS 'الاسم الأول للطالب';
COMMENT ON COLUMN submissions.father_name IS 'اسم الأب';
COMMENT ON COLUMN submissions.family_name IS 'القبيلة أو اسم العائلة';
COMMENT ON COLUMN submissions.grade IS 'الصف الدراسي (1-12)';
COMMENT ON COLUMN submissions.proofs IS 'الأدلة على الإجابات بصيغة JSON {question_id: proof_text}';
COMMENT ON COLUMN submissions.tickets_earned IS 'عدد التذاكر المكتسبة من هذه المشاركة';
COMMENT ON COLUMN submissions.retry_allowed IS 'هل يسمح للطالب بإعادة المحاولة';
COMMENT ON COLUMN submissions.is_retry IS 'هل هذه محاولة إعادة';
COMMENT ON COLUMN submissions.previous_submission_id IS 'معرف المحاولة السابقة إذا كانت إعادة';
COMMENT ON COLUMN submissions.retried IS 'هل تم إعادة المحاولة بعد هذه المشاركة';
COMMENT ON COLUMN submissions.new_submission_id IS 'معرف المحاولة الجديدة إذا تم إعادة المحاولة';

-- إنشاء فهرس للبحث السريع
-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_submissions_first_name ON submissions(first_name);
CREATE INDEX IF NOT EXISTS idx_submissions_father_name ON submissions(father_name);
CREATE INDEX IF NOT EXISTS idx_submissions_family_name ON submissions(family_name);
CREATE INDEX IF NOT EXISTS idx_submissions_grade ON submissions(grade);
CREATE INDEX IF NOT EXISTS idx_submissions_retry_allowed ON submissions(retry_allowed);
CREATE INDEX IF NOT EXISTS idx_submissions_is_retry ON submissions(is_retry);

-- إنشاء فهرس مركب للبحث عن المشاركات السابقة
-- Create composite index for finding previous submissions
CREATE INDEX IF NOT EXISTS idx_submissions_participant_competition 
ON submissions(competition_id, first_name, father_name, family_name);

-- إنشاء دالة للتحقق من المشاركات السابقة
-- Create function to check for previous submissions
CREATE OR REPLACE FUNCTION check_previous_submission(
  p_competition_id UUID,
  p_first_name TEXT,
  p_father_name TEXT,
  p_family_name TEXT
)
RETURNS TABLE (
  has_previous BOOLEAN,
  retry_allowed BOOLEAN,
  previous_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM submissions 
           WHERE competition_id = p_competition_id 
           AND first_name = p_first_name 
           AND father_name = p_father_name 
           AND family_name = p_family_name) as has_previous,
    COALESCE((SELECT s.retry_allowed FROM submissions s
              WHERE s.competition_id = p_competition_id 
              AND s.first_name = p_first_name 
              AND s.father_name = p_father_name 
              AND s.family_name = p_family_name
              ORDER BY s.submitted_at DESC
              LIMIT 1), FALSE) as retry_allowed,
    (SELECT s.id FROM submissions s
     WHERE s.competition_id = p_competition_id 
     AND s.first_name = p_first_name 
     AND s.father_name = p_father_name 
     AND s.family_name = p_family_name
     ORDER BY s.submitted_at DESC
     LIMIT 1) as previous_id;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة لحساب التذاكر
-- Create function to calculate tickets
CREATE OR REPLACE FUNCTION calculate_tickets(
  p_score INTEGER,
  p_total_questions INTEGER,
  p_rules JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_eligibility_mode TEXT;
  v_min_correct INTEGER;
  v_tickets_per_correct INTEGER;
  v_tickets INTEGER := 0;
BEGIN
  -- استخراج القواعد
  v_eligibility_mode := p_rules->>'eligibilityMode';
  v_min_correct := COALESCE((p_rules->>'minCorrectAnswers')::INTEGER, 0);
  v_tickets_per_correct := COALESCE((p_rules->>'ticketsPerCorrect')::INTEGER, 1);
  
  -- حساب التذاكر بناءً على النظام
  IF v_eligibility_mode = 'all_correct' THEN
    -- يجب الإجابة على جميع الأسئلة بشكل صحيح
    IF p_score = p_total_questions THEN
      v_tickets := p_score * v_tickets_per_correct;
    END IF;
  ELSIF v_eligibility_mode = 'min_correct' THEN
    -- يجب الإجابة على الحد الأدنى بشكل صحيح
    IF p_score >= v_min_correct THEN
      v_tickets := p_score * v_tickets_per_correct;
    END IF;
  END IF;
  
  RETURN v_tickets;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث التذاكر تلقائياً
-- Create trigger to update tickets automatically
CREATE OR REPLACE FUNCTION update_tickets_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_competition_rules JSONB;
BEGIN
  -- الحصول على قواعد المسابقة
  SELECT rules INTO v_competition_rules
  FROM competitions
  WHERE id = NEW.competition_id;
  
  -- حساب التذاكر
  NEW.tickets_earned := calculate_tickets(
    NEW.score,
    NEW.total_questions,
    v_competition_rules
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط الـ trigger بالجدول
-- Attach trigger to table
DROP TRIGGER IF EXISTS trigger_update_tickets ON submissions;
CREATE TRIGGER trigger_update_tickets
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_on_submission();

-- إنشاء view لعرض المشاركات مع التفاصيل الكاملة
-- Create view for submissions with full details
CREATE OR REPLACE VIEW submissions_detailed AS
SELECT 
  s.id,
  s.competition_id,
  c.title as competition_title,
  s.first_name,
  s.father_name,
  s.family_name,
  s.first_name || ' ' || s.father_name || ' ' || s.family_name as full_name,
  s.grade,
  s.answers,
  s.proofs,
  s.score,
  s.total_questions,
  s.tickets_earned,
  s.submitted_at,
  s.status,
  s.retry_allowed,
  s.is_retry,
  s.retried,
  CASE 
    WHEN s.is_retry THEN 'إعادة محاولة'
    WHEN s.retried THEN 'تمت إعادة المحاولة'
    ELSE 'محاولة أولى'
  END as attempt_status
FROM submissions s
LEFT JOIN competitions c ON s.competition_id = c.id;

-- منح الصلاحيات
-- Grant permissions
GRANT SELECT ON submissions_detailed TO authenticated;
GRANT EXECUTE ON FUNCTION check_previous_submission TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_tickets TO authenticated;

-- إضافة سياسات الأمان (RLS)
-- Add Row Level Security policies
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: يمكن للجميع قراءة المشاركات
-- Read policy: Everyone can read submissions
CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- سياسة الإدراج: يمكن للجميع إضافة مشاركة
-- Insert policy: Everyone can insert submissions
CREATE POLICY "Anyone can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- سياسة التحديث: فقط المدراء يمكنهم تحديث المشاركات
-- Update policy: Only managers can update submissions
CREATE POLICY "Only managers can update submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );

-- إنشاء جدول لتتبع محاولات المشاركة
-- Create table to track participation attempts
CREATE TABLE IF NOT EXISTS participation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT
);

-- إنشاء فهرس لجدول المحاولات
-- Create index for attempts table
CREATE INDEX IF NOT EXISTS idx_attempts_competition ON participation_attempts(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempts_participant ON participation_attempts(first_name, father_name, family_name);
CREATE INDEX IF NOT EXISTS idx_attempts_time ON participation_attempts(attempt_at);

-- منح الصلاحيات لجدول المحاولات
-- Grant permissions for attempts table
GRANT SELECT, INSERT ON participation_attempts TO authenticated;

COMMENT ON TABLE participation_attempts IS 'سجل محاولات المشاركة في المسابقات';
