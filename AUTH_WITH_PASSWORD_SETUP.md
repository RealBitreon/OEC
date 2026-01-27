# Authentication with Password & Role Codes Setup

## Overview
The system now uses **username + password** authentication with **role-based access control** using secret codes.

## Features

### 1. **Signup**
- Username (3-30 characters, alphanumeric + underscore)
- Password (minimum 8 characters)
- Confirm Password
- Optional Role Code (for admin access)

### 2. **Login**
- Username
- Password
- Automatic session management with cookies

### 3. **Roles**
- **student** (default) - Regular participants
- **admin** - General admin access
- **manager** - Competition management
- **ceo** - Full system access

## Environment Variables (.env)

```env
# ========================================
# Role Codes for Admin Access
# ========================================
# CEO Role Code - Full system access
CEO_ROLE_CODE=CEO2024SECURE

# Manager Role Code - Competition management access
MANAGER_ROLE_CODE=MGR2024SECURE

# Admin Role Code - General admin access
ADMIN_ROLE_CODE=ADM2024SECURE
```

**⚠️ IMPORTANT:** Change these codes to your own secure values!

## Database Schema

### student_participants Table
```sql
- id (TEXT, PRIMARY KEY)
- username (TEXT, UNIQUE, NOT NULL)
- password_hash (TEXT, NOT NULL) -- SHA-256 hashed
- role (TEXT, NOT NULL, DEFAULT 'student')
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Password Security
- Passwords are hashed using **SHA-256** before storage
- Never stored in plain text
- Hashing happens server-side in actions

## How It Works

### Signup Flow
1. User enters username, password, confirm password
2. Optionally enters role code for admin access
3. System validates:
   - Username format (alphanumeric + underscore)
   - Password length (min 8 characters)
   - Passwords match
   - Username is unique
   - Role code is valid (if provided)
4. Password is hashed with SHA-256
5. User record created with role
6. Session cookies set (student_id, student_role)
7. Redirect to dashboard

### Login Flow
1. User enters username and password
2. Password is hashed with SHA-256
3. System looks up user with matching username and password_hash
4. If found, session cookies are set
5. Redirect to dashboard

### Session Management
- Uses HTTP-only cookies for security
- Two cookies:
  - `student_id` - User's unique ID
  - `student_role` - User's role (student, admin, manager, ceo)
- Expires: 1 year
- Secure in production

## Files Modified

### Frontend
1. **app/signup/SignupForm.tsx**
   - Added password field
   - Added confirm password field
   - Added role code toggle and field
   - Form validation

2. **app/login/LoginForm.tsx**
   - Added password field
   - Form validation

### Backend
3. **app/signup/actions.ts**
   - Password hashing with SHA-256
   - Role code validation
   - Database insertion with password_hash and role
   - Cookie management

4. **app/login/actions.ts**
   - Password hashing for comparison
   - Database lookup with username + password_hash
   - Cookie management

### Configuration
5. **.env**
   - Added CEO_ROLE_CODE
   - Added MANAGER_ROLE_CODE
   - Added ADMIN_ROLE_CODE

### Database
6. **supabase-schema-with-auth.sql**
   - Complete schema with authentication
   - student_participants table with password_hash and role
   - All views updated to include role
   - RLS policies
   - Helper functions

## Setup Instructions

### 1. Update Environment Variables
```bash
# Edit .env file
# Change the role codes to your own secure values
CEO_ROLE_CODE=YourSecureCEOCode123
MANAGER_ROLE_CODE=YourSecureManagerCode456
ADMIN_ROLE_CODE=YourSecureAdminCode789
```

### 2. Apply Database Schema
```bash
# Copy the SQL from supabase-schema-with-auth.sql
# Paste into Supabase SQL Editor
# Execute the script
```

### 3. Test Signup
1. Go to `/signup`
2. Enter username: `testuser`
3. Enter password: `password123`
4. Confirm password: `password123`
5. Leave role code empty (will be 'student' role)
6. Click "إنشاء حساب"
7. Should redirect to dashboard

### 4. Test Admin Signup
1. Go to `/signup`
2. Enter username: `admin1`
3. Enter password: `adminpass123`
4. Confirm password: `adminpass123`
5. Click "لديك رمز دور إداري؟"
6. Enter role code: `CEO2024SECURE` (or your CEO code)
7. Click "إنشاء حساب"
8. Should redirect to dashboard with CEO role

### 5. Test Login
1. Go to `/login`
2. Enter username: `testuser`
3. Enter password: `password123`
4. Click "تسجيل الدخول"
5. Should redirect to dashboard

## Security Considerations

### Strengths
✅ Passwords are hashed (SHA-256)
✅ HTTP-only cookies prevent XSS attacks
✅ Role-based access control
✅ Server-side validation
✅ Secure in production (HTTPS)

### Recommendations
⚠️ **Change default role codes** in .env
⚠️ **Use strong role codes** (mix of letters, numbers, symbols)
⚠️ **Keep .env file secure** (never commit to git)
⚠️ **Use HTTPS in production**
⚠️ **Consider adding rate limiting** to prevent brute force
⚠️ **Consider adding password strength requirements**
⚠️ **Consider adding account lockout** after failed attempts

### Future Enhancements
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- Password strength meter
- Account lockout after failed attempts
- Rate limiting on login/signup
- Session timeout
- Remember me functionality

## Role-Based Access

### Student Role (Default)
- Participate in competitions
- Submit answers
- Practice with training questions
- View own submissions and tickets
- View leaderboards

### Admin Role
- All student permissions
- View all submissions
- Manual grading
- View analytics

### Manager Role
- All admin permissions
- Create/edit competitions
- Create/edit questions
- Manage wheel runs

### CEO Role
- All manager permissions
- Full system access
- User management
- System configuration

## Troubleshooting

### "اسم المستخدم مستخدم بالفعل"
- Username already exists
- Try a different username

### "كلمات المرور غير متطابقة"
- Passwords don't match
- Retype both passwords

### "رمز الدور غير صحيح"
- Invalid role code
- Check your .env file for correct codes
- Make sure you copied the code exactly

### "اسم المستخدم أو كلمة المرور غير صحيحة"
- Wrong username or password
- Check your credentials
- Passwords are case-sensitive

### Cookies not being set
- Check browser console for errors
- Ensure cookies are enabled
- Check that domain matches

## API Endpoints

### POST /signup
```typescript
FormData {
  username: string (3-30 chars)
  password: string (min 8 chars)
  confirmPassword: string
  roleCode?: string (optional)
}

Response {
  error?: string
  success?: boolean
}
```

### POST /login
```typescript
FormData {
  username: string
  password: string
}

Response {
  error?: string
}
```

## Database Queries

### Create User
```sql
INSERT INTO student_participants (username, password_hash, role)
VALUES ('username', 'hashed_password', 'student')
RETURNING id;
```

### Login User
```sql
SELECT id, username, role, password_hash
FROM student_participants
WHERE username = 'username'
  AND password_hash = 'hashed_password';
```

### Get User by ID
```sql
SELECT id, username, role, created_at
FROM student_participants
WHERE id = 'user_id';
```

## Testing Checklist

- [ ] Signup with username + password
- [ ] Signup with role code (CEO)
- [ ] Signup with role code (Manager)
- [ ] Signup with role code (Admin)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Login with wrong username
- [ ] Signup with existing username
- [ ] Signup with mismatched passwords
- [ ] Signup with short password
- [ ] Signup with invalid username format
- [ ] Signup with invalid role code
- [ ] Session persists after page refresh
- [ ] Logout functionality
- [ ] Role-based access control

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify .env variables are set
4. Verify database schema is applied
5. Check that cookies are being set
6. Verify password hashing is working

## Summary

You now have a complete authentication system with:
- ✅ Username + Password authentication
- ✅ Role-based access control
- ✅ Secure password hashing (SHA-256)
- ✅ Cookie-based sessions
- ✅ Admin access via role codes
- ✅ Complete database schema
- ✅ All forms updated
- ✅ All actions updated

Ready to use! 🎉
