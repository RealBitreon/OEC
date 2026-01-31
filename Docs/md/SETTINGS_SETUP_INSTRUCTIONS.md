# ⚙️ Settings Setup Instructions

## 🚨 Important: Run Scripts in Order!

You need to run the SQL scripts in the correct order. Here's the step-by-step guide:

---

## 📋 Step-by-Step Setup

### Step 1: Run Base Database Setup (REQUIRED FIRST)

Open your Supabase SQL Editor and run:

```
Docs/SQL/supabase_complete_setup.sql
```

This creates all the base tables including:
- `student_participants` (users table)
- `competitions`
- `questions`
- `submissions`
- `tickets`
- `wheel_entries`
- `audit_logs`
- And all other core tables

**⏱️ This will take about 30-60 seconds to complete.**

---

### Step 2: Run Settings Enhancement Migration

After Step 1 completes successfully, run:

```
Docs/SQL/settings_enhancement_migration.sql
```

This adds the settings-specific columns and tables:
- Adds 9 new columns to `student_participants`
- Creates `system_settings` table
- Creates `user_sessions` table
- Sets up RLS policies
- Creates indexes

**⏱️ This will take about 10-20 seconds to complete.**

---

## ✅ Verification

After running both scripts, verify everything worked:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_participants', 'system_settings', 'user_sessions')
ORDER BY table_name;
```

Expected result: 3 rows

### Check New Columns
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'student_participants'
AND column_name IN ('phone', 'bio', 'theme', 'language', 'font_size', 'compact_mode', 'notification_settings', 'avatar_url', 'last_password_change')
ORDER BY column_name;
```

Expected result: 9 rows

### Check System Settings
```sql
SELECT key, value FROM system_settings ORDER BY key;
```

Expected result: 8 rows with default settings

---

## 🎯 Quick Summary

```
1. Run: supabase_complete_setup.sql          ← Creates base tables
2. Run: settings_enhancement_migration.sql   ← Adds settings features
3. Test: Navigate to /dashboard → Settings   ← Verify it works
```

---

## 🚨 Troubleshooting

### Error: "relation student_participants does not exist"
**Solution**: You skipped Step 1. Run `supabase_complete_setup.sql` first.

### Error: "column already exists"
**Solution**: You already ran the migration. This is safe to ignore, or you can skip Step 2.

### Error: "permission denied"
**Solution**: Make sure you're running the scripts in the Supabase SQL Editor with admin privileges.

---

## 📝 What Each Script Does

### supabase_complete_setup.sql
- Creates all base tables
- Sets up RLS policies
- Creates indexes
- Adds triggers
- Inserts sample data (optional)

### settings_enhancement_migration.sql
- Adds settings columns to student_participants
- Creates system_settings table
- Creates user_sessions table
- Sets up settings-specific RLS policies
- Creates settings-specific indexes

---

## 🎉 After Setup

Once both scripts complete successfully:

1. **Test the Settings Page**
   - Navigate to `/dashboard`
   - Click "الإعدادات" in sidebar
   - Try updating profile, changing theme, etc.

2. **Verify Data Persistence**
   - Change theme to dark
   - Refresh page
   - Theme should remain dark

3. **Test Password Change**
   - Go to Security tab
   - Change password
   - Verify password strength meter works

---

## 📊 Expected Database State

After both scripts:

### Tables (Total: 10+)
- ✅ student_participants (with 9 new columns)
- ✅ competitions
- ✅ questions
- ✅ submissions
- ✅ tickets
- ✅ wheel_entries
- ✅ audit_logs
- ✅ system_settings (NEW)
- ✅ user_sessions (NEW)

### Columns in student_participants
- ✅ id, username, password_hash, email, role, display_name
- ✅ phone (NEW)
- ✅ bio (NEW)
- ✅ theme (NEW)
- ✅ language (NEW)
- ✅ font_size (NEW)
- ✅ compact_mode (NEW)
- ✅ notification_settings (NEW)
- ✅ avatar_url (NEW)
- ✅ last_password_change (NEW)
- ✅ created_at, updated_at

---

## 🔗 Related Documentation

- `SETTINGS_ULTIMATE_GUIDE.md` - Complete feature guide
- `SETTINGS_QUICK_REFERENCE.md` - Quick reference
- `SETTINGS_COMPLETE_OPTIMIZATION.md` - What was done

---

## 💡 Pro Tips

1. **Run in Supabase SQL Editor**: Don't run these in your application code
2. **Check for Errors**: Read the output carefully after each script
3. **Backup First**: If you have existing data, backup your database first
4. **Test Locally**: Test on a development database before production

---

## 🎯 Next Steps

After successful setup:

1. ✅ Settings page will work perfectly
2. ✅ All validation will be active
3. ✅ Theme persistence will work
4. ✅ Password strength meter will work
5. ✅ Audit logging will track all changes

---

**Ready to go!** 🚀

Run the scripts in order and your Settings section will be fully functional!
