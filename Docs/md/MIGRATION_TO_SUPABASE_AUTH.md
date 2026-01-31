# Migration to Supabase Auth

## Problem
The application was creating users in `student_participants` table with custom password hashing, but the dashboard expects users in the `profiles` table which is linked to Supabase's `auth.users` table.

## Solution
Updated the authentication system to use Supabase Auth instead of custom authentication.

## Changes Made

### 1. Updated Signup (`app/signup/actions.ts`)
- Now uses `supabase.auth.signUp()` instead of direct database insert
- Creates users in `auth.users` table
- Trigger automatically creates profile in `profiles` table
- Role mapping updated: `CEO`, `LRC_MANAGER` (instead of `ceo`, `manager`, `admin`)
- Uses email format: `{username}@lrcmanager.local`

### 2. Updated Login (`app/login/actions.ts`)
- Now uses `supabase.auth.signInWithPassword()` instead of password hash comparison
- Checks role from `profiles` table
- Removed cookie-based session management (Supabase handles this)

### 3. Updated Logout (`app/api/logout/route.ts`)
- Now uses `supabase.auth.signOut()` instead of deleting cookies

### 4. Dashboard Auth (`app/dashboard/lib/auth.ts`)
- Already using Supabase Auth and profiles table ✅
- No changes needed

## Database Setup Required

### Step 1: Run the Dashboard Migration
Make sure you've run `supabase_dashboard_migration.sql` which:
- Creates the `profiles` table
- Sets up the trigger to auto-create profiles
- Updates RLS policies

### Step 2: Migrate Existing Users (if any)
If you have existing users in `student_participants`, you need to migrate them:

```sql
-- For each user in student_participants, create auth user and profile
-- This is a manual process since Supabase Auth requires actual passwords

-- Example for one user:
-- 1. Create in Supabase Auth (via Supabase Dashboard or API)
-- 2. The trigger will auto-create the profile
```

### Step 3: Configure Email Settings (Optional)
Since we're using fake emails (`{username}@lrcmanager.local`), you should:

1. In Supabase Dashboard → Authentication → Settings
2. Disable "Confirm email" requirement
3. Or set up a custom SMTP server if you want real emails

## Testing

### Test Signup
1. Go to `/signup`
2. Enter username, password, and role code
3. Should create user in `auth.users` and `profiles` tables
4. Should redirect to dashboard

### Test Login
1. Go to `/login`
2. Enter username and password
3. Should authenticate via Supabase Auth
4. Should redirect to dashboard

### Test Dashboard Access
1. After login, dashboard should load
2. User profile should be fetched from `profiles` table
3. Role-based permissions should work

## Role Mapping

| Old Role (student_participants) | New Role (profiles) |
|--------------------------------|---------------------|
| `ceo`                          | `CEO`               |
| `manager`                      | `LRC_MANAGER`       |
| `admin`                        | `LRC_MANAGER`       |
| `student`                      | `STUDENT`           |

## Important Notes

1. **Email Format**: Users are created with email `{username}@lrcmanager.app`
   - This is a workaround since Supabase requires valid email formats
   - Make sure email confirmation is disabled in Supabase settings

2. **Password Security**: Now using Supabase's built-in password hashing (bcrypt)
   - More secure than SHA-256
   - Handles password reset, etc.

3. **Session Management**: Supabase handles sessions automatically
   - No need for custom cookies
   - Sessions stored in cookies by Supabase client

4. **student_participants Table**: 
   - Can be kept for backward compatibility
   - Or can be dropped if no longer needed
   - Dashboard doesn't use it anymore

## Rollback (if needed)

If you need to rollback to the old system:
1. Revert the changes to `app/signup/actions.ts`, `app/login/actions.ts`, and `app/api/logout/route.ts`
2. Update `app/dashboard/lib/auth.ts` to use cookies instead of Supabase Auth
3. Keep using `student_participants` table

## Next Steps

1. ✅ Code updated to use Supabase Auth
2. ⏳ Run `supabase_dashboard_migration.sql` in Supabase SQL Editor
3. ⏳ Disable email confirmation in Supabase settings
4. ⏳ Test signup and login flows
5. ⏳ Verify dashboard access works correctly
