# Quick Test Guide - CEO Redirect Fix

## 🚀 Quick Start

### 1. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cookies and cached files
- Or use Incognito/Private window

### 3. Test Login Flow

#### Test 1: CEO Login
1. Go to `http://localhost:3000/sign-in`
2. Login with CEO credentials
3. **Expected**: Redirect to `/ceo`
4. **Should see**: "لوحة التحكم الرئيسية" (CEO Dashboard)
5. **Check**: Sidebar shows CEO-specific options

#### Test 2: Manager Login
1. Logout (if logged in)
2. Go to `http://localhost:3000/sign-in`
3. Login with Manager credentials
4. **Expected**: Redirect to `/manager`
5. **Should see**: "لوحة التحكم" (Manager Dashboard)

#### Test 3: Student Login
1. Logout (if logged in)
2. Go to `http://localhost:3000/sign-in`
3. Login with Student credentials
4. **Expected**: Redirect to `/` (home page)
5. **Should see**: Home page content

### 4. Test Direct Access

#### Test 4: Access /ceo while logged out
1. Logout completely
2. Go to `http://localhost:3000/ceo`
3. **Expected**: Redirect to `/sign-in`

#### Test 5: Manager tries to access /ceo
1. Login as Manager
2. Go to `http://localhost:3000/ceo`
3. **Expected**: Redirect to `/manager`

#### Test 6: CEO accesses /manager
1. Login as CEO
2. Go to `http://localhost:3000/manager`
3. **Expected**: Access granted (CEO has all Manager permissions)

---

## 🔍 What to Check

### Console Logs
Open browser console (F12) and look for:
- ✅ `[DASHBOARD-REDIRECT] User: xxx Role: CEO` (or other role)
- ✅ No error messages
- ✅ No infinite redirect warnings

### Network Tab
Check Network tab (F12 → Network):
- ✅ `/dashboard` returns 307 redirect
- ✅ Final destination is correct (`/ceo`, `/manager`, or `/`)
- ✅ No 404 errors
- ✅ No infinite redirect loops

### Visual Checks
- ✅ Dashboard loads completely
- ✅ Sidebar shows correct options
- ✅ Header shows user info
- ✅ Stats cards display data
- ✅ Quick action buttons work

---

## 🐛 Troubleshooting

### Issue: Still redirecting to wrong page
**Solution**:
1. Clear browser cache completely
2. Restart dev server
3. Try incognito window

### Issue: "No role found" error
**Solution**:
```bash
# Check user roles
node scripts/set-user-role.js list

# Assign CEO role
node scripts/set-user-role.js <user-id> CEO
```

### Issue: 404 on /dashboard
**Solution**:
1. Restart Next.js dev server
2. Check if `app/dashboard/page.tsx` exists
3. Clear `.next` cache: `rm -rf .next` (or delete folder)

### Issue: Infinite redirect loop
**Solution**:
1. Check middleware.ts - ensure `/sign-in` is in public routes
2. Check browser console for redirect chain
3. Clear cookies and try again

### Issue: Blank page after login
**Solution**:
1. Check browser console for errors
2. Verify Clerk keys in `.env`
3. Check if user has role assigned in Clerk

---

## 📋 Checklist

Before marking as complete, verify:

- [ ] CEO login redirects to `/ceo` ✅
- [ ] Manager login redirects to `/manager` ✅
- [ ] Student login redirects to `/` ✅
- [ ] Direct `/ceo` access (logged out) redirects to `/sign-in` ✅
- [ ] Manager accessing `/ceo` redirects to `/manager` ✅
- [ ] CEO can access `/manager` ✅
- [ ] No console errors ✅
- [ ] No infinite redirect loops ✅
- [ ] Loading states show properly ✅
- [ ] Dashboard renders completely ✅
- [ ] Sidebar navigation works ✅
- [ ] Quick actions work ✅

---

## 🎯 Expected Results

### CEO Dashboard (`/ceo`)
```
✅ Header: "لوحة التحكم الرئيسية"
✅ Stats: Submissions today, Total tickets, Pending reviews, Total users
✅ Active competition card (if exists)
✅ Quick actions: New competition, New question, Review answers, Wheel
✅ Management links: User roles, Audit log, Archives
✅ Sidebar: All CEO options visible
```

### Manager Dashboard (`/manager`)
```
✅ Header: "لوحة التحكم"
✅ Stats: Active questions, Registered students, Total answers, Pending reviews
✅ Active competition card (if exists)
✅ Quick actions: New competition, New question, Review answers, Wheel
✅ Submission stats: Correct, Incorrect, Pending
✅ Sidebar: Manager options visible
```

---

## 🔑 Role Assignment Commands

### List all users
```bash
node scripts/set-user-role.js list
```

### Set roles
```bash
# CEO
node scripts/set-user-role.js <user-id> CEO

# Manager
node scripts/set-user-role.js <user-id> LRC_MANAGER

# Student (default)
node scripts/set-user-role.js <user-id> STUDENT
```

### Quick interactive setup
```bash
quick-dashboard-fix.bat
```

---

## 📞 Need Help?

If issues persist:

1. **Check logs**: Look at terminal where `npm run dev` is running
2. **Check browser console**: Press F12 and look for errors
3. **Verify environment**: Ensure `.env` has all required Clerk keys
4. **Check role assignment**: Verify user has role in Clerk dashboard
5. **Review documentation**: See `CEO-REDIRECT-FIX.md` for details

---

## ✅ Success Criteria

The fix is working correctly when:

1. ✅ CEO users land on `/ceo` after login
2. ✅ Manager users land on `/manager` after login
3. ✅ Student users land on `/` after login
4. ✅ Unauthenticated users are redirected to `/sign-in`
5. ✅ Wrong role access is redirected to correct dashboard
6. ✅ No console errors or warnings
7. ✅ No infinite redirect loops
8. ✅ Dashboard loads and displays correctly
9. ✅ All navigation works properly
10. ✅ Loading states show during redirects

**If all criteria are met, the fix is complete! 🎉**
