# 🚀 Quick Start - JSON Auth System

## ✅ What's Done

Your auth system is now **100% JSON-based** - no database needed!

### Features
- ✅ Username + Password only (no email)
- ✅ Role-based access (CEO, Manager)
- ✅ Role codes for signup
- ✅ Session management
- ✅ Dashboard with role permissions
- ✅ Logout functionality

## 🎯 How to Use

### 1. Start the Server

```bash
npm run dev
```

### 2. Signup (First Time)

1. Go to `http://localhost:3000/signup`
2. Enter:
   - **Username**: `admin` (3-30 chars)
   - **Password**: `admin123` (6+ chars)
   - **Role Code**: `CE@` (from .env - CEO_ROLE_CODE)
3. Click "إنشاء حساب"
4. You'll be redirected to `/login`

### 3. Login

1. Go to `http://localhost:3000/login`
2. Enter:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click "تسجيل الدخول"
4. You'll be redirected to `/dashboard` ✨

### 4. Dashboard Access

Only these roles can access dashboard:
- ✅ `ceo` - Full access
- ✅ `manager` - Full access
- ❌ `student` - No dashboard access
- ❌ `teacher` - No dashboard access

## 🔑 Role Codes (from .env)

```env
CEO_ROLE_CODE=CE@
MANAGER_ROLE_CODE=MG$
```

## 📁 Data Files

All data stored in `data/` folder:
- `users.json` - User accounts
- `sessions.json` - Active sessions
- `competitions.json` - Competitions
- `questions.json` - Questions
- `submissions.json` - Submissions

## 🔒 Security

- Passwords hashed with SHA-256
- Sessions expire after 7 days
- HTTP-only cookies
- Role-based access control
- Middleware protects dashboard routes

## 🎨 What Works

1. **Signup** → Creates user with role
2. **Login** → Creates session, redirects to dashboard
3. **Dashboard** → Shows based on role permissions
4. **Logout** → Clears session, redirects to login
5. **Middleware** → Protects dashboard routes

## 🚨 Troubleshooting

### Can't access dashboard?
- Make sure you used a valid role code (CEO or MANAGER)
- Check `data/users.json` to see your role
- Try logging out and back in

### Session expired?
- Sessions last 7 days
- Just login again

### Forgot role code?
- Check `.env` file for role codes
- Default codes are in `.env.example`

## 🎉 You're Ready!

The system is fully functional. Just run `npm run dev` and start using it!
