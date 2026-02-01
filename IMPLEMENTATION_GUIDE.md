# PRODUCTION FIX IMPLEMENTATION GUIDE
## Step-by-Step Deployment Instructions

---

## PHASE 1: DATABASE MIGRATIONS (Run in Supabase SQL Editor)

### Step 1.1: Fix Submissions Schema
```bash
# Run this SQL file in Supabase SQL Editor
# File: Docs/SQL/001_fix_submissions_schema.sql
```

**What it does:**
- Adds missing columns: `participant_name`, `answers`, `proofs`, `score`, `total_questions`, `tickets_earned`, `status`
- Makes `user_id` and `question_id` nullable
- Creates indexes for performance
- Migrates existing `final_result` data to `status`

**Verification:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
```

### Step 1.2: Install Automatic Ticket Creation
```bash
# Run this SQL file in Supabase SQL Editor
# File: Docs/SQL/002_auto_ticket_creation.sql
```

**What it does:**
- Creates trigger function that automatically creates tickets when submission is approved
- Removes tickets when submission is rejected
- Ensures tickets table stays in sync with submission status

**Verification:**
```sql
-- Test the trigger
UPDATE submissions SET status = 'approved', tickets_earned = 5 WHERE id = '<some_id>';
SELECT * FROM tickets WHERE competition_id = '<competition_id>';
```

### Step 1.3: Install Eligibility Functions
```bash
# Run this SQL file in Supabase SQL Editor
# File: Docs/SQL/003_eligibility_functions.sql
```

**What it does:**
- Creates `is_user_eligible_for_wheel(user_identifier, competition_id)` function
- Creates `get_user_ticket_count(user_identifier, competition_id)` function
- Creates `get_user_eligibility_info(user_identifier, competition_id)` function

**Verification:**
```sql
SELECT * FROM is_user_eligible_for_wheel('participant_name', '<competition_id>');
SELECT * FROM get_user_ticket_count('participant_name', '<competition_id>');
```

---

## PHASE 2: API ROUTE FIXES

### Step 2.1: Replace Competition Submit Route

**File:** `app/api/competition/submit/route.ts`

**Action:** Replace entire file content with `route.FIXED.ts`

```bash
# Backup original
cp app/api/competition/submit/route.ts app/api/competition/submit/route.BACKUP.ts

# Replace with fixed version
cp app/api/competition/submit/route.FIXED.ts app/api/competition/submit/route.ts
```

**Key Changes:**
1. ✅ Actually creates tickets in `tickets` table
2. ✅ Returns proper HTTP status codes (400, 404, 500)
3. ✅ Structured error responses with correlation IDs
4. ✅ Validates competition is active
5. ✅ Idempotent (checks for existing submission)
6. ✅ Logs all operations with correlation ID

### Step 2.2: Create Eligibility Check API

**File:** `app/api/eligibility/check/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { participant_name, competition_id } = await request.json()
    
    if (!participant_name || !competition_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Use the eligibility function we created
    const { data, error } = await supabase
      .rpc('get_user_eligibility_info', {
        p_user_identifier: participant_name,
        p_competition_id: competition_id
      })
    
    if (error) {
      console.error('Eligibility check error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    const info = data[0] || {
      is_eligible: false,
      ticket_count: 0,
      submission_count: 0,
      approved_submissions: 0
    }
    
    return NextResponse.json({
      isEligible: info.is_eligible,
      ticketCount: info.ticket_count,
      submissionCount: info.submission_count,
      approvedSubmissions: info.approved_submissions,
      latestSubmissionStatus: info.latest_submission_status,
      latestSubmissionScore: info.latest_submission_score
    })
    
  } catch (error: any) {
    console.error('Eligibility check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## PHASE 3: FRONTEND FIXES

### Step 3.1: Fix ParticipationForm Success Message

**File:** `app/competition/[slug]/participate/ParticipationForm.tsx`

**Line 220-240:** Replace success message logic

**BEFORE:**
```typescript
const allCorrect = result.correctCount === result.totalQuestions
// Shows "you are in the wheel" based ONLY on client-side score
```

**AFTER:**
```typescript
// After submission, check actual eligibility from server
const eligibilityResponse = await fetch('/api/eligibility/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participant_name: participantName,
    competition_id: competition.id
  })
})

const eligibilityData = await eligibilityResponse.json()

setResult({
  success: true,
  correctCount,
  totalQuestions: questions.length,
  isEligible: eligibilityData.isEligible,  // ✅ Server truth
  ticketCount: eligibilityData.ticketCount
})
```

**Line 450-470:** Update success message

```typescript
{allCorrect ? (
  <>
    🌟 رائع! أجبت على جميع الأسئلة بشكل صحيح!<br/>
    {result.isEligible ? (
      <>✨ اسمك الآن في عجلة الحظ! 🎡<br/>
      لديك {result.ticketCount} تذكرة 🎟️</>
    ) : (
      <>⏳ في انتظار مراجعة الإدارة</>
    )}
  </>
) : (
  // ... existing code
)}
```

### Step 3.2: Add Question Creation Button

**File:** `app/dashboard/competitions/[id]/questions/CompetitionQuestions.tsx`

**Line 60:** Add new button in header

```typescript
<div className="flex items-center gap-3">
  <button
    onClick={() => setShowCreateModal(true)}  // NEW
    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    + سؤال جديد
  </button>
  <button
    onClick={() => handleAddQuestions('library')}
    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
  >
    + من المكتبة
  </button>
  <button
    onClick={() => handleAddQuestions('training')}
    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
  >
    + من التدريب
  </button>
</div>
```

**Add state and modal:**

```typescript
const [showCreateModal, setShowCreateModal] = useState(false)
const [newQuestion, setNewQuestion] = useState({
  question_text: '',
  type: 'mcq' as 'mcq' | 'true_false' | 'text',
  correct_answer: '',
  options: ['', '', '', ''],
  volume: '',
  page: '',
  line_from: '',
  line_to: '',
  attachToCompetition: true
})

const handleCreateQuestion = async () => {
  // Validation
  if (!newQuestion.question_text.trim()) {
    alert('يرجى إدخال نص السؤال')
    return
  }
  
  try {
    // Create in library
    const response = await fetch('/api/questions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newQuestion,
        competition_id: newQuestion.attachToCompetition ? competitionId : null,
        status: newQuestion.attachToCompetition ? 'PUBLISHED' : 'DRAFT',
        is_training: false
      })
    })
    
    if (!response.ok) throw new Error('Failed to create question')
    
    setShowCreateModal(false)
    await loadData()
    alert('تم إنشاء السؤال بنجاح')
  } catch (error) {
    console.error('Failed to create question:', error)
    alert('فشل إنشاء السؤال')
  }
}
```

---

## PHASE 4: TESTING CHECKLIST

### Test Case 1: Submission Flow
1. ✅ Student submits answers
2. ✅ API returns correct `ticketsEarned` value
3. ✅ Submission record created with `status='pending'`
4. ✅ NO tickets created yet (pending review)
5. ✅ Student sees "awaiting review" message

### Test Case 2: Admin Accept Flow
1. ✅ Admin opens submission in dashboard
2. ✅ Admin clicks "Accept"
3. ✅ Submission `status` changes to `'approved'`
4. ✅ Trigger automatically creates tickets
5. ✅ Verify tickets table has new row
6. ✅ Student now shows as eligible in wheel

### Test Case 3: Eligibility Check
1. ✅ Call `/api/eligibility/check` with participant_name
2. ✅ Returns `isEligible: true` if tickets > 0
3. ✅ Returns `ticketCount` matching tickets table
4. ✅ Frontend shows correct eligibility status

### Test Case 4: Wheel Selection
1. ✅ Admin opens wheel management
2. ✅ Eligible students list shows only those with tickets
3. ✅ Ticket counts match database
4. ✅ Winner selection works correctly

### Test Case 5: Question Creation
1. ✅ Admin clicks "+ سؤال جديد"
2. ✅ Modal opens with form
3. ✅ Fill in question details
4. ✅ Toggle "Attach to competition" ON
5. ✅ Save creates question in library AND attaches to competition
6. ✅ Question appears in competition list immediately

---

## PHASE 5: VERIFICATION QUERIES

Run these in Supabase SQL Editor to verify everything works:

```sql
-- 1. Check submissions have all required columns
SELECT 
  id,
  participant_name,
  score,
  total_questions,
  tickets_earned,
  status,
  submitted_at
FROM submissions
ORDER BY submitted_at DESC
LIMIT 5;

-- 2. Check tickets are created for approved submissions
SELECT 
  s.participant_name,
  s.status,
  s.tickets_earned,
  t.count AS actual_tickets,
  t.reason
FROM submissions s
LEFT JOIN tickets t ON t.competition_id = s.competition_id
WHERE s.status = 'approved'
ORDER BY s.submitted_at DESC;

-- 3. Check eligibility function works
SELECT * FROM get_user_eligibility_info(
  'participant_full_name',
  '<competition_id>'
);

-- 4. Verify trigger is installed
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_tickets_on_approval';
```

---

## ROLLBACK PLAN

If something goes wrong:

```sql
-- Rollback Migration 002 (remove trigger)
DROP TRIGGER IF EXISTS trigger_create_tickets_on_approval ON submissions;
DROP FUNCTION IF EXISTS create_tickets_on_approval();

-- Rollback Migration 001 (remove columns)
ALTER TABLE submissions 
  DROP COLUMN IF EXISTS participant_name,
  DROP COLUMN IF EXISTS answers,
  DROP COLUMN IF EXISTS proofs,
  DROP COLUMN IF EXISTS score,
  DROP COLUMN IF EXISTS total_questions,
  DROP COLUMN IF EXISTS tickets_earned,
  DROP COLUMN IF EXISTS status;

-- Restore API route
cp app/api/competition/submit/route.BACKUP.ts app/api/competition/submit/route.ts
```

---

## MONITORING

After deployment, monitor these metrics:

1. **Submission Success Rate:**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'pending') AS pending,
     COUNT(*) FILTER (WHERE status = 'approved') AS approved,
     COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
   FROM submissions
   WHERE submitted_at > NOW() - INTERVAL '24 hours';
   ```

2. **Ticket Creation Rate:**
   ```sql
   SELECT 
     COUNT(DISTINCT s.id) AS approved_submissions,
     COUNT(DISTINCT t.id) AS tickets_created,
     COUNT(DISTINCT t.id)::FLOAT / NULLIF(COUNT(DISTINCT s.id), 0) AS creation_rate
   FROM submissions s
   LEFT JOIN tickets t ON t.reason LIKE 'submission_%'
   WHERE s.status = 'approved'
   AND s.submitted_at > NOW() - INTERVAL '24 hours';
   ```

3. **API Error Rate:**
   - Check application logs for correlation IDs
   - Monitor 4xx and 5xx responses
   - Alert if error rate > 5%

---

## SUPPORT CONTACTS

- Database Issues: Check Supabase logs
- API Issues: Check Next.js server logs
- Frontend Issues: Check browser console

**Correlation ID Format:** UUID v4 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

Use correlation ID to trace requests across logs.
