# Quick Reset Reference - مرجع سريع لإعادة التعيين

## For Teachers / للمعلمين

### Reset Code / كود إعادة التعيين
```
12311
```

**Important:** Give this code ONLY to students in the LRC (Learning Resource Center).

**مهم:** أعط هذا الكود فقط للطلاب في مركز مصادر التعلم.

---

## For Students / للطلاب

### When you see "Out of Tries" / عندما ترى "انتهت المحاولات"

1. **Go to your teacher** in the LRC
   اذهب إلى معلمك في مركز مصادر التعلم

2. **Ask for the reset code**
   اطلب كود إعادة التعيين

3. **Enter the code** in the input field on the participation page
   أدخل الكود في حقل الإدخال في صفحة المشاركة

4. **Click "Apply"** / اضغط "تطبيق"

5. **Try again!** / حاول مرة أخرى!

---

## Technical Details / التفاصيل التقنية

### API Endpoint
```
POST /api/attempts/reset
```

### Request Body
```json
{
  "competitionId": "uuid",
  "deviceFingerprint": "string",
  "resetCode": "12311"
}
```

### Success Response
```json
{
  "canAttempt": true,
  "remainingAttempts": 2,
  "maxAttempts": 2,
  "message": "Attempts reset successfully"
}
```

### Error Response
```json
{
  "error": "Invalid reset code"
}
```

---

## UI Components / مكونات الواجهة

### 1. OutOfTriesModal
**File:** `components/OutOfTriesModal.tsx`

Shows when user is out of attempts.

**Props:**
```typescript
interface OutOfTriesModalProps {
  maxAttempts: number
  onClose?: () => void
}
```

### 2. Reset Code Input
**Location:** In `ParticipationForm.tsx`

Appears at the bottom of the participant info form when `attemptInfo.canAttempt === false`.

---

## Color Scheme / نظام الألوان

```css
/* Modal Header */
bg-gradient-to-br from-amber-500 via-orange-500 to-red-500

/* Info Box */
bg-blue-50 border-blue-200

/* Reset Input Container */
bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300

/* Apply Button */
bg-gradient-to-r from-green-500 to-green-600
```

---

## Testing Checklist / قائمة الاختبار

- [ ] Participate in competition twice
- [ ] Try to participate a third time
- [ ] Verify modal appears
- [ ] Enter wrong code → See error
- [ ] Enter correct code → See success
- [ ] Verify attempts are reset
- [ ] Participate again successfully

---

## Files Modified / الملفات المعدلة

### Created:
- ✅ `components/OutOfTriesModal.tsx`
- ✅ `LRC_TEACHER_GUIDE.md`
- ✅ `RESET_TRIES_IMPLEMENTATION.md`
- ✅ `RESET_TRIES_UI_GUIDE.md`
- ✅ `QUICK_RESET_REFERENCE.md`

### Modified:
- ✅ `app/competition/[slug]/participate/ParticipationForm.tsx`

### Existing (No changes needed):
- ✅ `app/api/attempts/reset/route.ts`
- ✅ `app/api/attempts/check/route.ts`
- ✅ `components/icons/index.tsx`

---

## Support / الدعم

For issues or questions, contact the system administrator.

للمشاكل أو الأسئلة، تواصل مع مسؤول النظام.

---

**Project:** Omani Encyclopedia Competition
**Developer:** Youssef Mohamed Sobh
**Year:** 2026
**Purpose:** School Project
