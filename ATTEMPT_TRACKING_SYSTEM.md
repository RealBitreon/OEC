# نظام تتبع المحاولات - Attempt Tracking System

## Overview
تم تطبيق نظام شامل لتتبع محاولات المشاركة في المسابقات باستخدام بصمة الجهاز (Device Fingerprinting) والكوكيز.

## Features Implemented

### 1. Database Schema
**File:** `Docs/SQL/add_attempt_tracking.sql`

- إضافة عمود `max_attempts` لجدول `competitions` (القيمة الافتراضية: 2، الحد الأقصى: 4)
- إنشاء جدول `attempt_tracking` لتتبع المحاولات لكل جهاز
- دوال SQL:
  - `can_attempt_competition()` - للتحقق من إمكانية المحاولة
  - `increment_attempt()` - لزيادة عدد المحاولات

### 2. Device Fingerprinting
**File:** `lib/utils/device-fingerprint.ts`

يستخدم عدة خصائص للمتصفح/الجهاز لإنشاء بصمة فريدة:
- دقة الشاشة وعمق الألوان
- المنطقة الزمنية واللغة
- نظام التشغيل
- User Agent
- عدد أنوية المعالج
- ذاكرة الجهاز
- Canvas fingerprint

التخزين:
- localStorage
- Cookies (صلاحية سنة واحدة)

### 3. API Routes

#### Check Attempts
**File:** `app/api/attempts/check/route.ts`
```
POST /api/attempts/check
Body: { competitionId, deviceFingerprint }
Response: { canAttempt, currentAttempts, maxAttempts, remainingAttempts }
```

#### Increment Attempts
**File:** `app/api/attempts/increment/route.ts`
```
POST /api/attempts/increment
Body: { competitionId, deviceFingerprint, userId? }
Response: { success, attemptCount, remainingAttempts }
```

#### Get Active Competition
**File:** `app/api/competitions/active/route.ts`
```
GET /api/competitions/active
Response: { competition }
```

### 4. UI Components

#### StartCompetitionButton
**File:** `components/StartCompetitionButton.tsx`

زر ذكي يقوم بـ:
- جلب المسابقة النشطة تلقائياً
- التحقق من المحاولات المتبقية
- عرض تحذير إذا كانت المحاولات محدودة
- منع المشاركة إذا نفذت المحاولات
- إعادة التوجيه إلى صفحة المشاركة

تم استبدال الأزرار في:
- `app/wheel/page.tsx`
- `app/rules/page.tsx`
- `app/guide/page.tsx`

#### ParticipationForm Updates
**File:** `app/competition/[slug]/participate/ParticipationForm.tsx`

- التحقق من المحاولات عند تحميل الصفحة
- عرض تحذير بعدد المحاولات المتبقية
- تسجيل المحاولة عند الإرسال
- منع الوصول إذا نفذت المحاولات

### 5. Dashboard Management

#### Competition Settings
**File:** `app/dashboard/competitions/[id]/manage/ManageCompetition.tsx`

إضافة حقل "عدد المحاولات المسموحة":
- نطاق: 1-4 محاولات
- القيمة الافتراضية: 2
- يمكن للمعلم/المدير تعديلها

### 6. Type Updates

تم تحديث الأنواع في:
- `app/dashboard/core/types.ts`
- `lib/store/types.ts`
- `lib/repos/supabase/competitions.ts`

إضافة `maxAttempts?: number` لواجهة Competition

## How It Works

### Student Flow:
1. الطالب يضغط على "ابدأ الإجابة على الأسئلة"
2. النظام يولد بصمة فريدة للجهاز
3. يتحقق من عدد المحاولات المتبقية
4. إذا كانت هناك محاولات متبقية:
   - يعرض تحذير بعدد المحاولات
   - يسمح بالمتابعة
5. عند إرسال الإجابات:
   - يسجل المحاولة في قاعدة البيانات
   - يقلل عدد المحاولات المتبقية
6. إذا نفذت المحاولات:
   - يمنع الوصول
   - يعرض رسالة خطأ

### Teacher/CEO Flow:
1. الدخول إلى لوحة التحكم
2. اختيار المسابقة
3. الضغط على "إدارة المسابقة"
4. تعديل "عدد المحاولات المسموحة" (1-4)
5. حفظ التغييرات

## Security Features

1. **Device Fingerprinting**: يصعب التلاعب به
2. **Cookie + localStorage**: تخزين مزدوج
3. **Server-side Validation**: التحقق من الخادم
4. **Database Constraints**: قيود على مستوى قاعدة البيانات
5. **RLS Policies**: سياسات أمان على مستوى الصفوف

## Database Migration

لتطبيق التغييرات على قاعدة البيانات:

```sql
-- Run this SQL in Supabase SQL Editor
-- File: Docs/SQL/add_attempt_tracking.sql
```

## Testing

### Test Scenarios:
1. ✅ محاولة أولى - يجب أن تنجح
2. ✅ محاولة ثانية - يجب أن تنجح مع تحذير
3. ✅ محاولة ثالثة - يجب أن تُرفض (إذا كان الحد 2)
4. ✅ تغيير الحد الأقصى من لوحة التحكم
5. ✅ محاولة من جهاز آخر - يجب أن تنجح

### Console Commands:
```javascript
// Clear fingerprint for testing
localStorage.removeItem('device_fp')
document.cookie = 'device_fp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
```

## Notes

- النظام يعمل على مستوى الجهاز/المتصفح، ليس المستخدم
- يمكن للطالب المشاركة من أجهزة مختلفة
- المعلم/المدير يمكنه تعديل الحد الأقصى للمحاولات
- الحد الأقصى المسموح: 4 محاولات
- القيمة الافتراضية: 2 محاولات

## Future Enhancements

- [ ] إضافة تقرير بالمحاولات في لوحة التحكم
- [ ] إمكانية إعادة تعيين المحاولات لطالب معين
- [ ] تتبع IP Address كطبقة أمان إضافية
- [ ] إشعارات للمعلم عند محاولات مشبوهة
