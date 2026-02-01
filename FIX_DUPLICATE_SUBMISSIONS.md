# 🔧 FIX: Duplicate Submissions Error

## ❌ ERROR YOU'RE SEEING:
```
ERROR: 23505: could not create unique index "unique_user_competition_submission"
DETAIL: Key (participant_name, competition_id)=(يوسف محمد صبح, 897f09f1-...) is duplicated.
```

## ✅ SOLUTION (Choose One):

---

### OPTION 1: Automatic Fix (Recommended) ⚡

**What it does:** Keeps the most recent submission for each participant, deletes older ones.

**Steps:**
1. **Check what will be removed:**
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: CHECK_DUPLICATES.sql
   ```
   This shows you which submissions will be kept vs deleted.

2. **Apply the fix:**
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: Docs/SQL/001_fix_submissions_schema.sql (UPDATED VERSION)
   ```
   The migration now automatically handles duplicates.

**Result:** Migration completes successfully, duplicates removed.

---

### OPTION 2: Manual Review First 🔍

**What it does:** Shows you duplicates, you decide what to keep.

**Steps:**
1. **See all duplicates:**
   ```sql
   SELECT 
     participant_name,
     competition_id,
     COUNT(*) as duplicate_count,
     STRING_AGG(id::TEXT, ', ' ORDER BY submitted_at DESC) as submission_ids,
     STRING_AGG(submitted_at::TEXT, ', ' ORDER BY submitted_at DESC) as dates
   FROM submissions
   WHERE participant_name IS NOT NULL
   GROUP BY participant_name, competition_id
   HAVING COUNT(*) > 1;
   ```

2. **Manually delete specific submissions:**
   ```sql
   -- Delete by ID (replace with actual IDs you want to remove)
   DELETE FROM submissions WHERE id IN (
     'submission-id-1',
     'submission-id-2'
   );
   ```

3. **Then run migration:**
   ```sql
   -- File: Docs/SQL/001_fix_submissions_schema.sql
   ```

---

### OPTION 3: Keep All Submissions (Not Recommended) ⚠️

**What it does:** Modifies constraint to allow duplicates.

**Why not recommended:** 
- Breaks eligibility logic (which submission counts?)
- Wheel selection becomes ambiguous
- Ticket calculation unclear

**If you really need this:**
```sql
-- Skip the unique constraint entirely
-- Edit 001_fix_submissions_schema.sql and comment out these lines:
-- ALTER TABLE submissions ADD CONSTRAINT unique_user_competition_submission 
--   UNIQUE (participant_name, competition_id);
```

---

## 🔍 UNDERSTANDING THE DUPLICATES

**Why do duplicates exist?**
- Student submitted multiple times (retry feature)
- No unique constraint was enforced before
- API allowed duplicate submissions

**Which submission is kept?**
- **Most recent** by `submitted_at` timestamp
- If same timestamp, highest `id` (UUID)

**Example:**
```
Participant: يوسف محمد صبح
Competition: 897f09f1-...

Submission 1: 2026-01-15 10:00 (score: 8/10) ❌ DELETED
Submission 2: 2026-01-20 14:30 (score: 10/10) ✅ KEPT
```

---

## 📊 DIAGNOSTIC QUERIES

### See duplicate count:
```sql
SELECT 
  COUNT(*) as total_duplicate_groups,
  SUM(duplicate_count - 1) as submissions_to_be_removed
FROM (
  SELECT 
    participant_name,
    competition_id,
    COUNT(*) as duplicate_count
  FROM submissions
  WHERE participant_name IS NOT NULL
  GROUP BY participant_name, competition_id
  HAVING COUNT(*) > 1
) duplicates;
```

### See what will be kept:
```sql
WITH ranked_submissions AS (
  SELECT 
    id,
    participant_name,
    submitted_at,
    score,
    ROW_NUMBER() OVER (
      PARTITION BY participant_name, competition_id 
      ORDER BY submitted_at DESC, id DESC
    ) as rn
  FROM submissions
  WHERE participant_name IS NOT NULL
)
SELECT * FROM ranked_submissions WHERE rn = 1;
```

### See what will be deleted:
```sql
WITH ranked_submissions AS (
  SELECT 
    id,
    participant_name,
    submitted_at,
    score,
    ROW_NUMBER() OVER (
      PARTITION BY participant_name, competition_id 
      ORDER BY submitted_at DESC, id DESC
    ) as rn
  FROM submissions
  WHERE participant_name IS NOT NULL
)
SELECT * FROM ranked_submissions WHERE rn > 1;
```

---

## ✅ RECOMMENDED APPROACH

1. **Run diagnostic:** `CHECK_DUPLICATES.sql`
2. **Review results:** Make sure keeping most recent makes sense
3. **Run migration:** `Docs/SQL/001_fix_submissions_schema.sql` (updated)
4. **Verify:** Check that duplicates are gone

**Total time:** 5 minutes

---

## 🆘 IF SOMETHING GOES WRONG

**Restore deleted submissions:**
```sql
-- Supabase has automatic backups
-- Go to: Dashboard → Database → Backups
-- Restore to point before migration
```

**Or manually restore from backup:**
```sql
-- If you backed up before migration:
-- INSERT INTO submissions SELECT * FROM submissions_backup;
```

---

## 📝 UPDATED FILES

The following file has been UPDATED to handle duplicates:
- ✅ `Docs/SQL/001_fix_submissions_schema.sql` - Now removes duplicates automatically

New diagnostic files created:
- 📊 `CHECK_DUPLICATES.sql` - Shows what duplicates exist
- 📖 `FIX_DUPLICATE_SUBMISSIONS.md` - This guide

---

## 🎯 NEXT STEPS

After fixing duplicates:

1. ✅ Run `Docs/SQL/001_fix_submissions_schema.sql` (updated)
2. ✅ Run `Docs/SQL/002_auto_ticket_creation.sql`
3. ✅ Run `Docs/SQL/003_eligibility_functions.sql`
4. ✅ Deploy API and frontend fixes
5. ✅ Test the system

**You're on the right track!** This is a normal issue when adding unique constraints to existing data.
