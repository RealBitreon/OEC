# Supabase Auth Setup (Username-Only, Role Code Required)

## Quick Setup

### 1. Run Migration
```bash
# Go to: https://supabase.com/dashboard/project/wpkyzdpnhiucctdangwf/sql
# Copy content of: supabase_auth_username_only.sql
# Paste and Run
```

### 2. Fix Existing Issues (IMPORTANT!)
```bash
# If you already have users or facing "Profile not found" errors:
# Go to: https://supabase.com/dashboard/project/wpkyzdpnhiucctdangwf/sql
# Copy content of: fix_auth_complete.sql
# Paste and Run
```

This will:
- ✅ Create missing profiles for existing auth users
- ✅ Fix any VIEWER roles to LRC_MANAGER
- ✅ Update trigger to be more robust
- ✅ Sync auth metadata with users table

### 3. Create Admin User

**Through Signup Page (Recommended)**
```bash
# Go to: http://localhost:3000/signup
# Username: admin
# Password: YourPassword123!
# Role Code: CE@ (for CEO) or MG$ (for Manager)
# Click "إنشاء حساب"
```

**Important:** Role code is REQUIRED. No signup without valid code.

### 4. Test
- Login at `/login` with username and password
- Should redirect to dashboard with full menu
- Check browser console - should NOT see "Profile not found" error

## Role Codes

**REQUIRED for all signups:**
- `CE@` - CEO (full access to everything)
- `MG$` - LRC_MANAGER (competition management)

**No VIEWER role** - All users must have a valid role code.

## How It Works

- Users login with **username only** (no email required)
- Internally converts username to `username@local.app` for Supabase Auth
- Email is auto-confirmed during signup (no verification needed)
- **Role code is REQUIRED** - signup will fail without valid code
- Trigger automatically creates profile in `users` table
- Only 2 roles: CEO and LRC_MANAGER

## Troubleshooting

### "Profile not found for auth user" Error

This means the trigger didn't create the profile. Fix it:

```sql
-- Run fix_auth_complete.sql in Supabase SQL Editor
-- This will create all missing profiles
```

### Signup fails with "Invalid role code"

- Check your `.env` file has the correct codes:
  ```env
  CEO_ROLE_CODE=CE@
  MANAGER_ROLE_CODE=MG$
  ```
- Make sure you're entering the exact code (case-sensitive)
- Restart your dev server after changing `.env`

### User created but has wrong role

```sql
-- Check user role
SELECT username, role FROM users WHERE username = 'your-username';

-- Update to CEO
UPDATE users SET role = 'CEO' WHERE username = 'your-username';

-- Update to LRC_MANAGER
UPDATE users SET role = 'LRC_MANAGER' WHERE username = 'your-username';
```

### Sidebar not showing

1. Check browser console for errors
2. Check session data: `fetch('/api/session').then(r => r.json()).then(console.log)`
3. Make sure user has valid role (CEO or LRC_MANAGER)
4. Run `fix_auth_complete.sql` to fix any issues

### Check if everything is working

```sql
-- Run this to see all users and their status
SELECT 
  au.email,
  u.username,
  u.role,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ OK'
    ELSE '❌ MISSING PROFILE'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_id = au.id
ORDER BY au.created_at DESC;
```
