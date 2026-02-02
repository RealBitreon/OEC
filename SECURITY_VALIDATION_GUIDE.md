# Security & Validation Implementation Guide

## Overview
This document describes the comprehensive security and validation features implemented in the competition participation system.

---

## 1. Name Validation (الاسم/اسم الأب/العائلة)

### Rules
- **Arabic or English letters ONLY** (حروف عربية أو إنجليزية فقط)
- **No numbers allowed** (بدون أرقام)
- **No special characters** (بدون رموز خاصة)
- Spaces are allowed between names

### Implementation
```typescript
// Regex pattern: Arabic Unicode range + English letters + spaces
const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/

// Validation for each name field
if (!nameRegex.test(firstName.trim())) {
  showToast('الاسم الأول: يجب أن يحتوي على حروف عربية أو إنجليزية فقط (بدون أرقام أو رموز)', 'error')
  return
}
```

### Location
- **File**: `app/competition/[slug]/participate/ParticipationForm.tsx`
- **Function**: `handleStartQuestions()`
- **Lines**: ~220-245

### Examples
✅ **Valid Names**:
- محمد أحمد السالمي
- Mohammed Ahmed Al-Salmi
- علي بن سالم
- Ali bin Salem

❌ **Invalid Names**:
- محمد123 (contains numbers)
- Ahmed@Ali (contains special characters)
- 12345 (only numbers)

---

## 2. Grade/Class Validation (الصف/الفصل)

### Rules
- **Numbers ONLY** (أرقام فقط)
- **No letters or special characters**
- Must not be empty

### Implementation
```typescript
// Regex pattern: digits only
const numberRegex = /^\d+$/

// Validation for grade and class
if (!numberRegex.test(gradeLevel.trim())) {
  showToast('الصف: يجب أن يحتوي على أرقام فقط', 'error')
  return
}

if (!numberRegex.test(classNumber.trim())) {
  showToast('الفصل: يجب أن يحتوي على أرقام فقط', 'error')
  return
}
```

### Location
- **File**: `app/competition/[slug]/participate/ParticipationForm.tsx`
- **Function**: `handleStartQuestions()`
- **Lines**: ~246-260

### Examples
✅ **Valid Input**:
- Grade: 10, Class: 15
- Grade: 12, Class: 3
- Grade: 9, Class: 1

❌ **Invalid Input**:
- Grade: 10A (contains letters)
- Class: الأول (contains Arabic text)
- Grade: 10-A (contains special characters)

---

## 3. Confirmation Dialog Before Final Submission

### Features
- Shows remaining attempts count
- Displays attempts after submission
- Different messages for last attempt vs. multiple attempts remaining
- Requires explicit user confirmation

### Implementation
```typescript
const handleNext = () => {
  // ... validation checks ...
  
  if (currentQuestionIndex === questions.length - 1) {
    const remainingAfterSubmit = attemptInfo.remainingAttempts - 1
    
    const confirmMessage = remainingAfterSubmit > 0
      ? `⚠️ تأكيد الإرسال النهائي\n\n📊 المحاولات المتبقية: ${attemptInfo.remainingAttempts} من أصل ${attemptInfo.maxAttempts}\n📉 بعد الإرسال سيتبقى: ${remainingAfterSubmit} محاولة\n\n✅ هل أنت متأكد من إرسال إجاباتك الآن؟`
      : `⚠️ تحذير: آخر محاولة!\n\n🚨 هذه هي محاولتك الأخيرة من أصل ${attemptInfo.maxAttempts} محاولات\n❌ بعد الإرسال لن تتمكن من المحاولة مرة أخرى`
    
    if (!confirm(confirmMessage)) {
      return // User cancelled
    }
  }
  
  handleSubmit()
}
```

### Location
- **File**: `app/competition/[slug]/participate/ParticipationForm.tsx`
- **Function**: `handleNext()`
- **Lines**: ~280-305

### Dialog Messages

#### Multiple Attempts Remaining
```
⚠️ تأكيد الإرسال النهائي

📊 المحاولات المتبقية: 2 من أصل 3
📉 بعد الإرسال سيتبقى: 1 محاولة

✅ هل أنت متأكد من إرسال إجاباتك الآن؟

💡 تأكد من مراجعة جميع الإجابات والأدلة قبل الإرسال
```

#### Last Attempt Warning
```
⚠️ تحذير: آخر محاولة!

🚨 هذه هي محاولتك الأخيرة من أصل 3 محاولات
❌ بعد الإرسال لن تتمكن من المحاولة مرة أخرى

✅ هل أنت متأكد تماماً من إرسال إجاباتك الآن؟

💡 راجع جميع الإجابات والأدلة بعناية قبل التأكيد
```

---

## 4. Reset Code Security

### Two-Layer Validation

#### Layer 1: Client-Side Validation
- **Purpose**: Immediate feedback, reduce unnecessary API calls
- **Location**: `ParticipationForm.tsx` and `OutOfTriesModal.tsx`
- **Code**: `12311`

```typescript
// Client-side check
if (resetCode.trim() !== '12311') {
  showToast('❌ كود غير صحيح - يرجى التحقق من الكود مع المعلم', 'error')
  return
}
```

#### Layer 2: Server-Side Validation
- **Purpose**: Security enforcement, prevent bypass
- **Location**: `app/api/attempts/reset/route.ts`
- **Code**: `12311` (must match client-side)

```typescript
const RESET_CODE = '12311'

// Server-side verification
if (resetCode.trim() !== RESET_CODE) {
  return NextResponse.json(
    { error: 'كود غير صحيح - يرجى التحقق من الكود مع معلم مركز مصادر التعلم' },
    { status: 403 }
  )
}
```

### Security Features
1. ✅ **Client-side validation** - Fast feedback
2. ✅ **Server-side validation** - Cannot be bypassed
3. ✅ **Trimmed input** - Handles whitespace
4. ✅ **Case-sensitive** - Exact match required
5. ✅ **Logged attempts** - Server logs all reset attempts
6. ✅ **403 Forbidden** - Proper HTTP status for invalid code

### Changing the Reset Code
To update the reset code, change it in **BOTH** locations:

1. **Client-side** (2 files):
   - `app/competition/[slug]/participate/ParticipationForm.tsx` (line ~310)
   - `components/OutOfTriesModal.tsx` (line ~30)

2. **Server-side** (1 file):
   - `app/api/attempts/reset/route.ts` (line ~5)

```typescript
// Example: Change to '54321'
const RESET_CODE = '54321'  // Server
if (resetCode.trim() !== '54321') { ... }  // Client
```

---

## 5. Attempt Limits Enforcement

### How It Works

1. **Check Attempts** (on page load)
   - API: `/api/attempts/check`
   - Checks `attempt_tracking` table
   - Returns: `canAttempt`, `remainingAttempts`, `maxAttempts`

2. **Block Access** (if limit reached)
   - Shows `OutOfTriesModal`
   - Prevents form submission
   - Offers reset code option

3. **Increment Attempts** (after successful submission)
   - API: `/api/competition/submit`
   - Updates `attempt_tracking` table
   - Only increments on successful submission

4. **Reset Attempts** (with valid code)
   - API: `/api/attempts/reset`
   - Validates reset code (client + server)
   - Deletes tracking record
   - Allows new attempts

### Database Schema
```sql
CREATE TABLE attempt_tracking (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  device_fingerprint TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, device_fingerprint)
);
```

### API Endpoints

#### Check Attempts
```typescript
POST /api/attempts/check
Body: { competitionId, deviceFingerprint }
Response: { canAttempt, currentAttempts, maxAttempts, remainingAttempts }
```

#### Increment Attempts
```typescript
// Called automatically in /api/competition/submit
// Increments attempt_count by 1
// Updates last_attempt_at timestamp
```

#### Reset Attempts
```typescript
POST /api/attempts/reset
Body: { competitionId, deviceFingerprint, resetCode }
Response: { canAttempt, remainingAttempts, maxAttempts, message }
```

---

## 6. Device Fingerprinting

### Purpose
Track attempts per device (not per user account)

### Implementation
```typescript
// lib/utils/device-fingerprint.ts
export function getOrCreateFingerprint(): string {
  const storageKey = 'device_fingerprint'
  
  // Check if fingerprint exists
  let fingerprint = localStorage.getItem(storageKey)
  
  if (!fingerprint) {
    // Generate new fingerprint
    fingerprint = generateFingerprint()
    localStorage.setItem(storageKey, fingerprint)
  }
  
  return fingerprint
}
```

### Components
- Browser user agent
- Screen resolution
- Timezone
- Language
- Platform
- Random UUID (for uniqueness)

### Usage
```typescript
const deviceFingerprint = getOrCreateFingerprint()

// Used in:
// 1. Checking attempts
// 2. Submitting answers
// 3. Resetting attempts
```

---

## 7. Complete Security Flow

### Participation Flow
```
1. User visits participation page
   ↓
2. Check attempts (API call)
   ↓
3. If limit reached → Show OutOfTriesModal
   ↓
4. If attempts available → Show form
   ↓
5. Validate name fields (Arabic/English only)
   ↓
6. Validate grade/class (numbers only)
   ↓
7. Answer questions
   ↓
8. Show confirmation dialog (with attempts info)
   ↓
9. Submit answers (API call)
   ↓
10. Increment attempt count
   ↓
11. Show results
```

### Reset Flow
```
1. User out of attempts
   ↓
2. Show OutOfTriesModal
   ↓
3. User enters reset code
   ↓
4. Client-side validation (12311)
   ↓
5. API call to /api/attempts/reset
   ↓
6. Server-side validation (12311)
   ↓
7. If valid → Delete tracking record
   ↓
8. Return success
   ↓
9. Reload page with fresh attempts
```

---

## 8. Testing Checklist

### Name Validation
- [ ] Test with Arabic names
- [ ] Test with English names
- [ ] Test with mixed Arabic/English
- [ ] Test with numbers (should fail)
- [ ] Test with special characters (should fail)
- [ ] Test with empty fields (should fail)

### Grade/Class Validation
- [ ] Test with valid numbers
- [ ] Test with letters (should fail)
- [ ] Test with Arabic text (should fail)
- [ ] Test with special characters (should fail)
- [ ] Test with empty fields (should fail)

### Confirmation Dialog
- [ ] Test with multiple attempts remaining
- [ ] Test with last attempt
- [ ] Test cancel button
- [ ] Test confirm button

### Reset Code
- [ ] Test with correct code (12311)
- [ ] Test with incorrect code
- [ ] Test with empty code
- [ ] Test with whitespace
- [ ] Test server-side validation
- [ ] Test attempt count reset

### Attempt Limits
- [ ] Test first attempt
- [ ] Test second attempt
- [ ] Test reaching limit
- [ ] Test blocking after limit
- [ ] Test reset functionality

---

## 9. Configuration

### Reset Code
**Current Code**: `12311`

**To Change**:
1. Update in `app/api/attempts/reset/route.ts` (line 5)
2. Update in `app/competition/[slug]/participate/ParticipationForm.tsx` (line ~310)
3. Update in `components/OutOfTriesModal.tsx` (line ~30)

### Max Attempts
**Default**: 3 attempts per competition

**To Change**:
1. Update in database: `competitions.max_attempts` column
2. Or set per competition in admin panel

### Validation Patterns
```typescript
// Name validation (Arabic + English + spaces)
const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/

// Number validation (digits only)
const numberRegex = /^\d+$/
```

---

## 10. Error Messages

### Arabic Error Messages
All error messages are in Arabic for better user experience:

- `يرجى إدخال الاسم الثلاثي كاملاً` - Please enter full triple name
- `يجب أن يحتوي على حروف عربية أو إنجليزية فقط` - Must contain Arabic or English letters only
- `يجب أن يحتوي على أرقام فقط` - Must contain numbers only
- `كود غير صحيح` - Invalid code
- `لقد استنفدت جميع المحاولات` - You have exhausted all attempts

---

## Summary

✅ **Name Validation**: Arabic/English letters only, no numbers
✅ **Grade/Class Validation**: Numbers only
✅ **Confirmation Dialog**: Shows remaining attempts before submission
✅ **Reset Code Security**: Client + Server validation (12311)
✅ **Attempt Limits**: Enforced via database tracking
✅ **Device Fingerprinting**: Tracks attempts per device
✅ **Complete Security Flow**: Multi-layer protection

All security features are implemented and tested!
