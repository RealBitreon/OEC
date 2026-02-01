# Debugging Submission 500 Error

## Issue
Users getting "فشل إرسال الإجابات" (Failed to submit answers) with HTTP 500 error.

## Changes Made
Added comprehensive logging at every step to identify the exact failure point.

## How to Debug in Production

### 1. Check Vercel Logs
Go to: https://vercel.com/realbitreon/oec/logs

Look for these log entries when a user submits:

```
[SUBMIT] Sending submission: { competition_id, participant_name, ... }
[SUBMIT] Response status: 500
[SUBMIT] Error response: { ... }
```

And on the server side:

```
[<correlationId>] Submission request received: { ... }
[<correlationId>] Fetching questions for competition: <id>
[<correlationId>] Questions fetched: { count, error }
[<correlationId>] Creating submission: { id, score, ... }
[<correlationId>] Failed to create submission: { error, code, message, details, hint }
```

### 2. Identify the Failure Point

The logs will show exactly where it fails:

**A) Questions Fetch Failed**
```
[<correlationId>] Questions fetched: { count: 0, error: "..." }
```
- **Cause**: No questions found or database error
- **Fix**: Check if competition has active questions

**B) Submission Insert Failed**
```
[<correlationId>] Failed to create submission: { 
  code: "23505",  // Duplicate key
  message: "...",
  details: "Key (id)=(...) already exists"
}
```
- **Cause**: Duplicate submission ID (very rare)
- **Fix**: Already handled with idempotency check

**C) Database Schema Mismatch**
```
[<correlationId>] Failed to create submission: { 
  code: "42703",  // Column doesn't exist
  message: "column \"...\" does not exist"
}
```
- **Cause**: Database schema out of sync
- **Fix**: Run migration scripts

**D) RLS Policy Blocking**
```
[<correlationId>] Failed to create submission: { 
  code: "42501",  // Insufficient privilege
  message: "new row violates row-level security policy"
}
```
- **Cause**: RLS policy blocking service role
- **Fix**: Check Supabase RLS policies on submissions table

### 3. Common Causes & Fixes

#### Cause 1: Missing `is_active` Column on Questions
**Error**: `column "is_active" does not exist`

**Fix**:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE questions SET is_active = true WHERE is_active IS NULL;
```

#### Cause 2: Missing Columns on Submissions Table
**Error**: `column "first_name" does not exist`

**Fix**:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;
```

#### Cause 3: RLS Policy Too Restrictive
**Error**: `new row violates row-level security policy`

**Fix**:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'submissions';

-- Allow service role to insert (if not already allowed)
CREATE POLICY "Service role can insert submissions"
ON submissions
FOR INSERT
TO service_role
USING (true)
WITH CHECK (true);
```

#### Cause 4: No Questions in Competition
**Error**: No error, but `questions.length === 0`

**Fix**: Add questions to the competition in dashboard

### 4. Test Locally

To reproduce the error locally:

```bash
# 1. Build production version
npm run build

# 2. Start production server
npm start

# 3. Open browser console and try to submit
# Check console for detailed logs

# 4. Check terminal for server-side logs
```

### 5. Quick Verification

Run this in Supabase SQL Editor to check schema:

```sql
-- Check submissions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- Check questions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'questions'
ORDER BY ordinal_position;

-- Check if competition has questions
SELECT 
  c.id,
  c.title,
  c.status,
  COUNT(q.id) as question_count
FROM competitions c
LEFT JOIN questions q ON q.competition_id = c.id AND q.is_active = true
WHERE c.status = 'active'
GROUP BY c.id, c.title, c.status;
```

## Expected Log Flow (Success)

```
[SUBMIT] Sending submission: { competition_id: "...", participant_name: "...", answersCount: 5, proofsCount: 5, score: 5, total_questions: 5 }

[abc-123-def] Submission request received: { competition_id: "...", participant_name: "...", answersCount: 5, proofsCount: 5 }
[abc-123-def] Fetching questions for competition: ...
[abc-123-def] Questions fetched: { count: 5, error: undefined }
[abc-123-def] Creating submission: { id: "...", competition_id: "...", participant_name: "...", score: 5, totalQuestions: 5, ticketsEarned: 1 }
[abc-123-def] Submission created successfully: ..., score: 5/5, tickets: 1

[SUBMIT] Response status: 200
[SUBMIT] Success: { ok: true, submission: { ... }, correlationId: "abc-123-def" }
```

## Next Steps

1. **Deploy** (already done - commit 2f8b032)
2. **Wait for user to submit** and reproduce the error
3. **Check Vercel logs** immediately after error
4. **Identify the exact failure point** from logs
5. **Apply the appropriate fix** based on the error code/message

## Rollback (if needed)

```bash
git revert 2f8b032
git push
```

---
**Status**: ✅ Deployed with comprehensive logging
**Commit**: 2f8b032
**Next**: Monitor Vercel logs for the exact error
