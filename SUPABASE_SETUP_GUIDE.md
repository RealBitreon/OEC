# 🚀 Supabase Complete Setup Guide - LRC Manager

This guide will walk you through setting up your complete Supabase database from scratch.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Database Schema Overview](#database-schema-overview)
4. [Environment Variables](#environment-variables)
5. [Testing the Setup](#testing-the-setup)
6. [Sample Data](#sample-data)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:
- ✅ A Supabase account ([sign up here](https://supabase.com))
- ✅ A Supabase project created
- ✅ Access to your Supabase SQL Editor

---

## Quick Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Setup Script

1. Open the file `supabase_complete_setup.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

⏱️ **Estimated time:** 10-15 seconds

### Step 3: Verify Success

You should see a success message like:
```
✅ Database setup completed successfully!
📊 Tables created: 10
🔒 RLS policies applied: All tables secured
⚡ Indexes created: Optimized for performance
🔧 Helper functions: Available for use
```

---

## Database Schema Overview

### 📊 Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **student_participants** | User authentication & profiles | Username/password auth, role-based access |
| **competitions** | Competition management | Active/archived status, rules config |
| **questions** | Questions for competitions & training | MCQ, True/False, Text types |
| **submissions** | Competition answer submissions | Auto-grading, review system |
| **training_submissions** | Practice question submissions | Separate from competition data |
| **tickets** | Lottery tickets for winners | Calculated based on performance |
| **participants** | Competition registration | Name & phone tracking |
| **wheel_runs** | Lottery execution records | Winner selection history |
| **winners** | Competition winners | Public/private display option |
| **audit_logs** | System activity tracking | Full audit trail |

### 🔐 User Roles

The system supports 5 role levels:
- **student** - Regular users (default)
- **teacher** - Educators
- **manager** - Competition managers
- **admin** - System administrators
- **ceo** - Full system access

### 🎯 Key Features

1. **Row Level Security (RLS)** - All tables are secured with proper access policies
2. **Automatic Timestamps** - `created_at` and `updated_at` managed automatically
3. **Referential Integrity** - Foreign keys ensure data consistency
4. **Optimized Indexes** - Fast queries on common operations
5. **Helper Functions** - Built-in functions for common tasks

---

## Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Role Codes (for signup)
CEO_ROLE_CODE=your-secret-ceo-code
MANAGER_ROLE_CODE=your-secret-manager-code
ADMIN_ROLE_CODE=your-secret-admin-code
```

### Where to Find Your Keys:

1. Go to your Supabase project
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

---

## Testing the Setup

### 1. Test Sample Users

Two sample users are created automatically:

**CEO Account:**
- Username: `admin`
- Password: `password123`
- Role: CEO (full access)

**Student Account:**
- Username: `student1`
- Password: `student123`
- Role: Student

### 2. Test Login

1. Start your Next.js app: `npm run dev`
2. Go to `/login`
3. Try logging in with the sample accounts
4. Verify you can access the dashboard

### 3. Test Database Queries

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check users
SELECT username, role, created_at FROM student_participants;

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## Sample Data

### Creating a Sample Competition

```sql
INSERT INTO competitions (
  title,
  slug,
  description,
  status,
  start_at,
  end_at,
  wheel_spin_at,
  rules
) VALUES (
  'مسابقة رمضان 2026',
  'ramadan-2026',
  'مسابقة شهر رمضان المبارك للعام 2026',
  'active',
  '2026-03-01 00:00:00+00',
  '2026-03-29 23:59:59+00',
  '2026-03-30 20:00:00+00',
  '{
    "eligibilityMode": "all_correct",
    "minCorrectAnswers": 0,
    "ticketsConfig": {
      "baseTickets": 1,
      "earlyBonusTiers": [
        {
          "beforeDate": "2026-03-15T00:00:00Z",
          "bonusTickets": 2
        }
      ]
    }
  }'::jsonb
);
```

### Creating Sample Questions

```sql
-- Get the competition ID first
DO $$
DECLARE
  comp_id UUID;
BEGIN
  SELECT id INTO comp_id FROM competitions WHERE slug = 'ramadan-2026';
  
  -- MCQ Question
  INSERT INTO questions (
    competition_id,
    is_training,
    type,
    question_text,
    options,
    correct_answer,
    source_ref
  ) VALUES (
    comp_id,
    false,
    'mcq',
    'ما هو عدد أركان الإسلام؟',
    '["ثلاثة", "أربعة", "خمسة", "ستة"]'::jsonb,
    'خمسة',
    '{"volume": "1", "page": "10", "lineFrom": "5", "lineTo": "7"}'::jsonb
  );
  
  -- True/False Question
  INSERT INTO questions (
    competition_id,
    is_training,
    type,
    question_text,
    correct_answer,
    source_ref
  ) VALUES (
    comp_id,
    false,
    'true_false',
    'الصلاة هي الركن الثاني من أركان الإسلام',
    'صح',
    '{"volume": "1", "page": "12", "lineFrom": "3", "lineTo": "4"}'::jsonb
  );
  
  -- Training Question
  INSERT INTO questions (
    competition_id,
    is_training,
    type,
    question_text,
    options,
    correct_answer,
    source_ref
  ) VALUES (
    NULL,
    true,
    'mcq',
    'كم عدد الصلوات المفروضة في اليوم؟',
    '["ثلاث", "أربع", "خمس", "ست"]'::jsonb,
    'خمس',
    '{"volume": "1", "page": "15", "lineFrom": "1", "lineTo": "2"}'::jsonb
  );
END $$;
```

---

## Helper Functions

The setup includes useful helper functions:

### 1. Get Active Competition

```sql
SELECT * FROM get_active_competition();
```

### 2. Calculate User Tickets

```sql
SELECT calculate_user_tickets(
  'user-uuid-here'::uuid,
  'competition-uuid-here'::uuid
);
```

### 3. Get User Competition Stats

```sql
SELECT * FROM get_user_competition_stats(
  'user-uuid-here'::uuid,
  'competition-uuid-here'::uuid
);
```

---

## Troubleshooting

### Issue: "relation already exists"

**Solution:** Tables already exist. Either:
- Drop existing tables first (⚠️ This deletes all data!)
- Or skip the error and continue

```sql
-- To drop all tables (USE WITH CAUTION!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS wheel_runs CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS training_submissions CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;
DROP TABLE IF EXISTS student_participants CASCADE;
```

### Issue: "permission denied"

**Solution:** Make sure you're using the service role key for admin operations.

### Issue: RLS blocking queries

**Solution:** Check your policies or temporarily disable RLS for testing:

```sql
-- Disable RLS (for testing only!)
ALTER TABLE student_participants DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE student_participants ENABLE ROW LEVEL SECURITY;
```

### Issue: Can't login with sample users

**Solution:** Verify the password hash is correct:

```javascript
// In Node.js or browser console
const crypto = require('crypto');
const password = 'password123';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
// Should output: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
```

---

## Next Steps

After setup is complete:

1. ✅ **Change default passwords** - Update the sample user passwords
2. ✅ **Set role codes** - Configure your secret role codes in `.env`
3. ✅ **Create your first competition** - Use the sample SQL above
4. ✅ **Add questions** - Create questions for your competition
5. ✅ **Test the flow** - Try the complete user journey
6. ✅ **Configure RLS** - Adjust policies based on your needs

---

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. **Rotate keys** regularly, especially service role keys
3. **Use strong passwords** for all accounts
4. **Keep role codes secret** - Don't share them publicly
5. **Monitor audit logs** - Check for suspicious activity
6. **Test RLS policies** - Ensure users can only access their data
7. **Backup regularly** - Use Supabase's backup features

---

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the SQL error messages carefully
3. Test queries in the SQL Editor
4. Check your environment variables
5. Verify your Supabase project is active

---

## Database Diagram

```
student_participants (Users)
    ↓
    ├─→ competitions
    │       ↓
    │       ├─→ questions
    │       │       ↓
    │       │       ├─→ submissions
    │       │       └─→ training_submissions
    │       │
    │       ├─→ tickets
    │       ├─→ participants
    │       ├─→ wheel_runs
    │       └─→ winners
    │
    └─→ audit_logs
```

---

## 🎉 Congratulations!

Your LRC Manager database is now fully set up and ready to use. You have:

- ✅ 10 tables with proper relationships
- ✅ Row Level Security enabled
- ✅ Optimized indexes for performance
- ✅ Helper functions for common operations
- ✅ Sample data for testing
- ✅ Complete audit trail system

Happy coding! 🚀
