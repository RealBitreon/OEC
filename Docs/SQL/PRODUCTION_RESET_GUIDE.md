# Production Reset Guide

## Overview
This guide helps you completely reset your Supabase database to start with real production data.

## What Gets Deleted
- ✅ All user accounts (auth.users)
- ✅ All user profiles
- ✅ All competitions
- ✅ All questions
- ✅ All submissions
- ✅ All wheel prizes and spins
- ✅ All support tickets
- ✅ All audit logs
- ✅ All attempt tracking data
- ✅ All settings

## What Stays
- ✅ Database schema (tables, columns, constraints)
- ✅ RLS policies
- ✅ Functions and triggers
- ✅ Indexes

## Steps to Reset

### 1. Backup (Optional but Recommended)
Before running the reset, create a backup in Supabase:
- Go to Supabase Dashboard → Database → Backups
- Create a manual backup

### 2. Run the Reset Script
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open the file: `Docs/SQL/reset_for_production.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click "Run"

### 3. Verify the Reset
The script will show counts at the end. All should be 0:
```
Users remaining: 0
Profiles remaining: 0
Competitions remaining: 0
Questions remaining: 0
Submissions remaining: 0
...
```

### 4. Create Your First Admin Account

#### Option A: Through Signup Page
1. Go to your website's signup page
2. Create your admin account
3. Go to Supabase Dashboard → Authentication → Users
4. Find your user and copy the UUID
5. Go to SQL Editor and run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR-USER-UUID-HERE';
```

#### Option B: Directly in Supabase
Run this in SQL Editor (replace with your details):
```sql
-- Create auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('your-password', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Create profile (use the ID from above)
INSERT INTO public.profiles (
  id,
  username,
  email,
  role,
  created_at
) VALUES (
  'USER-ID-FROM-ABOVE',
  'admin',
  'admin@example.com',
  'admin',
  now()
);
```

### 5. Start Adding Real Data
Now you can:
- Create real competitions
- Add real questions
- Configure wheel prizes
- Set up system settings

## Important Notes

⚠️ **WARNING**: This action is irreversible. All data will be permanently deleted.

✅ **Best Practice**: Run this script in a staging environment first to ensure everything works as expected.

✅ **Timing**: Run this script when:
- You've finished testing
- You're ready to launch
- No users are currently using the system

## Troubleshooting

### Error: "permission denied"
- Make sure you're logged in as the database owner
- Check that you have proper permissions in Supabase

### Error: "violates foreign key constraint"
- The script handles foreign keys in the correct order
- If you still get this error, disable RLS on all tables first

### Some data remains
- Check if there are any custom tables not included in the script
- Verify RLS policies aren't preventing deletion

## Quick Reset Command
For quick access, here's the one-liner to copy:
```sql
-- Copy the entire content of Docs/SQL/reset_for_production.sql
```

## After Reset Checklist
- [ ] All test data deleted
- [ ] Admin account created
- [ ] Admin role assigned
- [ ] First competition created
- [ ] System settings configured
- [ ] Wheel prizes set up
- [ ] Email notifications tested
- [ ] RLS policies working correctly

## Need Help?
If you encounter issues:
1. Check Supabase logs
2. Verify your database schema is up to date
3. Ensure all migrations have been run
4. Review the error messages carefully

---

**Ready to start fresh? Run `reset_for_production.sql` now!**
