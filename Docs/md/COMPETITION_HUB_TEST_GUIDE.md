# 🧪 Competition Hub - Testing Guide

## Quick Test Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Login as Admin
Navigate to: `http://localhost:3000/login`
- Use your CEO or LRC_MANAGER credentials

### 3. Access Dashboard
You should be redirected to: `http://localhost:3000/dashboard`

### 4. Navigate to Competitions
Click on "إدارة المسابقات" (Competitions Management) in the sidebar

### 5. View a Competition
Click the "عرض المسابقة" (View Competition) button on any competition card

**Expected Result:** You should see the Competition Hub with 4 cards

### 6. Test Each Section

#### A. Manage Competition (إدارة المسابقة)
1. Click the "إدارة المسابقة" card
2. Try editing the competition details
3. Update dates or rules
4. Click "حفظ" (Save)
5. Click "العودة إلى المسابقة" (Back to Competition)

**Expected:** Changes should be saved successfully

#### B. Questions (الأسئلة)
1. Click the "الأسئلة" card
2. Try adding a new question
3. Fill in all required fields
4. Click "حفظ" (Save)
5. View the question in the list

**Expected:** Question should appear in the list

#### C. Student Submissions (إجابات الطلاب)
1. Click the "إجابات الطلاب" card
2. View the submissions list
3. Try filtering by status
4. Click "عرض" (View) on a submission
5. Review and approve/reject

**Expected:** Submission review interface should work

#### D. Wheel of Fortune (عجلة الحظ)
1. Click the "عجلة الحظ" card
2. View prizes list
3. Try adding a new prize
4. Set probability and quantity
5. Click "حفظ" (Save)

**Expected:** Prize should be added successfully

---

## ✅ Success Criteria

### Navigation
- [x] No redirect loops
- [x] All pages load without errors
- [x] Back buttons work correctly
- [x] URLs are correct

### Authentication
- [x] Only CEO and LRC_MANAGER can access
- [x] Students are redirected to dashboard
- [x] Unauthenticated users go to login

### Data Display
- [x] Competition details show correctly
- [x] All sections load their data
- [x] No console errors
- [x] Loading states appear

### Functionality
- [x] Forms submit successfully
- [x] Data updates in real-time
- [x] Validation works
- [x] Error messages are clear

---

## 🐛 Common Issues & Solutions

### Issue: Redirect Loop
**Symptom:** Page keeps redirecting to /dashboard
**Solution:** 
- Check user role in database
- Ensure role is 'CEO' or 'LRC_MANAGER' (exact case)
- Verify users table has correct auth_id

### Issue: "Profile not found"
**Symptom:** Error message about missing profile
**Solution:**
- Run the auth setup SQL script
- Ensure user exists in users table
- Check auth_id matches Supabase auth user

### Issue: Competition not loading
**Symptom:** Competition data doesn't appear
**Solution:**
- Check competition exists in database
- Verify competition ID in URL is correct
- Check browser console for errors

### Issue: Can't save changes
**Symptom:** Save button doesn't work
**Solution:**
- Check form validation
- Look for console errors
- Verify user has correct permissions
- Check database connection

---

## 🔍 Debugging Tips

### Check Console Logs
The pages log detailed information:
```
=== Competition Page ===
Competition ID: [id]
User: [user_id] [email]
Profile: [profile_data]
Profile role: [role]
✅ All checks passed, rendering CompetitionHub
```

### Check Network Tab
- Look for failed API calls
- Check response status codes
- Verify request payloads

### Check Database
```sql
-- Check user exists
SELECT * FROM users WHERE auth_id = '[auth_id]';

-- Check competition exists
SELECT * FROM competitions WHERE id = '[competition_id]';

-- Check user role
SELECT id, username, role FROM users WHERE auth_id = '[auth_id]';
```

---

## 📊 Test Data Setup

### Create Test Competition
```sql
INSERT INTO competitions (
  id, 
  title, 
  description, 
  status, 
  start_at, 
  end_at, 
  wheel_at,
  rules
) VALUES (
  gen_random_uuid(),
  'مسابقة تجريبية',
  'مسابقة للاختبار',
  'draft',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '37 days',
  '{"eligibilityMode": "all_correct", "minCorrectAnswers": 5, "ticketsConfig": {"baseTickets": 1, "earlyBonusTiers": []}}'::jsonb
);
```

### Create Test Question
```sql
INSERT INTO questions (
  id,
  competition_id,
  type,
  question_text,
  correct_answer,
  volume,
  page,
  line_from,
  line_to,
  is_active
) VALUES (
  gen_random_uuid(),
  '[competition_id]',
  'text',
  'ما هو السؤال التجريبي؟',
  'الإجابة التجريبية',
  '1',
  '10',
  '5',
  '7',
  true
);
```

---

## 🎯 Performance Testing

### Load Time
- Hub page should load in < 2 seconds
- Sub-pages should load in < 1 second
- No blocking operations

### Responsiveness
- Test on mobile (375px width)
- Test on tablet (768px width)
- Test on desktop (1920px width)

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## 📝 Test Report Template

```markdown
## Test Report - Competition Hub

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]

### Test Results

#### Navigation
- [ ] Hub page loads
- [ ] Manage page loads
- [ ] Questions page loads
- [ ] Submissions page loads
- [ ] Wheel page loads
- [ ] Back buttons work

#### Functionality
- [ ] Can edit competition
- [ ] Can add questions
- [ ] Can review submissions
- [ ] Can manage prizes

#### Issues Found
1. [Issue description]
2. [Issue description]

#### Screenshots
[Attach screenshots if needed]

### Conclusion
[Pass/Fail with notes]
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] Audit logging works
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Arabic RTL correct
- [ ] User permissions verified

---

**Happy Testing! 🎉**
