# ⚡ Quick Start - Authentication Testing

## 🎯 Test in 5 Minutes

### Step 1: Setup Database (2 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to SQL Editor
3. Copy contents of `supabase-schema.sql`
4. Paste and run
5. ✅ Verify `profiles` table exists

### Step 2: Start Server (30 seconds)

```bash
npm run dev
```

### Step 3: Test Signup (1 minute)

1. Visit: http://localhost:3000/signup
2. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Confirm: `password123`
3. Click "إنشاء حساب"
4. ✅ Should redirect to `/dashboard`

### Step 4: Test Logout (30 seconds)

1. Click "تسجيل الخروج" button
2. ✅ Should redirect to `/login`

### Step 5: Test Login (1 minute)

1. Visit: http://localhost:3000/login
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "تسجيل الدخول"
4. ✅ Should redirect to `/dashboard`

---

## 🔐 Test Admin Roles

### Create CEO Account

1. Visit: http://localhost:3000/signup
2. Fill in details
3. Click "لديك رمز دور إداري؟"
4. Enter role code: `CE@`
5. Submit
6. ✅ Dashboard shows "المدير التنفيذي" badge

### Create Manager Account

1. Visit: http://localhost:3000/signup
2. Fill in details
3. Click "لديك رمز دور إداري؟"
4. Enter role code: `$RC`
5. Submit
6. ✅ Dashboard shows "مدير" badge

---

## 🧪 Test Error Cases

### Duplicate Email
1. Try to signup with existing email
2. ✅ Shows: "البريد الإلكتروني مستخدم بالفعل."

### Duplicate Username
1. Try to signup with existing username
2. ✅ Shows: "اسم المستخدم مستخدم بالفعل."

### Wrong Password
1. Try to login with wrong password
2. ✅ Shows: "بيانات الدخول غير صحيحة. حاول مرة أخرى."

### Invalid Role Code
1. Enter wrong role code during signup
2. ✅ Shows: "رمز الدور غير صحيح."

### Password Mismatch
1. Enter different passwords in signup
2. ✅ Shows: "كلمات المرور غير متطابقة."

---

## 🛡️ Test Protected Routes

### Access Dashboard (Logged Out)
1. Logout if logged in
2. Visit: http://localhost:3000/dashboard
3. ✅ Redirects to `/login`

### Access Login (Logged In)
1. Login first
2. Visit: http://localhost:3000/login
3. ✅ Redirects to `/dashboard`

### Access Signup (Logged In)
1. Login first
2. Visit: http://localhost:3000/signup
3. ✅ Redirects to `/dashboard`

---

## ✅ Success Criteria

All tests should pass:
- ✅ Signup creates account and redirects
- ✅ Login authenticates and redirects
- ✅ Logout clears session and redirects
- ✅ Protected routes require authentication
- ✅ Role codes work correctly
- ✅ Error messages are in Arabic
- ✅ UI is RTL and responsive
- ✅ No console errors

---

## 🚨 Common Issues

### Issue: "Cannot find module" error
**Solution:** Ignore - TypeScript language server issue, works at runtime

### Issue: Redirect loop
**Solution:** Clear cookies and try again

### Issue: Profile not created
**Solution:** Run `supabase-schema.sql` in Supabase SQL Editor

### Issue: Role code not working
**Solution:** Check `.env` file has correct codes

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Signup works
[ ] Login works
[ ] Logout works
[ ] CEO role works
[ ] Manager role works
[ ] Protected routes work
[ ] Error messages work
[ ] UI is RTL
[ ] No console errors

Notes:
_______________________
_______________________
```

---

**Ready to test? Start with Step 1! 🚀**
