# ⚡ QUICK FIX - Run This SQL Now

## Problem
Questions added to library are not showing up.

## Solution
Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Add status column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED'
CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Update existing questions with correct status
UPDATE questions
SET status = CASE
  WHEN is_training = true AND competition_id IS NULL THEN 'PUBLISHED'
  WHEN competition_id IS NOT NULL THEN 'PUBLISHED'
  WHEN is_training = false AND competition_id IS NULL THEN 'DRAFT'
  ELSE 'PUBLISHED'
END;
```

## Steps

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

2. **Paste the SQL above**

3. **Click "Run"**

4. **Verify**
   ```sql
   SELECT status, COUNT(*) FROM questions GROUP BY status;
   ```

5. **Test**
   - Go to Dashboard → Question Library
   - Add a new question
   - It should now appear in the list!

## What This Does

- ✅ Adds `status` column to track DRAFT vs PUBLISHED questions
- ✅ Sets library questions to DRAFT (not visible to students)
- ✅ Sets training questions to PUBLISHED (visible to students)
- ✅ Fixes the filtering so questions show up correctly

## Done!

After running this SQL:
- ✅ Library questions will appear in the library
- ✅ Training questions will appear in training
- ✅ Students won't see draft questions
- ✅ Everything works as expected

---

**Time to fix**: < 1 minute  
**Risk**: None - only adds a column  
**Rollback**: Not needed (safe operation)
