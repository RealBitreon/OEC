# Username-Only Authentication Setup

## Overview
The authentication system has been simplified to use **username-only** registration and login. No email or password required!

## Changes Made

### 1. Signup Form (`app/signup/SignupForm.tsx`)
- **Removed**: Email, password, confirm password, and role code fields
- **Kept**: Username field only (3-30 characters, alphanumeric and underscore)
- Simplified validation and cleaner UI

### 2. Signup Actions (`app/signup/actions.ts`)
- **Removed**: Email/password authentication via Supabase Auth
- **Added**: Direct insertion into `student_participants` table
- **Added**: Cookie-based session management (stores `student_id`)
- Username validation: 3-30 characters, alphanumeric and underscore only

### 3. Login Form (`app/login/LoginForm.tsx`)
- **Removed**: Email and password fields
- **Kept**: Username field only
- Simplified UI matching signup form

### 4. Login Actions (`app/login/actions.ts`)
- **Removed**: Supabase Auth sign-in
- **Added**: Direct lookup in `student_participants` table
- **Added**: Cookie-based session management

### 5. Database Schema (`supabase-schema.sql`)
- **Removed**: `admin_profiles` table (Clerk-related)
- **Removed**: `audit_logs` table
- **Simplified**: `student_participants` table now only has:
  - `id` (UUID, primary key)
  - `username` (unique, 3-30 characters)
  - `created_at` (timestamp)
- **Removed**: All Clerk-related references
- **Kept**: All competition, question, submission, ticket, wheel, and winner tables
- **Updated**: All views to use `username` instead of name fields

## Database Schema Highlights

### Core Tables (8)
1. **student_participants** - Students with username only
2. **competitions** - Competition definitions
3. **questions** - Questions (competition + training)
4. **submissions** - Student answers
5. **training_submissions** - Practice attempts
6. **tickets** - Earned tickets for wheel
7. **wheel_runs** - Wheel spin sessions
8. **winners** - Competition winners

### Views (5)
1. `v_student_submissions` - Detailed submission info
2. `v_student_tickets` - Ticket aggregation
3. `v_competition_stats` - Competition metrics
4. `v_student_performance` - Student performance
5. `v_question_analysis` - Question difficulty stats

### Functions (3)
1. `get_or_create_student(username)` - Find or create student
2. `calculate_tickets_for_submission(submission_id)` - Calculate tickets
3. `get_student_tickets(student_id, competition_id)` - Get total tickets

## How It Works

### Signup Flow
1. Student enters username (3-30 characters)
2. System validates format (alphanumeric + underscore)
3. System checks if username exists
4. If available, creates new record in `student_participants`
5. Sets cookie with `student_id`
6. Redirects to dashboard

### Login Flow
1. Student enters username
2. System looks up username in `student_participants`
3. If found, sets cookie with `student_id`
4. Redirects to dashboard

### Session Management
- Uses HTTP-only cookies for security
- Cookie name: `student_id`
- Expires: 1 year
- Secure in production, lax in development

## Setup Instructions

### 1. Apply Database Schema
```bash
# Copy the SQL from supabase-schema.sql
# Paste into Supabase SQL Editor
# Execute the script
```

### 2. Update Environment Variables
No special environment variables needed! The system works out of the box.

### 3. Test the Flow
1. Go to `/signup`
2. Enter a username (e.g., "student123")
3. Click "إنشاء حساب" (Create Account)
4. You'll be redirected to dashboard
5. Try logging out and logging back in with the same username

## Security Considerations

### Pros
- Simple and fast user experience
- No password management overhead
- No email verification needed
- Perfect for school/competition environments

### Cons
- Anyone can log in as any user if they know the username
- No password protection
- Suitable for low-security environments only

### Recommendations
- Use in controlled environments (school networks)
- Consider adding IP restrictions if needed
- Monitor for suspicious activity
- Add rate limiting to prevent abuse

## Migration from Old System

If you have existing data with email/password:

1. **Backup your data** first!
2. Run the new schema in a fresh Supabase project
3. Migrate student data:
   ```sql
   -- Example migration (adjust as needed)
   INSERT INTO student_participants (username)
   SELECT DISTINCT username FROM old_profiles;
   ```
4. Update your `.env` to point to new Supabase project
5. Test thoroughly before going live

## Next Steps

1. ✅ Apply the new SQL schema to Supabase
2. ✅ Test signup flow
3. ✅ Test login flow
4. ✅ Test competition participation
5. ✅ Update any middleware that checks authentication
6. ✅ Update dashboard to read from cookie instead of Supabase Auth

## Files Modified

- `app/signup/SignupForm.tsx` - Simplified to username only
- `app/signup/actions.ts` - Cookie-based session
- `app/login/LoginForm.tsx` - Simplified to username only
- `app/login/actions.ts` - Cookie-based session
- `supabase-schema.sql` - Complete rewrite for username-only

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify cookie is being set (DevTools > Application > Cookies)
4. Ensure database schema is applied correctly
