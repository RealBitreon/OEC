# Quick Fix Guide - Auth Setup Error

## Error
"حدث خطأ أثناء إنشاء الحساب: Database error saving new user"

## Root Cause
The `profiles` table or its RLS policies are not set up correctly, preventing profile creation during signup.

## Solution - Follow These Steps

### Step 1: Run the Fix SQL Script
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `fix_auth_setup.sql`
4. Click **Run**
5. Check the output messages for ✅ confirmations

### Step 2: Disable Email Confirmation
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. **Disable** "Confirm email"
4. Click **Save**

### Step 3: Test Signup Again
1. Go to your app's signup page
2. Try creating a new account
3. Check the browser console for detailed error messages if it still fails

## What the Fix Does

The `fix_auth_setup.sql` script:
- ✅ Creates the `profiles` table if missing
- ✅ Sets up proper RLS policies (including INSERT policy for authenticated users)
- ✅ Creates the trigger to auto-create profiles
- ✅ Grants necessary permissions
- ✅ Verifies everything is set up correctly

## Updated Code Changes

The signup code now:
1. Creates the user in Supabase Auth
2. **Manually creates the profile** (doesn't rely only on trigger)
3. Provides detailed error messages with error codes
4. Cleans up on failure

## Troubleshooting

### If you still get errors:

1. **Check the browser console** - Look for detailed error messages with error codes

2. **Check Supabase logs**:
   - Go to Supabase Dashboard → **Logs** → **Postgres Logs**
   - Look for errors during signup

3. **Verify table exists**:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```

4. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

5. **Test profile insert manually**:
   ```sql
   -- This should work when authenticated
   INSERT INTO profiles (id, username, role)
   VALUES (auth.uid(), 'testuser', 'STUDENT');
   ```

## Common Error Codes

- **42501**: Permission denied (RLS policy issue)
- **23505**: Unique constraint violation (username already exists)
- **42P01**: Table doesn't exist
- **23503**: Foreign key violation (auth.users record doesn't exist)

## Need More Help?

If the error persists:
1. Share the **exact error message** from the browser console
2. Share the **error code** (e.g., 42501)
3. Check if the `profiles` table exists in Supabase Table Editor
