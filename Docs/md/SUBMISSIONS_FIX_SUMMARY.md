# إصلاح مشكلة عدم ظهور الإجابات في لوحة التحكم

## المشكلة
كانت إجابات الطلاب لا تظهر في قسم "إجابات الطلاب" في لوحة التحكم رغم أنها تُحفظ بنجاح في قاعدة البيانات.

## السبب الجذري
كان هناك عدم توافق بين:
1. **جدول submissions** في Supabase يستخدم `participant_name` (TEXT)
2. **استعلام Dashboard** كان يحاول الربط باستخدام `user_id` (UUID) الذي لا يوجد

## الإصلاحات المطبقة

### 1. تحديث استعلام قاعدة البيانات
**الملف:** `app/dashboard/actions/submissions.ts`

- إزالة محاولة الربط مع جدول `student_participants` عبر `user_id`
- إزالة محاولة الربط مع جدول `questions`
- الاحتفاظ فقط بالربط مع جدول `competitions`
- تحديث الفلاتر لاستخدام `participant_name` بدلاً من `user_id`
- تحديث أنواع الحالات لتطابق المخطط الجديد:
  - `pending` - قيد الانتظار
  - `under_review` - قيد المراجعة
  - `approved` - مقبولة
  - `rejected` - مرفوضة

### 2. تحديث واجهة المستخدم
**الملف:** `app/dashboard/components/sections/SubmissionsReview.tsx`

#### تحديث واجهة Submission:
```typescript
interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  first_name?: string
  father_name?: string
  family_name?: string
  grade?: string
  competition_id: string
  answers: Record<string, string> // {question_id: answer}
  proofs?: Record<string, string>
  score: number
  total_questions: number
  tickets_earned: number
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  review_notes?: string
  retry_allowed: boolean
  is_retry: boolean
  competition?: {
    id: string
    title: string
  }
}
```

#### تحديث بطاقات الإحصائيات:
- **إجمالي الإجابات** - عدد كل الإجابات
- **قيد الانتظار** - إجابات لم تتم مراجعتها
- **قيد المراجعة** - إجابات تحت المراجعة
- **مقبولة** - إجابات تم قبولها
- **مرفوضة** - إجابات تم رفضها
- **متوسط الدرجات** - النسبة المئوية للدرجات

#### تحديث الجدول:
- عرض اسم المشارك والبريد الإلكتروني والصف
- عرض الدرجة (score / total_questions) مع النسبة المئوية
- عرض عدد التذاكر المكتسبة
- عرض الحالة الحالية
- زر "عرض التفاصيل" لكل إجابة

#### تحديث نافذة المراجعة:
- عرض معلومات المشارك الكاملة
- عرض الدرجة والنسبة المئوية والتذاكر
- عرض جميع الإجابات بتنسيق JSON
- عرض الإثباتات إن وجدت
- أزرار "قبول" و "رفض" للإجابات قيد الانتظار

### 3. تحديث دوال المراجعة

#### reviewSubmission:
- تحديث الحالة (`status`) بدلاً من `final_result`
- حفظ ملاحظات المراجعة (`review_notes`)
- إزالة إعادة حساب التذاكر (التذاكر تُحسب عند الإرسال)

#### bulkReview:
- تحديث الحالة لعدة إجابات دفعة واحدة
- تسجيل العملية في سجل التدقيق

#### getSubmissionStats:
- حساب الإحصائيات بناءً على الحالة الجديدة
- حساب متوسط الدرجات

## البنية الجديدة

### تدفق البيانات:
1. **الإرسال** → API يحفظ في جدول `submissions` مع:
   - `participant_name` - اسم المشارك
   - `answers` - الإجابات بصيغة JSONB
   - `score` - الدرجة المحسوبة
   - `tickets_earned` - التذاكر المكتسبة
   - `status` - الحالة (pending)

2. **العرض** → Dashboard يقرأ من `submissions` مباشرة
   - لا حاجة للربط مع جداول أخرى
   - كل البيانات موجودة في جدول واحد

3. **المراجعة** → تحديث الحالة فقط
   - تغيير `status` إلى `approved` أو `rejected`
   - حفظ `review_notes` إن وجدت
   - تسجيل في `audit_logs`

## الملفات المعدلة
1. `app/dashboard/actions/submissions.ts` - دوال الخادم
2. `app/dashboard/components/sections/SubmissionsReview.tsx` - واجهة المستخدم
3. `components/ui/Button.tsx` - تم التحقق من الأنواع المتاحة

## الاختبار
للتحقق من أن الإصلاح يعمل:
1. افتح لوحة التحكم
2. انتقل إلى قسم "إجابات الطلاب"
3. يجب أن تظهر جميع الإجابات المحفوظة
4. يمكنك النقر على "عرض التفاصيل" لرؤية الإجابات الكاملة
5. يمكنك قبول أو رفض الإجابات

## ملاحظات
- التذاكر تُحسب تلقائياً عند الإرسال بناءً على قواعد المسابقة
- لا حاجة لإعادة حساب التذاكر عند المراجعة
- جميع البيانات محفوظة في جدول `submissions` واحد
- النظام يدعم إعادة المحاولة للإجابات المرفوضة
