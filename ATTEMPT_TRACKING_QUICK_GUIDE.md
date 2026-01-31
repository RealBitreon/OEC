# دليل سريع - نظام تتبع المحاولات

## للطلاب

### كيف يعمل النظام؟
- كل طالب لديه **2 محاولات** افتراضياً للمشاركة في المسابقة
- يتم تتبع المحاولات من خلال جهازك/متصفحك
- إذا استخدمت جهاز آخر، ستحصل على محاولات جديدة

### ماذا يحدث عند الضغط على "ابدأ الإجابة"؟
1. النظام يتحقق من عدد محاولاتك المتبقية
2. إذا كانت هذه محاولتك الثانية، ستظهر رسالة تحذير
3. إذا نفذت محاولاتك، لن تتمكن من المشاركة مرة أخرى

### نصائح مهمة
- ✅ تأكد من إجاباتك قبل الإرسال
- ✅ راجع الأدلة من الموسوعة
- ✅ لا تضيع محاولاتك بالتجربة العشوائية

## للمعلمين والمديرين

### كيفية تغيير عدد المحاولات

1. **الدخول إلى لوحة التحكم**
   ```
   /dashboard
   ```

2. **اختيار المسابقة**
   - اذهب إلى "إدارة المسابقات"
   - اختر المسابقة المطلوبة

3. **تعديل الإعدادات**
   - اضغط على "إدارة المسابقة"
   - ابحث عن حقل "عدد المحاولات المسموحة"
   - اختر رقم من 1 إلى 4
   - احفظ التغييرات

### الخيارات المتاحة
- **1 محاولة**: صارم جداً (للمسابقات النهائية)
- **2 محاولة**: افتراضي (موصى به)
- **3 محاولات**: متوسط (للتدريب)
- **4 محاولات**: مرن (للمسابقات التجريبية)

### عرض إحصائيات المحاولات
قريباً: سيتم إضافة تقرير يعرض:
- عدد المحاولات لكل طالب
- الأجهزة المستخدمة
- أوقات المحاولات

## للمطورين

### Files Modified
```
Database:
- Docs/SQL/add_attempt_tracking.sql

Utilities:
- lib/utils/device-fingerprint.ts

API Routes:
- app/api/attempts/check/route.ts
- app/api/attempts/increment/route.ts
- app/api/competitions/active/route.ts

Components:
- components/StartCompetitionButton.tsx
- app/competition/[slug]/participate/ParticipationForm.tsx
- app/dashboard/competitions/[id]/manage/ManageCompetition.tsx

Types:
- app/dashboard/core/types.ts
- lib/store/types.ts
- lib/repos/supabase/competitions.ts

Pages Updated:
- app/wheel/page.tsx
- app/rules/page.tsx
- app/guide/page.tsx
```

### API Usage

#### Check Attempts
```typescript
const response = await fetch('/api/attempts/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitionId: 'uuid',
    deviceFingerprint: 'fingerprint-hash',
  }),
})

const { canAttempt, remainingAttempts, maxAttempts } = await response.json()
```

#### Increment Attempt
```typescript
const response = await fetch('/api/attempts/increment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitionId: 'uuid',
    deviceFingerprint: 'fingerprint-hash',
    userId: 'optional-user-id',
  }),
})

const { attemptCount, remainingAttempts } = await response.json()
```

### Device Fingerprint
```typescript
import { getOrCreateFingerprint, clearFingerprint } from '@/lib/utils/device-fingerprint'

// Get or create fingerprint
const fp = getOrCreateFingerprint()

// Clear for testing
clearFingerprint()
```

## Troubleshooting

### الطالب لا يستطيع المشاركة
1. تحقق من عدد المحاولات في إعدادات المسابقة
2. تحقق من جدول `attempt_tracking` في قاعدة البيانات
3. يمكن للمدير حذف السجل لإعادة تعيين المحاولات

### الأزرار لا تعمل
1. تحقق من وجود مسابقة نشطة
2. افتح Console وتحقق من الأخطاء
3. تحقق من اتصال قاعدة البيانات

### تغيير عدد المحاولات لا يعمل
1. تحقق من تطبيق SQL migration
2. تحقق من صلاحيات المستخدم (CEO/LRC_TEACHER)
3. راجع console للأخطاء

## SQL Queries للصيانة

### عرض جميع المحاولات
```sql
SELECT 
  at.*,
  c.title as competition_title,
  p.username
FROM attempt_tracking at
JOIN competitions c ON c.id = at.competition_id
LEFT JOIN profiles p ON p.id = at.user_id
ORDER BY at.last_attempt_at DESC;
```

### إعادة تعيين محاولات طالب معين
```sql
DELETE FROM attempt_tracking
WHERE device_fingerprint = 'fingerprint-hash'
AND competition_id = 'competition-uuid';
```

### عرض إحصائيات المحاولات
```sql
SELECT 
  c.title,
  c.max_attempts,
  COUNT(DISTINCT at.device_fingerprint) as unique_devices,
  SUM(at.attempt_count) as total_attempts,
  AVG(at.attempt_count) as avg_attempts_per_device
FROM competitions c
LEFT JOIN attempt_tracking at ON at.competition_id = c.id
GROUP BY c.id, c.title, c.max_attempts;
```

## Security Notes

⚠️ **Important:**
- Device fingerprinting ليس 100% آمن
- يمكن للطالب استخدام أجهزة مختلفة
- يمكن للطالب مسح cookies/localStorage
- هذا النظام للحد من المحاولات، ليس لمنعها تماماً

✅ **Best Practices:**
- استخدم 2 محاولات كحد افتراضي
- راقب المحاولات المشبوهة
- اشرح للطلاب أهمية الأمانة الأكاديمية
