# Winners Feature Fix

## Problem
The `wheel_winners` table doesn't exist in your database, causing the winners API to fail.

## Solution
Use the `is_winner` column in the `submissions` table instead.

## Steps to Fix

### 1. Run the SQL Migration

In your Supabase SQL Editor, run:

```sql
-- Add is_winner column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_submissions_is_winner 
ON submissions(is_winner) 
WHERE is_winner = true;

-- Add comment
COMMENT ON COLUMN submissions.is_winner IS 'Indicates if this submission won a prize in the wheel spin';
```

Or simply run the file:
```
Docs/SQL/add_is_winner_column.sql
```

### 2. Verify the Column Was Added

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'submissions' 
  AND column_name = 'is_winner';

-- Should return:
-- column_name | data_type | is_nullable | column_default
-- is_winner   | boolean   | YES         | false
```

### 3. Test the API

The winners API route has been updated to:
- Use `submissions.is_winner` column
- Return graceful error if column doesn't exist yet
- Show helpful message about running migration

Test it:
```bash
curl http://localhost:3000/api/winners
```

Expected response (before migration):
```json
{
  "winners": [],
  "message": "Winners feature not yet configured. Run add_is_winner_column.sql migration."
}
```

Expected response (after migration):
```json
{
  "winners": []
}
```

### 4. Mark Winners (When Needed)

When you run the wheel spin and select winners, update their submissions:

```sql
-- Mark a submission as winner
UPDATE submissions
SET is_winner = true
WHERE id = 'submission-id-here';

-- Or mark multiple winners
UPDATE submissions
SET is_winner = true
WHERE id IN ('id1', 'id2', 'id3');
```

## How It Works Now

### Before (Broken)
```
API → Query wheel_winners table → ❌ Table doesn't exist → Error
```

### After (Fixed)
```
API → Query submissions.is_winner → ✅ Column exists → Returns winners
```

## Files Changed

- ✅ `app/api/winners/route.ts` - Changed from `wheel_winners` to `submissions.is_winner`
- ✅ `Docs/SQL/add_is_winner_column.sql` - Removed wheel_winners dependency

## Testing Checklist

- [ ] Run SQL migration to add `is_winner` column
- [ ] Verify column exists in database
- [ ] Test `/api/winners` endpoint
- [ ] Dashboard loads without errors
- [ ] No "relation does not exist" errors in logs

## Alternative: Create wheel_winners Table

If you prefer a separate table for winners (more normalized), create it:

```sql
CREATE TABLE wheel_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prize_name TEXT,
  prize_value NUMERIC,
  won_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id)
);

CREATE INDEX idx_wheel_winners_competition ON wheel_winners(competition_id);
CREATE INDEX idx_wheel_winners_user ON wheel_winners(user_id);
CREATE INDEX idx_wheel_winners_won_at ON wheel_winners(won_at DESC);
```

Then update `app/api/winners/route.ts` to query this table instead.

## Recommendation

**Use the `is_winner` column approach** (current fix) because:
- ✅ Simpler - no new table needed
- ✅ Faster - one less JOIN
- ✅ Sufficient for basic winner tracking
- ✅ Already implemented

Only create `wheel_winners` table if you need:
- Detailed prize information per winner
- Multiple prizes per submission
- Historical prize data
- Complex winner analytics

---

**Status**: Fixed ✅  
**Next**: Run the SQL migration and test
