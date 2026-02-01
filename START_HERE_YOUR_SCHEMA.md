# 🚀 START HERE - For Your Database Schema

## ⚠️ YOUR SITUATION

You have a **different database schema** than the standard setup. Your `submissions` table doesn't have a `user_id` column.

**Error you saw:**
```
ERROR: 42703: column "user_id" of relation "submissions" does not exist
```

## ✅ SOLUTION - Use Adaptive Migrations

I've created **adaptive versions** that check your schema before making changes.

---

## 📋 STEP-BY-STEP FIX

### STEP 1: Check Your Current Schema (Optional)
```sql
-- Run this in Supabase SQL Editor to see what you have
-- File: CHECK_CURRENT_SCHEMA.sql
```

This shows you all columns, constraints, and indexes in your `submissions` table.

---

### STEP 2: Run Adaptive Migration 001
```sql
-- Run this in Supabase SQL Editor
-- File: Docs/SQL/001_fix_submissions_schema_ADAPTIVE.sql
```

**What it does:**
- ✅ Checks if each column exists before adding it
- ✅ Handles missing `user_id` column gracefully
- ✅ Removes duplicates (keeps most recent)
- ✅ Adds all required columns for the system to work

**Expected output:**
```
NOTICE: ✅ All required columns added or already exist
NOTICE: ✅ Status constraint added
NOTICE: ✅ Removed X duplicate submissions
NOTICE: ✅ Unique constraint added
NOTICE: ✅ Migration 001 completed
```

---

### STEP 3: Run Updated Migration 002
```sql
-- Run this in Supabase SQL Editor
-- File: Docs/SQL/002_auto_ticket_creation.sql (UPDATED)
```

**What it does:**
- ✅ Checks if `user_id` column exists before using it
- ✅ Creates tickets automatically when submission approved
- ✅ Works with or without `user_id` column

**Expected output:**
```
NOTICE: ✅ Migration 002 completed: Automatic ticket creation trigger installed
```

---

### STEP 4: Run Migration 003
```sql
-- Run this in Supabase SQL Editor
-- File: Docs/SQL/003_eligibility_functions.sql
```

**What it does:**
- ✅ Creates eligibility check functions
- ✅ Single source of truth for "is user in wheel?"

**Expected output:**
```
NOTICE: ✅ Migration 003 completed: Eligibility functions created
```

---

### STEP 5: Verify Everything Works
```sql
-- Check that all columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
AND column_name IN ('participant_name', 'status', 'tickets_earned', 'score', 'answers');
-- Should return 5 rows

-- Check trigger is installed
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_tickets_on_approval';
-- Should return 1 row

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('is_user_eligible_for_wheel', 'get_user_ticket_count');
-- Should return 2 rows
```

---

## 🔧 WHAT'S DIFFERENT IN YOUR SCHEMA?

**Standard Schema (from docs):**
```sql
CREATE TABLE submissions (
  user_id UUID NOT NULL,      -- ❌ You don't have this
  question_id UUID NOT NULL,  -- ❌ You might not have this
  ...
)
```

**Your Schema (detected):**
```sql
CREATE TABLE submissions (
  -- Different structure
  -- Likely has: id, competition_id, participant_name, submitted_at, etc.
)
```

**Adaptive migrations handle both!** ✅

---

## 📊 AFTER MIGRATIONS - VERIFY

Run this to see your updated schema:
```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;
```

**You should now have:**
- ✅ `participant_name` (TEXT)
- ✅ `participant_email` (TEXT)
- ✅ `first_name` (TEXT)
- ✅ `father_name` (TEXT)
- ✅ `family_name` (TEXT)
- ✅ `grade` (TEXT)
- ✅ `answers` (JSONB)
- ✅ `proofs` (JSONB)
- ✅ `score` (INTEGER)
- ✅ `total_questions` (INTEGER)
- ✅ `tickets_earned` (INTEGER)
- ✅ `status` (TEXT with CHECK constraint)
- ✅ `retry_allowed` (BOOLEAN)
- ✅ `is_retry` (BOOLEAN)
- ✅ `review_notes` (TEXT)

---

## 🚀 NEXT STEPS - Deploy Code

After migrations succeed:

1. **Replace API route:**
   ```bash
   cp app/api/competition/submit/route.FIXED.ts app/api/competition/submit/route.ts
   ```

2. **Create eligibility check API:**
   - Create file: `app/api/eligibility/check/route.ts`
   - Copy code from `CODE_PATCHES.md` PATCH 5

3. **Update frontend:**
   - Apply patches from `CODE_PATCHES.md` to:
     - `app/competition/[slug]/participate/ParticipationForm.tsx`
     - `app/dashboard/competitions/[id]/questions/CompetitionQuestions.tsx`

4. **Test the system:**
   - Create a competition ✅
   - Student submits answers ✅
   - Admin reviews and approves ✅
   - Tickets created automatically ✅
   - Student appears in wheel ✅

---

## 🆘 IF YOU STILL GET ERRORS

**Error: "column X does not exist"**
- Run `CHECK_CURRENT_SCHEMA.sql` to see what you actually have
- Share the output with me
- I'll create a custom migration for your exact schema

**Error: "constraint already exists"**
- The adaptive migration handles this
- It drops existing constraints before adding new ones

**Error: "trigger already exists"**
- Run: `DROP TRIGGER IF EXISTS trigger_create_tickets_on_approval ON submissions;`
- Then run migration 002 again

---

## 📁 FILES TO USE (IN ORDER)

1. ✅ `CHECK_CURRENT_SCHEMA.sql` (optional - diagnostic)
2. ✅ `Docs/SQL/001_fix_submissions_schema_ADAPTIVE.sql` (REQUIRED)
3. ✅ `Docs/SQL/002_auto_ticket_creation.sql` (UPDATED - REQUIRED)
4. ✅ `Docs/SQL/003_eligibility_functions.sql` (REQUIRED)
5. ✅ `CODE_PATCHES.md` (for API and frontend fixes)

---

## ✨ WHY ADAPTIVE MIGRATIONS?

**Standard migrations assume:**
- You have `user_id` column
- You have `question_id` column
- You have specific constraints

**Adaptive migrations:**
- ✅ Check what exists first
- ✅ Only add what's missing
- ✅ Work with any schema structure
- ✅ Safe to run multiple times (idempotent)

---

## 🎯 SUCCESS CRITERIA

After all migrations:
- ✅ No SQL errors
- ✅ Can create competitions
- ✅ Can submit answers
- ✅ Can approve submissions
- ✅ Tickets created automatically
- ✅ Eligibility works correctly

**You're almost there!** The adaptive migrations will handle your schema. 🚀
