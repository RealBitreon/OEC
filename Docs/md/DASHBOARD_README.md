# لوحة التحكم - نظام إدارة المسابقات

## 🎯 نظرة عامة

لوحة تحكم احترافية مبنية من الصفر لإدارة مسابقات القرآن الكريم. تم تصميمها لتكون:
- **مستقرة**: لا توجد حلقات إعادة توجيه، معالجة أخطاء شاملة
- **آمنة**: التحقق من الصلاحيات من قاعدة البيانات فقط
- **واضحة**: واجهة عربية RTL احترافية
- **قابلة للتوسع**: بنية معمارية نظيفة وقابلة للصيانة

## 🏗️ البنية المعمارية

### المجلدات الرئيسية

```
app/dashboard/
├── page.tsx                    # نقطة الدخول الرئيسية (Server Component)
├── components/
│   ├── DashboardShell.tsx     # الهيكل الرئيسي
│   ├── Sidebar.tsx            # القائمة الجانبية
│   ├── Header.tsx             # الشريط العلوي
│   └── sections/              # أقسام لوحة التحكم
│       ├── Overview.tsx
│       ├── CurrentCompetition.tsx
│       ├── CompetitionsManagement.tsx
│       ├── QuestionsManagement.tsx
│       ├── SubmissionsReview.tsx
│       ├── TicketsManagement.tsx
│       ├── WheelManagement.tsx
│       ├── Archives.tsx
│       ├── UsersManagement.tsx
│       ├── AuditLog.tsx
│       └── Settings.tsx
├── actions/                   # Server Actions
│   ├── competitions.ts
│   └── overview.ts
├── lib/
│   └── auth.ts               # مكتبة المصادقة
└── core/
    ├── types.ts              # أنواع TypeScript
    └── permissions.ts        # نظام الصلاحيات
```

## 🔐 نظام المصادقة والصلاحيات

### الأدوار (Roles)

1. **STUDENT** (طالب)
   - عرض المسابقة الحالية
   - المشاركة في المسابقة
   - عرض الأسئلة التدريبية
   - عرض نتائج عجلة الحظ
   - عرض الإصدارات السابقة

2. **LRC_MANAGER** (مدير المسابقة)
   - كل صلاحيات الطالب +
   - إنشاء وتعديل المسابقات
   - إضافة وتعديل الأسئلة
   - مراجعة وتصحيح الإجابات
   - إدارة التذاكر
   - تشغيل عجلة الحظ
   - إدارة الإعدادات

3. **CEO** (المدير التنفيذي)
   - كل صلاحيات مدير المسابقة +
   - حذف المسابقات
   - إدارة المستخدمين
   - تغيير الأدوار
   - عرض سجل التدقيق
   - إعدادات النظام الشاملة

### تدفق المصادقة

```typescript
// في app/dashboard/page.tsx
1. استدعاء getUserProfile() من Supabase Auth
2. إذا لم يكن هناك جلسة → redirect('/login')
3. جلب البيانات من جدول profiles
4. التحقق من صحة الدور
5. إذا كان الدور غير صحيح → عرض واجهة خطأ (بدون redirect loop)
6. تمرير البيانات إلى DashboardShell
```

### قواعد الأمان

✅ **افعل:**
- اقرأ الدور من قاعدة البيانات دائماً
- استخدم `revalidateRole()` للعمليات الحساسة
- تحقق من الصلاحيات في Server Actions
- استخدم RLS في Supabase

❌ **لا تفعل:**
- لا تثق في cookies للأدوار
- لا تثق في البيانات من العميل
- لا تستخدم query parameters للصلاحيات
- لا تنشئ redirect loops

## 📊 قاعدة البيانات

### الجداول الرئيسية

1. **profiles** - ملفات المستخدمين
   ```sql
   id UUID (FK to auth.users)
   username TEXT
   role TEXT (CEO, LRC_MANAGER, STUDENT)
   created_at TIMESTAMPTZ
   ```

2. **competitions** - المسابقات
   ```sql
   id UUID
   title TEXT
   description TEXT
   status TEXT (draft, active, archived)
   start_at TIMESTAMPTZ
   end_at TIMESTAMPTZ
   wheel_spin_at TIMESTAMPTZ
   rules JSONB
   created_by UUID
   ```

3. **questions** - الأسئلة
   ```sql
   id UUID
   competition_id UUID (nullable)
   type TEXT (mcq, true_false, text)
   question_text TEXT
   options JSONB
   correct_answer TEXT
   volume, page, line_from, line_to TEXT
   is_active BOOLEAN
   ```

4. **submissions** - الإجابات
   ```sql
   id UUID
   competition_id UUID
   question_id UUID
   student_id UUID
   answer TEXT
   auto_result TEXT (correct, incorrect)
   final_result TEXT (correct, incorrect)
   corrected_by UUID
   ```

5. **tickets** - التذاكر
   ```sql
   id UUID
   competition_id UUID
   student_id UUID
   count INTEGER
   reason TEXT
   ```

6. **wheel_runs** - سحوبات الجوائز
   ```sql
   id UUID
   competition_id UUID
   locked_snapshot JSONB
   winner_id UUID
   run_at TIMESTAMPTZ
   ```

7. **audit_log** - سجل التدقيق
   ```sql
   id UUID
   actor_id UUID
   action TEXT
   meta JSONB
   created_at TIMESTAMPTZ
   ```

## 🚀 التثبيت والإعداد

### 1. تشغيل Migration

```bash
# في Supabase SQL Editor
# قم بتشغيل الملف: supabase_dashboard_migration.sql
```

### 2. إنشاء مستخدم CEO

```sql
-- في Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), NOW());

-- احصل على user_id من النتيجة، ثم:
INSERT INTO profiles (id, username, role)
VALUES ('user-id-here', 'admin', 'CEO');
```

### 3. تشغيل التطبيق

```bash
npm run dev
```

### 4. تسجيل الدخول

- اذهب إلى `/login`
- استخدم البريد الإلكتروني وكلمة المرور
- سيتم توجيهك إلى `/dashboard`

## 🎨 التصميم والواجهة

### المبادئ

1. **RTL أولاً**: كل شيء بالعربية من اليمين لليسار
2. **وضوح**: لا توجد أزرار ميتة، كل شيء يعمل أو يظهر "قريباً"
3. **استجابة**: يعمل على الهاتف والحاسوب
4. **سرعة**: Skeleton loaders، تحميل تدريجي
5. **احترافية**: ألوان متسقة، مسافات منتظمة

### الألوان

```css
/* الأدوار */
CEO: purple-100/purple-700
LRC_MANAGER: blue-100/blue-700
STUDENT: green-100/green-700

/* الحالات */
active: green-100/green-700
draft: yellow-100/yellow-700
archived: neutral-100/neutral-700

/* الأزرار */
primary: blue-600 hover:blue-700
secondary: neutral-700 hover:neutral-900
danger: red-600 hover:red-700
```

## 📝 إضافة قسم جديد

### 1. إنشاء المكون

```typescript
// app/dashboard/components/sections/NewSection.tsx
'use client'

import { User } from '../../core/types'

export default function NewSection({ profile }: { profile: User }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">
        عنوان القسم
      </h1>
      {/* المحتوى */}
    </div>
  )
}
```

### 2. إضافة النوع

```typescript
// app/dashboard/core/types.ts
export type DashboardSection = 
  | 'overview'
  | 'new-section' // أضف هنا
  | ...
```

### 3. إضافة الصلاحيات

```typescript
// app/dashboard/core/permissions.ts
const sectionPermissions: Record<DashboardSection, UserRole> = {
  'new-section': 'LRC_MANAGER', // الحد الأدنى للدور
  ...
}
```

### 4. إضافة للقائمة

```typescript
// app/dashboard/components/Sidebar.tsx
const NAV_ITEMS: NavItem[] = [
  { id: 'new-section', label: 'القسم الجديد', icon: '🆕', minRole: 'LRC_MANAGER' },
  ...
]
```

### 5. إضافة للـ Shell

```typescript
// app/dashboard/components/DashboardShell.tsx
import NewSection from './sections/NewSection'

const renderSection = () => {
  switch (activeSection) {
    case 'new-section':
      return <NewSection profile={profile} />
    ...
  }
}
```

## 🔧 Server Actions

### إنشاء Action جديد

```typescript
// app/dashboard/actions/myaction.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateRole } from '../lib/auth'

export async function myAction(data: any) {
  const supabase = await createClient()
  
  // 1. التحقق من المصادقة
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. التحقق من الصلاحيات
  const profile = await revalidateRole(user.id)
  if (!profile || profile.role === 'STUDENT') {
    throw new Error('Forbidden')
  }

  // 3. تنفيذ العملية
  const { data: result, error } = await supabase
    .from('table')
    .insert(data)

  if (error) throw error

  // 4. تسجيل في Audit Log
  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'وصف العملية',
    meta: { ...data },
  })

  return result
}
```

## 🐛 استكشاف الأخطاء

### مشكلة: Redirect Loop

**السبب**: إعادة توجيه المستخدمين المصادق عليهم إلى `/login`

**الحل**: 
```typescript
// في page.tsx
if (!profile) {
  redirect('/login') // فقط إذا لم يكن هناك جلسة
}

// إذا كان هناك مشكلة في البيانات، اعرض UI
if (!profile.role) {
  return <ErrorUI /> // لا redirect
}
```

### مشكلة: Unauthorized

**السبب**: RLS policies أو صلاحيات خاطئة

**الحل**:
1. تحقق من أن المستخدم في جدول `profiles`
2. تحقق من أن الدور صحيح
3. تحقق من RLS policies في Supabase

### مشكلة: لا تظهر البيانات

**السبب**: RLS policies تمنع القراءة

**الحل**:
```sql
-- في Supabase SQL Editor
-- تحقق من policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- اختبر الاستعلام مباشرة
SELECT * FROM your_table;
```

## 📋 قائمة التحقق قبل الإنتاج

- [ ] تم تشغيل migration بنجاح
- [ ] تم إنشاء مستخدم CEO
- [ ] تم اختبار تسجيل الدخول
- [ ] لا توجد redirect loops
- [ ] كل الأقسام تعرض محتوى (حتى لو "قريباً")
- [ ] الصلاحيات تعمل بشكل صحيح
- [ ] RLS policies مفعلة
- [ ] Audit log يسجل العمليات
- [ ] الواجهة RTL بالكامل
- [ ] تعمل على الهاتف والحاسوب

## 🎯 الخطوات التالية

### المرحلة 1: الأساسيات (تم ✅)
- [x] بنية Dashboard
- [x] نظام المصادقة
- [x] نظام الصلاحيات
- [x] إدارة المسابقات (أساسي)
- [x] نظرة عامة

### المرحلة 2: الوظائف الأساسية
- [ ] إدارة الأسئلة (كامل)
- [ ] مراجعة الإجابات
- [ ] نظام التذاكر
- [ ] عجلة الحظ

### المرحلة 3: الإدارة
- [ ] إدارة المستخدمين
- [ ] سجل التدقيق
- [ ] الإعدادات
- [ ] الأرشيف

### المرحلة 4: التحسينات
- [ ] إشعارات فورية
- [ ] تصدير البيانات
- [ ] إحصائيات متقدمة
- [ ] نسخ احتياطي تلقائي

## 📞 الدعم

للمساعدة أو الأسئلة:
1. راجع هذا الملف أولاً
2. تحقق من console.log للأخطاء
3. راجع Supabase logs
4. تحقق من RLS policies

---

**ملاحظة مهمة**: هذا نظام إنتاج حقيقي. الاستقرار والأمان أهم من الميزات الذكية.
