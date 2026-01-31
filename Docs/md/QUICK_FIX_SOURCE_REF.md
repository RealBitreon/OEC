# ⚡ حل سريع لمشكلة source_ref

## المشكلة
```
Could not find the 'source_ref' column of 'questions' in the schema cache
```

## الحل السريع (3 خطوات)

### 1️⃣ شغّل SQL
```bash
psql -f fix_questions_source_ref.sql
```

أو من Supabase Dashboard → SQL Editor:
```sql
ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_ref JSONB NOT NULL DEFAULT '{
  "volume": "",
  "page": "",
  "lineFrom": "",
  "lineTo": ""
}'::jsonb;
```

### 2️⃣ حدّث Schema Cache
في Supabase Dashboard:
- Settings → Database → "Reload schema cache"

### 3️⃣ أعد تشغيل التطبيق
```bash
npm run dev
```

## ✅ تم الحل!

الآن يمكنك استخدام النظام بدون مشاكل.

---

**للتفاصيل الكاملة:** راجع [FIX_SOURCE_REF_GUIDE.md](./FIX_SOURCE_REF_GUIDE.md)
