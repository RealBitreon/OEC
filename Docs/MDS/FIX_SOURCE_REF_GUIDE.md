# 🔧 حل مشكلة source_ref في جدول questions

## 🐛 المشكلة
```
Could not find the 'source_ref' column of 'questions' in the schema cache
```

## 🔍 السبب
العمود `source_ref` موجود في ملف SQL الأساسي (`supabase_complete_setup.sql`) لكن:
1. قد لا يكون تم تشغيل الـ migration
2. أو Supabase schema cache لم يتم تحديثه

## ✅ الحل

### الخطوة 1: تشغيل SQL Migration
```bash
psql -h your-host -U your-user -d your-db -f fix_questions_source_ref.sql
```

أو من Supabase Dashboard:
1. اذهب إلى SQL Editor
2. الصق محتوى `fix_questions_source_ref.sql`
3. اضغط Run

### الخطوة 2: تحديث Schema Cache
في Supabase Dashboard:
1. اذهب إلى Settings → Database
2. اضغط "Reload schema cache"

أو من CLI:
```bash
supabase db reset
```

### الخطوة 3: التحقق
```sql
-- تحقق من وجود العمود
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'questions' AND column_name = 'source_ref';
```

يجب أن يظهر:
```
column_name | data_type | column_default
source_ref  | jsonb     | '{"volume": "", "page": "", ...}'
```

## 📋 بنية source_ref

العمود `source_ref` هو JSONB يحتوي على:
```json
{
  "volume": "1",      // رقم المجلد
  "page": "42",       // رقم الصفحة
  "lineFrom": "5",    // من السطر
  "lineTo": "8"       // إلى السطر
}
```

## 🔄 إذا استمرت المشكلة

### الحل 1: إعادة إنشاء الجدول
```sql
-- احذف الجدول (احذر: سيحذف البيانات!)
DROP TABLE IF EXISTS questions CASCADE;

-- أعد تشغيل
\i supabase_complete_setup.sql
```

### الحل 2: التحقق من الاتصال
```typescript
// في الكود
const { data, error } = await supabase
  .from('questions')
  .select('source_ref')
  .limit(1)

console.log('source_ref test:', data, error)
```

### الحل 3: إعادة تشغيل Supabase
```bash
supabase stop
supabase start
```

## ✅ التحقق من الحل

بعد تطبيق الحل، جرب:

```typescript
// في Dashboard
const result = await createQuestion({
  competition_id: 'xxx',
  is_training: false,
  type: 'mcq',
  question_text: 'سؤال تجريبي',
  options: ['أ', 'ب'],
  correct_answer: 'أ',
  source_ref: {
    volume: '1',
    page: '10',
    lineFrom: '5',
    lineTo: '7'
  }
})
```

يجب أن يعمل بدون أخطاء!

## 📝 ملاحظات

1. العمود `source_ref` **مطلوب** (NOT NULL)
2. له قيمة افتراضية (DEFAULT)
3. يجب أن يحتوي على جميع الحقول الأربعة
4. يتم التحقق من صحة البيانات في الكود

## 🆘 الدعم

إذا استمرت المشكلة:
1. تحقق من logs في Supabase Dashboard
2. راجع الاتصال بقاعدة البيانات
3. تأكد من تشغيل جميع migrations
4. أعد تشغيل التطبيق

---

**تم الحل!** ✅
