# إصلاح مشكلة حفظ المسابقة

## المشكلة
كانت هناك مشكلة في حفظ المسابقات بسبب عدم تطابق أنواع الأدوار (User Roles) في النظام.

## الأسباب الرئيسية

### 1. عدم تطابق الأنواع (Type Mismatch)
- في `core/types.ts` كانت الأدوار معرفة كـ: `'ceo' | 'manager' | 'student' | 'teacher'` (أحرف صغيرة)
- في `lib/auth.ts` كانت تستخدم: `'CEO' | 'LRC_MANAGER' | 'STUDENT'` (أحرف كبيرة)
- هذا التناقض كان يسبب فشل في التحقق من الصلاحيات

### 2. مشكلة في تحميل بيانات المسابقة عند التعديل
- في `CompetitionsManagement.tsx` كان هناك TODO لتحميل بيانات المسابقة عند التعديل
- لم يكن يتم تحميل البيانات الحالية للمسابقة عند محاولة تعديلها

### 3. عدم وجود التحقق من صحة التواريخ
- لم يكن هناك تحقق من صحة التواريخ قبل الحفظ في واجهة المستخدم

## الإصلاحات المطبقة

### 1. توحيد أنواع الأدوار
تم تحديث جميع الملفات لاستخدام الأنواع الموحدة:
- `CEO` - المدير التنفيذي
- `LRC_MANAGER` - مدير المسابقة
- `STUDENT` - طالب

#### الملفات المحدثة:
- ✅ `app/dashboard/core/types.ts` - تحديث تعريف UserRole
- ✅ `lib/auth/json-auth.ts` - تحديث واجهة User والمقارنات
- ✅ `app/dashboard/lib/auth.ts` - إضافة type casting صحيح
- ✅ `app/dashboard/core/permissions.ts` - تحديث جميع المقارنات
- ✅ `app/dashboard/components/Header.tsx` - تحديث getRoleLabel والمقارنات
- ✅ `app/dashboard/actions/competitions.ts` - تحديث فحوصات الصلاحيات
- ✅ `app/dashboard/actions/questions.ts` - تحديث فحوصات الصلاحيات
- ✅ `app/dashboard/actions/submissions.ts` - تحديث فحوصات الصلاحيات
- ✅ `app/dashboard/actions/tickets.ts` - تحديث فحوصات الصلاحيات
- ✅ `data/users.json` - تحديث أدوار المستخدمين الموجودين

### 2. إضافة وظيفة تحميل بيانات المسابقة
في `CompetitionsManagement.tsx`:
```typescript
const loadCompetition = async () => {
  try {
    const competitions = await getCompetitions()
    const competition = competitions.find(c => c.id === competitionId)
    
    if (competition) {
      setFormData({
        title: competition.title,
        description: competition.description,
        start_at: competition.start_at.split('T')[0],
        end_at: competition.end_at.split('T')[0],
        wheel_at: competition.wheel_at.split('T')[0],
      })
    }
  } catch (error) {
    console.error('Failed to load competition:', error)
    alert('فشل تحميل بيانات المسابقة')
  } finally {
    setLoading(false)
  }
}
```

### 3. إضافة التحقق من صحة التواريخ
في `CompetitionsManagement.tsx`:
```typescript
// Validate dates
const startDate = new Date(formData.start_at)
const endDate = new Date(formData.end_at)
const wheelDate = new Date(formData.wheel_at)

if (startDate >= endDate) {
  alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية')
  setSaving(false)
  return
}

if (endDate >= wheelDate) {
  alert('تاريخ النهاية يجب أن يكون قبل موعد السحب')
  setSaving(false)
  return
}
```

### 4. تحسين معالجة الأخطاء
```typescript
try {
  if (competitionId) {
    await updateCompetition(competitionId, formData)
  } else {
    await createCompetition(formData)
  }
  onClose()
} catch (error: any) {
  console.error('Save error:', error)
  alert(error?.message || 'فشل حفظ المسابقة')
} finally {
  setSaving(false)
}
```

## النتيجة
✅ تم إصلاح جميع مشاكل عدم تطابق الأنواع
✅ يمكن الآن إنشاء مسابقات جديدة بنجاح
✅ يمكن تعديل المسابقات الموجودة بنجاح
✅ يتم التحقق من صحة التواريخ قبل الحفظ
✅ رسائل خطأ واضحة للمستخدم

## الاختبار
للتأكد من أن كل شيء يعمل:
1. قم بتسجيل الدخول كمدير (CEO أو LRC_MANAGER)
2. انتقل إلى "إدارة المسابقات"
3. جرب إنشاء مسابقة جديدة
4. جرب تعديل مسابقة موجودة
5. تأكد من أن التواريخ يتم التحقق منها بشكل صحيح
