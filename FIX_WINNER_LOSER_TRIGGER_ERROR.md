# Fix: Winner/Loser Toggle Trigger Error

## Problem
When trying to mark a submission as winner or loser, you get this error:
```
Failed to update submission: record "new" has no field "user_id"
```

## Root Cause
There's a database trigger on the `submissions` table that's trying to access a `user_id` field that doesn't exist. The `submissions` table has these fields instead:
- `participant_name`
- `participant_email`
- `reviewed_by` (references users table)

But NOT `user_id`.

## Solution

### Step 1: Run the Fix SQL Script
Open your Supabase SQL Editor and run the `FIX_SUBMISSIONS_TRIGGER.sql` file.

This will:
1. Check for problematic triggers
2. Drop any custom triggers that reference `user_id`
3. Recreate the standard `updated_at` trigger correctly
4. Verify the table structure

### Step 2: Quick Fix (If you have SQL access)
If you just want to fix it quickly, run this in Supabase SQL Editor:

```sql
-- Drop any problematic triggers
DROP TRIGGER IF EXISTS audit_submission_changes ON submissions;
DROP TRIGGER IF EXISTS log_submission_updates ON submissions;
DROP TRIGGER IF EXISTS track_submission_changes ON submissions;

-- Recreate the standard trigger
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Test the Fix
After running the SQL, try marking a submission as winner/loser again from the dashboard.

## Verification

To verify the fix worked, run this query in Supabase SQL Editor:

```sql
-- Check all triggers on submissions table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'submissions';
```

You should only see:
- `update_submissions_updated_at` trigger

## Prevention

To prevent this issue in the future:
1. Don't create custom triggers that reference non-existent columns
2. Always check the table schema before creating triggers
3. Use the correct column names:
   - Use `reviewed_by` instead of `user_id` for tracking who reviewed
   - Use `participant_email` for the participant's identity

## Related Files
- `FIX_SUBMISSIONS_TRIGGER.sql` - Complete fix script
- `app/api/submissions/mark-winner/route.ts` - API endpoint that updates submissions
- `Docs/SQL/COMPLETE_DATABASE_SCHEMA.sql` - Full schema reference

## Need Help?
If the error persists after running the fix:
1. Check the Supabase logs for more details
2. Verify RLS policies are correct (run `FIX_SUBMISSIONS_RLS_POLICY.sql`)
3. Make sure your user has CEO or LRC_MANAGER role
