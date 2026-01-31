# إصلاح أزرار التعديل والحذف للأسئلة

## المشكلة
1. زر "تعديل" في صفحة أسئلة المسابقة كان يؤدي إلى صفحة 404 أو صفحة بيضاء
2. زر "حذف" كان يستخدم نافذة التأكيد الافتراضية للمتصفح بدلاً من واجهة المستخدم المخصصة

## الحل المطبق

### 1. إنشاء صفحة تعديل ضمن سياق المسابقة
**الملف الجديد:** `app/dashboard/competitions/[id]/questions/[questionId]/page.tsx`

تم إنشاء صفحة تعديل مخصصة ضمن مسار المسابقة للحفاظ على السياق:

```
/dashboard/competitions/[id]/questions/[questionId]?mode=edit
```

**المميزات:**
- ✅ نموذج تعديل كامل مع جميع حقول السؤال
- ✅ دعم جميع أنواع الأسئلة (MCQ, True/False, Text)
- ✅ التحقق من صحة البيانات
- ✅ حالات التحميل والأخطاء
- ✅ العودة التلقائية لصفحة أسئلة المسابقة بعد الحفظ

### 2. تحديث زر التعديل
**الملف:** `app/dashboard/competitions/[id]/questions/page.tsx`

**قبل:**
```tsx
<button onClick={() => router.push(`/questions/${question.id}`)}>
  تعديل
</button>
```

**بعد:**
```tsx
<button onClick={() => handleEdit(question)}>
  تعديل
</button>

const handleEdit = (question: Question) => {
  router.push(`/dashboard/competitions/${competitionId}/questions/${question.id}?mode=edit`)
}
```

**السبب:** 
- المسار القديم `/questions/${question.id}` يعمل فقط مع الأسئلة التدريبية
- المسار الجديد يحافظ على سياق المسابقة ويعمل مع جميع الأسئلة

### 3. تحسين زر الحذف باستخدام Modal
**الملفات المعدلة:**
- `app/dashboard/components/sections/QuestionsManagement.tsx`
- `app/dashboard/competitions/[id]/questions/page.tsx`

**قبل:**
```tsx
const handleDelete = async (id: string) => {
  if (!confirm('هل تريد حذف هذا السؤال؟')) return
  await deleteQuestion(id)
}
```

**بعد:**
```tsx
// State للـ Modal
const [deleteModal, setDeleteModal] = useState<{ 
  isOpen: boolean; 
  question: Question | null 
}>({ isOpen: false, question: null })
const [deleting, setDeleting] = useState(false)

// فتح Modal
const handleDelete = (question: Question) => {
  setDeleteModal({ isOpen: true, question })
}

// تأكيد الحذف
const confirmDelete = async () => {
  if (!deleteModal.question) return
  setDeleting(true)
  try {
    await deleteQuestion(deleteModal.question.id)
    setDeleteModal({ isOpen: false, question: null })
    await loadData()
  } finally {
    setDeleting(false)
  }
}

// Modal Component
<Modal
  isOpen={deleteModal.isOpen}
  onClose={() => !deleting && setDeleteModal({ isOpen: false, question: null })}
  title="تأكيد الحذف"
  size="sm"
>
  <div className="space-y-4">
    <p>هل أنت متأكد من حذف هذا السؤال؟</p>
    {deleteModal.question && (
      <div className="bg-neutral-50 p-4 rounded-lg">
        <p className="text-sm font-medium">
          {deleteModal.question.question_text}
        </p>
      </div>
    )}
    <p className="text-sm text-red-600">
      ⚠️ هذا الإجراء لا يمكن التراجع عنه
    </p>
    <div className="flex gap-3">
      <button onClick={confirmDelete} disabled={deleting}>
        {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
      </button>
      <button onClick={() => setDeleteModal({ isOpen: false, question: null })}>
        إلغاء
      </button>
    </div>
  </div>
</Modal>
```

## هيكل المسارات الجديد

### أسئلة المسابقة:
```
/dashboard/competitions/[id]/questions          → قائمة الأسئلة
/dashboard/competitions/[id]/questions/[qId]    → تعديل سؤال محدد
```

### أسئلة التدريب:
```
/dashboard/training-questions                    → قائمة الأسئلة التدريبية
/dashboard/question-bank                         → مكتبة الأسئلة
```

## المميزات الجديدة

### 1. Modal احترافي للحذف
- ✅ واجهة مستخدم متسقة مع باقي التطبيق
- ✅ عرض نص السؤال المراد حذفه
- ✅ تحذير واضح بأن الإجراء لا يمكن التراجع عنه
- ✅ حالة تحميل أثناء الحذف
- ✅ منع الإغلاق أثناء عملية الحذف
- ✅ دعم إغلاق Modal بزر Escape

### 2. صفحة تعديل مخصصة
- ✅ نموذج تعديل كامل مع جميع الحقول
- ✅ الحفاظ على سياق المسابقة
- ✅ التحقق من صحة البيانات
- ✅ دعم جميع أنواع الأسئلة
- ✅ حالات تحميل وأخطاء واضحة
- ✅ زر إلغاء للعودة بدون حفظ

### 3. تجربة مستخدم محسنة
- ✅ لا توجد صفحات بيضاء أو أخطاء 404
- ✅ تأكيد مرئي قبل الحذف
- ✅ رسائل واضحة بالعربية
- ✅ تصميم متجاوب
- ✅ حالات تحميل واضحة
- ✅ الحفاظ على السياق أثناء التنقل

## الاختبار

### اختبار زر التعديل:
1. اذهب إلى `/dashboard/competitions/[id]/questions`
2. اضغط على زر "تعديل" لأي سؤال
3. يجب أن تفتح صفحة التعديل ضمن سياق المسابقة
4. عدّل السؤال واضغط "حفظ التعديلات"
5. يجب أن تعود لصفحة أسئلة المسابقة
6. ✅ لا توجد أخطاء 404 أو صفحات بيضاء

### اختبار زر الحذف:
1. اذهب إلى أي صفحة أسئلة
2. اضغط على زر "حذف"
3. يجب أن يظهر Modal احترافي
4. يمكنك إلغاء أو تأكيد الحذف
5. ✅ واجهة مستخدم مخصصة بدلاً من نافذة المتصفح

### اختبار زر الإلغاء:
1. افتح صفحة تعديل سؤال
2. اضغط على زر "إلغاء"
3. يجب أن تعود لصفحة أسئلة المسابقة بدون حفظ
4. ✅ لا توجد تغييرات على السؤال

## الملفات المعدلة
1. ✅ `app/dashboard/components/sections/QuestionsManagement.tsx` - Modal للحذف
2. ✅ `app/dashboard/competitions/[id]/questions/page.tsx` - تحديث زر التعديل + Modal للحذف
3. ✅ `app/dashboard/competitions/[id]/questions/[questionId]/page.tsx` - صفحة تعديل جديدة

## ملاحظات تقنية
- جميع التغييرات متوافقة مع الكود الحالي
- لا توجد breaking changes
- تم اختبار جميع الحالات
- الكود نظيف وموثق
- استخدام TypeScript للتحقق من الأنواع
- معالجة الأخطاء بشكل صحيح
- حالات التحميل واضحة للمستخدم
