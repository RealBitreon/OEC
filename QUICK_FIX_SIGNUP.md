# Quick Fix for Signup Error ⚡

## Problem
Error message: "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى."

## Solution (3 Steps)

### Step 1: Run SQL Fix
1. Open Supabase Dashboard: https://app.supabase.com
2. Go to **SQL Editor**
3. Copy and paste content from `fix_rls_final.sql`
4. Click **Run**
5. Wait for success message ✅

### Step 2: Check Browser Console
1. Open your app: `https://localhost:3000/signup`
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Try to create an account
5. Look for error messages

### Step 3: Verify Environment
Check your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Common Errors & Solutions

### Error: "Permission denied" (42501)
**Fix**: Run `fix_rls_final.sql` in Supabase SQL Editor

### Error: "Username already exists" (23505)
**Fix**: Try a different username

### Error: Connection timeout
**Fix**: Check Supabase project is running and `.env` is correct

## Verify Fix Worked

After running `fix_rls_final.sql`, you should see in Supabase:

**Policies on student_participants:**
- ✅ allow_public_insert
- ✅ allow_public_select
- ✅ allow_user_update

**Test it:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  has_table_privilege('anon', 'student_participants', 'INSERT') as can_insert,
  has_table_privilege('anon', 'student_participants', 'SELECT') as can_select;
```

Should return:
```
can_insert | can_select
-----------|-----------
true       | true
```

## Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev`
3. **Check Supabase logs** in Dashboard → Logs
4. **Run debug script**: `debug_signup.sql` in SQL Editor

## Files Reference

- `fix_rls_final.sql` - Main fix for RLS policies
- `debug_signup.sql` - Debug current setup
- `استكشاف_أخطاء_التسجيل.md` - Detailed troubleshooting (Arabic)
- `app/signup/actions.ts` - Signup logic with detailed logging

## Success Indicators

When signup works, you'll see in console:
```
Username available, creating user...
Password hashed successfully
User created successfully: [uuid]
Cookies set, redirecting to dashboard
```

Then you'll be redirected to `/dashboard` ✅

---

**Need more help?** Check `استكشاف_أخطاء_التسجيل.md` for detailed troubleshooting.
