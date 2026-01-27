# 🔐 Authentication System - Setup Guide

## Overview
This project uses **Supabase Auth** for authentication with Arabic RTL interface.

## Features
✅ Email + Password authentication  
✅ Username-based profiles  
✅ Role-based access (Participant, Manager, CEO)  
✅ Secure role codes for admin registration  
✅ Arabic RTL interface  
✅ Auto-redirect after login/signup  
✅ Protected routes with middleware  

---

## 📁 File Structure

```
app/
├── login/
│   ├── page.tsx          # Login page (Server Component)
│   ├── LoginForm.tsx     # Login form (Client Component)
│   └── actions.ts        # Server action for login
├── signup/
│   ├── page.tsx          # Signup page (Server Component)
│   ├── SignupForm.tsx    # Signup form (Client Component)
│   └── actions.ts        # Server action for signup
└── dashboard/
    ├── page.tsx          # Dashboard (protected route)
    ├── LogoutButton.tsx  # Logout button component
    └── actions.ts        # Server action for logout

lib/
└── supabase/
    ├── client.ts         # Client-side Supabase client
    └── server.ts         # Server-side Supabase client

middleware.ts             # Route protection middleware
supabase-schema.sql       # Database schema
```

---

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase-schema.sql
# Paste into Supabase SQL Editor
# Execute the query
```

This creates:
- `profiles` table with RLS policies
- Indexes for performance
- Triggers for automatic timestamps

### 2. Environment Variables

Ensure your `.env` file has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Role Codes (change these!)
CEO_ROLE_CODE=CE@
MANAGER_ROLE_CODE=$RC
```

### 3. Test the System

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test Signup:**
   - Visit: `http://localhost:3000/signup`
   - Fill in: email, username, password
   - Optional: Enter role code for admin access
   - Should redirect to `/dashboard` after signup

3. **Test Login:**
   - Visit: `http://localhost:3000/login`
   - Enter credentials
   - Should redirect to `/dashboard`

4. **Test Protected Routes:**
   - Visit: `http://localhost:3000/dashboard` (logged out)
   - Should redirect to `/login`

5. **Test Logout:**
   - Click "تسجيل الخروج" in dashboard
   - Should redirect to `/login`

---

## 🔒 Security Features

### 1. Generic Error Messages
All auth errors show generic Arabic messages:
- ❌ "بيانات الدخول غير صحيحة. حاول مرة أخرى."
- Never reveals if email exists or password is wrong

### 2. Server-Side Validation
- All auth logic runs on server
- No sensitive data exposed to client
- Uses Supabase anon key (safe for client)

### 3. Role Code Protection
- Role codes stored in environment variables
- Only valid codes grant admin access
- Invalid codes show error message

### 4. Row Level Security (RLS)
- Users can only read/update their own profiles
- Admins can read all profiles
- Enforced at database level

### 5. Middleware Protection
- Protected routes require authentication
- Auto-redirect to login if not authenticated
- Public routes accessible without auth

---

## 📋 User Roles

### Participant (Default)
- Regular user
- Can participate in competitions
- Limited access

### Manager
- Requires `MANAGER_ROLE_CODE` during signup
- Can manage competitions and questions
- Extended access

### CEO
- Requires `CEO_ROLE_CODE` during signup
- Full administrative access
- Can manage everything

---

## 🎨 UI Features

### Arabic RTL Support
- All text in Arabic
- Right-to-left layout
- Proper text alignment

### Premium Design
- Gradient backgrounds
- Clean card layouts
- Smooth transitions
- Loading states
- Error states

### Responsive
- Mobile-friendly
- Tablet-optimized
- Desktop-ready

---

## 🧪 Testing Checklist

- [ ] Signup with valid data → redirects to dashboard
- [ ] Signup with existing email → shows error
- [ ] Signup with existing username → shows error
- [ ] Signup with mismatched passwords → shows error
- [ ] Signup with short password → shows error
- [ ] Signup with role code (CEO) → creates CEO profile
- [ ] Signup with role code (Manager) → creates Manager profile
- [ ] Signup with invalid role code → shows error
- [ ] Login with valid credentials → redirects to dashboard
- [ ] Login with wrong credentials → shows generic error
- [ ] Visit /login while logged in → redirects to dashboard
- [ ] Visit /signup while logged in → redirects to dashboard
- [ ] Visit /dashboard while logged out → redirects to login
- [ ] Logout → redirects to login
- [ ] Dashboard shows correct username
- [ ] Dashboard shows role badge for admins

---

## 🐛 Troubleshooting

### "Cannot find module" error
- This is a TypeScript language server issue
- Files exist and will work at runtime
- Restart TypeScript server if needed

### Redirect not working
- Check middleware.ts is configured correctly
- Verify Supabase credentials in .env
- Check browser console for errors

### Profile not created
- Check supabase-schema.sql was executed
- Verify RLS policies are enabled
- Check Supabase logs for errors

### Role code not working
- Verify .env has correct role codes
- Check for typos in role code input
- Ensure role codes match exactly

---

## 📚 API Reference

### Server Actions

#### `loginAction(formData: FormData)`
- Authenticates user with email/password
- Creates profile if missing
- Redirects to dashboard on success

#### `signupAction(formData: FormData)`
- Creates new user account
- Validates all inputs
- Checks role code if provided
- Creates profile with role
- Auto-login after signup
- Redirects to dashboard

#### `logoutAction()`
- Signs out current user
- Redirects to login page

---

## 🔄 Migration from Clerk

If migrating from Clerk:

1. ✅ Middleware updated to use Supabase
2. ✅ Dashboard updated to use Supabase
3. ✅ Login/Signup use Supabase Auth
4. ⚠️ Old Clerk routes (/sign-in, /sign-up) still exist
5. 💡 Consider redirecting old routes to new ones

---

## 📞 Support

For issues or questions:
1. Check Supabase logs
2. Check browser console
3. Verify environment variables
4. Review this documentation

---

**Last Updated:** January 2026  
**Version:** 1.0.0
