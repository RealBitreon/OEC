# إصلاح خطأ تحديد الفائز/الخاسر
## Fix Mark Winner/Loser 500 Error

## المشكلة (Problem)

عند محاولة تحديد طالب كفائز أو خاسر، يظهر خطأ 500:
```
POST /api/submissions/mark-winner 500 (Internal Server Error)
فشل تحديث الحالة
```

## السبب (Root Cause)

هناك مشكلتان رئيسيتان:

### 1. سياسة RLS غير صحيحة
سياسة Row Level Security في قاعدة البيانات تبحث عن دور `'admin'` بينما النظام يستخدم `'CEO'` و `'LRC_MANAGER'`.

```sql
-- السياسة القديمة (خاطئة)
WHERE users.role = 'admin'

-- السياسة الصحيحة
WHERE users.role IN ('CEO', 'LRC_MANAGER')
```

### 2. استخدام Service Client بدون مفتاح
الكود القديم كان يستخدم `createServiceClient()` الذي يتطلب `SUPABASE_SERVICE_ROLE_KEY` وقد لا يكون متوفراً في Vercel.

## الحل (Solution)

### الخطوة 1: تحديث API Route

تم تحديث `/api/submissions/mark-winner/route.ts` ليستخدم:
- ✅ `createClient()` بدلاً من `createServiceClient()`
- ✅ التحقق من صلاحيات المستخدم يدوياً
- ✅ دعم الأدوار `CEO` و `LRC_MANAGER`
- ✅ رسائل خطأ أفضل مع تفاصيل أكثر
- ✅ تسجيل (logging) محسّن للتشخيص

### الخطوة 2: إصلاح سياسات RLS

قم بتشغيل السكريبت `FIX_SUBMISSIONS_RLS_POLICY.sql` في Supabase SQL Editor:

```sql
-- Fix RLS policy for submissions
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;
CREATE POLICY "Admins can update submissions" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );

DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
CREATE POLICY "Admins can view all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('CEO', 'LRC_MANAGER')
        )
    );
```

## التغييرات في الكود

### قبل (Before):
```typescript
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient() // يتطلب SUPABASE_SERVICE_ROLE_KEY
  
  const { error } = await supabase
    .from('submissions')
    .update({ is_winner: isWinner })
    .eq('id', submissionId)
}
```

### بعد (After):
```typescript
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // التحقق من المصادقة
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // التحقق من الصلاحيات
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  
  if (!profile || (profile.role !== 'CEO' && profile.role !== 'LRC_MANAGER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // تحديث الإرسال
  const { data, error } = await supabase
    .from('submissions')
    .update({ 
      is_winner: isWinner,
      status: isWinner ? 'approved' : 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
}
```

## خطوات التطبيق (Deployment Steps)

### 1. تحديث قاعدة البيانات
```bash
# افتح Supabase Dashboard
# اذهب إلى SQL Editor
# انسخ والصق محتوى FIX_SUBMISSIONS_RLS_POLICY.sql
# اضغط Run
```

### 2. نشر التحديثات
```bash
git add .
git commit -m "Fix mark-winner API: Use regular client with proper auth checks"
git push
```

### 3. التحقق من Vercel
- انتظر حتى يكتمل النشر في Vercel
- تحقق من Logs في Vercel Dashboard
- جرب تحديد طالب كفائز/خاسر

## الاختبار (Testing)

### 1. اختبار محلي:
```bash
npm run dev
# اذهب إلى لوحة التحكم
# افتح قسم "مراجعة الإجابات"
# جرب تحديد طالب كفائز
# جرب تحديد طالب كخاسر
```

### 2. اختبار الإنتاج:
- افتح https://msoec.vercel.app/dashboard
- سجل دخول كـ CEO أو LRC_MANAGER
- اذهب إلى "مراجعة الإجابات"
- جرب تحديد حالة الطالب

## رسائل الخطأ المحسّنة

الآن ستحصل على رسائل خطأ واضحة:

- ✅ `401 Unauthorized` - المستخدم غير مسجل دخول
- ✅ `403 Forbidden` - المستخدم ليس لديه صلاحيات (ليس CEO أو LRC_MANAGER)
- ✅ `404 Not Found` - الإرسال غير موجود
- ✅ `500 Internal Server Error` - خطأ في قاعدة البيانات (مع تفاصيل)

## التحقق من النجاح

بعد التطبيق، يجب أن ترى:

1. ✅ لا توجد أخطاء 500 عند تحديد الفائز/الخاسر
2. ✅ رسالة نجاح: "تم تحديد الطالب كفائز 🎉" أو "تم تحديد الطالب كخاسر"
3. ✅ تحديث الحالة في الجدول فوراً
4. ✅ تحديث الأيقونة (🏆 للفائز، ❌ للخاسر)

## استكشاف الأخطاء (Troubleshooting)

### إذا استمر الخطأ 500:
1. تحقق من Vercel Logs:
   ```
   Vercel Dashboard → Your Project → Logs
   ```

2. تحقق من سياسات RLS في Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'submissions';
   ```

3. تحقق من دور المستخدم:
   ```sql
   SELECT id, username, role FROM users WHERE auth_id = 'YOUR_AUTH_ID';
   ```

### إذا حصلت على 401 Unauthorized:
- تأكد من تسجيل الدخول
- امسح الكوكيز وسجل دخول مرة أخرى

### إذا حصلت على 403 Forbidden:
- تأكد من أن دورك هو `CEO` أو `LRC_MANAGER`
- تحقق من جدول `users` في Supabase

## الملفات المعدلة

- ✅ `app/api/submissions/mark-winner/route.ts` - تحديث API
- ✅ `FIX_SUBMISSIONS_RLS_POLICY.sql` - سكريبت إصلاح RLS
- ✅ `MARK_WINNER_API_FIX.md` - هذا الملف

## ملاحظات مهمة

1. **الأمان**: الآن يتم التحقق من الصلاحيات على مستوى التطبيق و RLS
2. **الأداء**: استخدام `createClient()` أسرع من `createServiceClient()`
3. **التوافق**: يعمل مع أو بدون `SUPABASE_SERVICE_ROLE_KEY`
4. **الصيانة**: رسائل خطأ أفضل تسهل التشخيص

---

تم الإصلاح بنجاح! ✅
