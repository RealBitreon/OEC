# 🧪 Settings Section - Testing Guide

## Quick Test Scenarios

### 🎯 Test 1: Role-Based Access

#### CEO/LRC_MANAGER User
1. Login as CEO or LRC_MANAGER
2. Navigate to Settings (الإعدادات)
3. **Expected**: Only 2 tabs visible
   - 🔒 الأمان (Security)
   - 🎨 المظهر (Appearance)
4. **Expected**: Default tab is Security

#### Student User
1. Login as Student
2. Navigate to Settings (الإعدادات)
3. **Expected**: All 4 tabs visible
   - 👤 الملف الشخصي (Profile)
   - 🔔 الإشعارات (Notifications)
   - 🔒 الأمان (Security)
   - 🎨 المظهر (Appearance)
4. **Expected**: Default tab is Profile

---

### 🎯 Test 2: Profile Validation

#### Valid Input
1. Go to Profile tab
2. Enter valid data:
   - Display Name: "أحمد محمد"
   - Email: "ahmed@example.com"
   - Phone: "0512345678"
   - Bio: "طالب مجتهد"
3. Click "حفظ التغييرات"
4. **Expected**: Green success message "تم حفظ التغييرات بنجاح"

#### Invalid Email
1. Enter invalid email: "notanemail"
2. Click save
3. **Expected**: 
   - Red border on email field
   - Error message: "البريد الإلكتروني غير صحيح"

#### Invalid Phone
1. Enter invalid phone: "123"
2. Click save
3. **Expected**:
   - Red border on phone field
   - Error message: "رقم الهاتف غير صحيح (مثال: 0512345678)"

#### Empty Display Name
1. Clear display name field
2. Click save
3. **Expected**:
   - Red border on display name field
   - Error message: "الاسم الكامل مطلوب"

---

### 🎯 Test 3: Password Security

#### Weak Password
1. Go to Security tab
2. Enter current password
3. Enter new password: "123"
4. **Expected**:
   - Strength indicator shows "ضعيفة" (Weak) in red
   - Red progress bar (33%)
   - Cannot submit (button disabled or error on submit)

#### Medium Password
1. Enter new password: "Password123"
2. **Expected**:
   - Strength indicator shows "متوسطة" (Medium) in yellow
   - Yellow progress bar (66%)

#### Strong Password
1. Enter new password: "MyP@ssw0rd123!"
2. **Expected**:
   - Strength indicator shows "قوية" (Strong) in green
   - Green progress bar (100%)

#### Password Mismatch
1. Enter strong password
2. Enter different confirmation password
3. **Expected**:
   - Error message: "كلمات المرور غير متطابقة"
   - Submit button disabled

#### Wrong Current Password
1. Enter wrong current password
2. Enter valid new password
3. Click submit
4. **Expected**: Error message "كلمة المرور الحالية غير صحيحة"

#### Successful Password Change
1. Enter correct current password
2. Enter strong new password (8+ chars, mixed case, numbers, special)
3. Confirm password matches
4. Click "تغيير كلمة المرور"
5. **Expected**:
   - Green success message
   - Form clears
   - Audit log entry created

---

### 🎯 Test 4: Theme Switching

#### Light Theme
1. Go to Appearance tab
2. Click "فاتح" (Light) theme card
3. **Expected**:
   - Theme applies immediately
   - Preview shows light colors
   - Blue border on selected card

#### Dark Theme
1. Click "داكن" (Dark) theme card
2. **Expected**:
   - Dark mode activates immediately
   - Preview shows dark colors
   - Page background turns dark

#### Auto Theme
1. Click "تلقائي" (Auto) theme card
2. **Expected**:
   - Theme follows system preference
   - Preview updates accordingly

#### Theme Persistence
1. Select a theme
2. Click "حفظ التغييرات"
3. Refresh page
4. **Expected**: Selected theme persists

---

### 🎯 Test 5: Notifications

#### Toggle Switches
1. Go to Notifications tab
2. Click each toggle switch
3. **Expected**:
   - Smooth animation
   - Blue when ON, gray when OFF
   - Toggle position changes

#### Save Notifications
1. Change some notification settings
2. Click "حفظ الإعدادات"
3. **Expected**: Green success message

#### Load Notifications
1. Refresh page
2. Go to Notifications tab
3. **Expected**:
   - Loading spinner appears briefly
   - Previous settings load correctly

---

### 🎯 Test 6: Loading States

#### Initial Load
1. Navigate to Settings
2. **Expected**: Brief loading spinner in center

#### Tab Switch
1. Switch between tabs
2. **Expected**: Smooth transition, no flicker

#### Save Operation
1. Make changes in any tab
2. Click save button
3. **Expected**:
   - Button shows "جاري الحفظ..." (Saving...)
   - Button is disabled
   - Success/error message appears after

---

### 🎯 Test 7: Responsive Design

#### Mobile View (< 768px)
1. Resize browser to mobile width
2. **Expected**:
   - Tabs scroll horizontally
   - Single column layout
   - Touch-friendly buttons

#### Tablet View (768px - 1024px)
1. Resize to tablet width
2. **Expected**:
   - Two column grid for forms
   - Comfortable spacing

#### Desktop View (> 1024px)
1. Full screen
2. **Expected**:
   - Optimal layout
   - Multi-column grids

---

### 🎯 Test 8: Dark Mode

#### All Tabs in Dark Mode
1. Enable dark theme
2. Visit each tab
3. **Expected**:
   - Proper contrast
   - Readable text
   - No white flashes
   - Consistent colors

---

### 🎯 Test 9: Error Handling

#### Network Error
1. Disconnect internet
2. Try to save settings
3. **Expected**: Red error message

#### Invalid Data
1. Enter invalid data in multiple fields
2. Click save
3. **Expected**: All errors show at once

#### Success After Error
1. Fix errors
2. Save again
3. **Expected**: Success message replaces error

---

### 🎯 Test 10: Accessibility

#### Keyboard Navigation
1. Use Tab key to navigate
2. **Expected**: Logical tab order

#### Screen Reader
1. Use screen reader
2. **Expected**: Proper labels and descriptions

#### Color Contrast
1. Check all text
2. **Expected**: WCAG AA compliance

---

## 🐛 Common Issues & Solutions

### Issue: Settings not saving
**Solution**: Check browser console for errors, verify API connection

### Issue: Theme not applying
**Solution**: Clear localStorage, refresh page

### Issue: Password change fails
**Solution**: Verify current password is correct, check password requirements

### Issue: Validation not working
**Solution**: Check that all required fields are filled correctly

---

## ✅ Test Results Template

```
Date: _____________
Tester: _____________

[ ] Test 1: Role-Based Access
[ ] Test 2: Profile Validation
[ ] Test 3: Password Security
[ ] Test 4: Theme Switching
[ ] Test 5: Notifications
[ ] Test 6: Loading States
[ ] Test 7: Responsive Design
[ ] Test 8: Dark Mode
[ ] Test 9: Error Handling
[ ] Test 10: Accessibility

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Overall Status: [ ] Pass [ ] Fail
```

---

## 🎯 Performance Benchmarks

- **Initial Load**: < 1 second
- **Tab Switch**: < 100ms
- **Save Operation**: < 2 seconds
- **Theme Change**: Instant
- **Validation**: < 50ms

---

**Testing Guide Version**: 1.0.0
**Last Updated**: January 31, 2026
**Status**: ✅ Ready for Testing
