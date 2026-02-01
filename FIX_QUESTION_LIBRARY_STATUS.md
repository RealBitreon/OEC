# 🔧 Fix: Question Library Not Showing Added Questions

## Problem
Questions added to the library are being saved but not showing up in the list.

## Root Cause
The `status` column is missing from the `questions` table in the database. The application code expects this column to filter between:
- **DRAFT** questions (library - not visible to students)
- **PUBLISHED** questions (training/competition - visible to students)

## Solution

### Step 1: Run the Migration
Execute this SQL in your Supabase SQL Editor:

```sql
-- Add status column
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED'
CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Update existing questions
UPDATE questions
SET status = CASE
  WHEN is_training = true AND competition_id IS NULL THEN 'PUBLISHED'
  WHEN competition_id IS NOT NULL THEN 'PUBLISHED'
  WHEN is_training = false AND competition_id IS NULL THEN 'DRAFT'
  ELSE 'PUBLISHED'
END;
```

### Step 2: Verify the Migration
Run this query to check:

```sql
SELECT 
  status,
  is_training,
  competition_id IS NULL as is_standalone,
  COUNT(*) as count
FROM questions
GROUP BY status, is_training, competition_id IS NULL
ORDER BY status, is_training;
```

Expected results:
- DRAFT questions: `is_training = false`, `competition_id = NULL`
- PUBLISHED questions: `is_training = true` OR `competition_id IS NOT NULL`

### Step 3: Test the Fix
1. Go to Dashboard → Question Library
2. Click "Add Question"
3. Select "Save to Library (Draft)"
4. Fill in the question details
5. Save
6. **The question should now appear in the library list**

## How It Works

### Question States:

```
┌─────────────────────────────────────────────────────────┐
│                    QUESTION STATES                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📚 LIBRARY (DRAFT)                                     │
│  - status = 'DRAFT'                                     │
│  - is_training = false                                  │
│  - competition_id = NULL                                │
│  - NOT visible to students                              │
│                                                          │
│  ✅ TRAINING (PUBLISHED)                                │
│  - status = 'PUBLISHED'                                 │
│  - is_training = true                                   │
│  - competition_id = NULL                                │
│  - Visible to all students                              │
│                                                          │
│  🏆 COMPETITION (PUBLISHED)                             │
│  - status = 'PUBLISHED'                                 │
│  - is_training = false                                  │
│  - competition_id = [competition UUID]                  │
│  - Visible in specific competition                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Filtering Logic:

**Question Library Page** (`mode = 'bank'`):
```typescript
// Shows: DRAFT questions with competition_id = NULL and is_training = false
questionsData = result.questions.filter(
  q => q.competition_id === null && q.status === 'DRAFT'
)
```

**Training Questions Page** (`mode = 'training'`):
```typescript
// Shows: PUBLISHED questions with is_training = true and competition_id = NULL
questionsData = result.questions.filter(
  q => q.competition_id === null && q.status === 'PUBLISHED'
)
```

## Code Changes Made

### 1. `app/dashboard/components/sections/QuestionsManagement.tsx`
Fixed the initial form state to use the correct status based on mode:

```typescript
// Before:
status: question?.status ?? 'PUBLISHED',

// After:
status: question?.status ?? (mode === 'bank' ? 'DRAFT' : 'PUBLISHED'),
```

## Files

- **Migration SQL**: `Docs/SQL/add_status_column.sql`
- **This Guide**: `FIX_QUESTION_LIBRARY_STATUS.md`

## Quick Commands

### Run Migration (Supabase CLI):
```bash
supabase db push Docs/SQL/add_status_column.sql
```

### Or copy/paste in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Paste the SQL from `Docs/SQL/add_status_column.sql`
3. Click "Run"

## Verification Checklist

After running the migration:

- [ ] Status column exists in questions table
- [ ] Existing questions have correct status values
- [ ] New library questions save with status = 'DRAFT'
- [ ] New training questions save with status = 'PUBLISHED'
- [ ] Library page shows DRAFT questions
- [ ] Training page shows PUBLISHED questions
- [ ] Students cannot see DRAFT questions
- [ ] Students can see PUBLISHED questions

## Troubleshooting

### Questions still not showing?
1. Check browser console for errors
2. Verify the status column exists: `\d questions` in psql
3. Check question status: `SELECT id, question_text, status, is_training, competition_id FROM questions;`
4. Clear browser cache and reload

### Wrong questions showing?
Run the UPDATE query again to fix status values:
```sql
UPDATE questions
SET status = CASE
  WHEN is_training = true AND competition_id IS NULL THEN 'PUBLISHED'
  WHEN competition_id IS NOT NULL THEN 'PUBLISHED'
  WHEN is_training = false AND competition_id IS NULL THEN 'DRAFT'
  ELSE 'PUBLISHED'
END;
```

---

**Status**: ✅ Code fixed, migration ready  
**Action Required**: Run the SQL migration in Supabase  
**Impact**: Low - only adds a column, no data loss
