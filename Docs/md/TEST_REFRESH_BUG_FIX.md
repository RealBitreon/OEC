# TEST GUIDE - Refresh Bug Fix

## Quick Test (2 minutes)

### Test 1: No Auto-Refresh ✅
1. Open browser DevTools → Network tab
2. Navigate to `/dashboard`
3. Wait 3 minutes
4. **Expected:** `/api/session` called ONCE on load, never again
5. **Expected:** No page refreshes

### Test 2: Form Data Preserved ✅
1. Go to "الأسئلة التدريبية" (Training Questions)
2. Click "إضافة سؤال" (Add Question)
3. Type some text in "نص السؤال" field
4. Click "نظرة عامة" (Overview) in sidebar
5. Click back to "الأسئلة التدريبية"
6. Click "إضافة سؤال" again
7. **Expected:** Your typed text is restored from localStorage

### Test 3: Manual Refresh Recovery ✅
1. Start typing in question form
2. Press F5 to refresh page
3. Navigate back to question form
4. **Expected:** Draft restored from localStorage

### Test 4: Client-Side Navigation ✅
1. Open Network tab
2. Click between different sections in sidebar
3. **Expected:** NO full page reloads
4. **Expected:** NO new `/api/session` calls
5. **Expected:** Instant navigation

### Test 5: No Accidental Submits ✅
1. Open question form
2. Press Enter in various text fields
3. **Expected:** NO POST requests to `/dashboard`
4. **Expected:** Form only submits when clicking "حفظ" button

---

## Detailed Test (10 minutes)

### Test 6: Long Typing Session
1. Open question form
2. Type continuously for 5 minutes
3. Switch between fields
4. Add/remove options
5. **Expected:** Zero interruptions, zero resets

### Test 7: Competition Form
1. Go to "إدارة المسابقات"
2. Click "إنشاء مسابقة جديدة"
3. Fill in title and description
4. Navigate away
5. Come back
6. **Expected:** Draft restored

### Test 8: localStorage Cleanup
1. Create and save a question successfully
2. Open browser DevTools → Application → Local Storage
3. **Expected:** `draft:question:new` key is removed after save

### Test 9: Multiple Drafts
1. Start creating question → type some text → navigate away
2. Start creating competition → type some text → navigate away
3. Check localStorage
4. **Expected:** Both drafts saved with different keys
5. Return to each form
6. **Expected:** Both drafts restored correctly

### Test 10: Network Efficiency
1. Open Network tab
2. Use dashboard for 10 minutes
3. Navigate between sections
4. Open/close forms
5. **Expected:** `/api/session` called ONCE total
6. **Expected:** No repeated polling

---

## Browser Console Checks

### Should See:
```
Session response: { user: { ... } }
Profile found: [username] [role]
```

### Should NOT See:
- Repeated "Session response" logs
- "Failed to fetch session" errors (unless actually logged out)
- React hydration errors
- Unmounted component warnings

---

## localStorage Keys to Monitor

After using the dashboard, check Application → Local Storage:

### Expected Keys:
- `draft:question:new` - When creating new question (removed after save)
- `draft:question:[id]` - When editing question (removed after save)
- `draft:competition:new` - When creating competition (removed after save)
- `draft:competition:[id]` - When editing competition (removed after save)

### Should NOT Exist:
- Old drafts after successful save
- Corrupted JSON data

---

## Performance Metrics

### Before Fix:
- Session API calls: 10-20+ per minute
- Page reloads: 2-5 per minute
- Form resets: Frequent
- User frustration: High

### After Fix:
- Session API calls: 1 per dashboard visit
- Page reloads: 0 (except manual refresh)
- Form resets: 0
- User frustration: None

---

## Edge Cases to Test

### Edge Case 1: Slow Network
1. Open DevTools → Network → Throttle to "Slow 3G"
2. Navigate to dashboard
3. **Expected:** Session loads once, no retries

### Edge Case 2: Browser Back Button
1. Navigate to dashboard
2. Go to different section
3. Press browser back button
4. **Expected:** Works correctly, no refresh

### Edge Case 3: Multiple Tabs
1. Open dashboard in two tabs
2. Edit form in tab 1
3. Switch to tab 2
4. **Expected:** Each tab has independent state
5. **Expected:** No cross-tab interference

### Edge Case 4: Session Expiry
1. Let session expire (or manually delete cookies)
2. Try to use dashboard
3. **Expected:** Redirect to login (handled by middleware)
4. **Expected:** No infinite loops

---

## Regression Tests

### Must Still Work:
- ✅ Login/logout flow
- ✅ Role-based permissions
- ✅ Creating questions
- ✅ Creating competitions
- ✅ Editing existing items
- ✅ Deleting items
- ✅ All dashboard sections
- ✅ Mobile sidebar
- ✅ Dark mode toggle

---

## Success Criteria

All tests must pass:
- [ ] No unexpected page refreshes
- [ ] Session API called once per visit
- [ ] Form data preserved in localStorage
- [ ] Client-side navigation works
- [ ] No accidental form submissions
- [ ] Drafts cleared after successful save
- [ ] Can type for 10+ minutes uninterrupted
- [ ] Manual refresh recovers draft
- [ ] No console errors
- [ ] All existing features still work

---

**If all tests pass:** ✅ Ready for production
**If any test fails:** ❌ Review REFRESH_BUG_FIX_COMPLETE.md for implementation details
