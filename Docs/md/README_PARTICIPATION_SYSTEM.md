# نظام المشاركة في المسابقات - الإصدار 2.0

## 🎯 نظرة عامة

نظام محسّن للمشاركة في المسابقات يتضمن:
- الاسم الثلاثي (الاسم + الأب + القبيلة)
- الصف الدراسي
- حقل الدليل الإلزامي
- عرض جميع الأسئلة
- عرض التذاكر المكتسبة
- نظام إعادة المحاولة

---

## 🚀 البدء السريع

### 1. تحديث قاعدة البيانات
```bash
# PostgreSQL
psql -U your_user -d your_database -f update_submissions_schema.sql

# Supabase
# افتح SQL Editor والصق محتوى الملف
```

### 2. تشغيل المشروع
```bash
npm install
npm run dev
```

### 3. اختبار النظام
- افتح `http://localhost:3000`
- انتقل إلى مسابقة نشطة
- جرب المشاركة

---

## 📋 المتطلبات

### الحقول الإلزامية للمشاركة:
1. **الاسم الأول** (first_name)
2. **اسم الأب** (father_name)
3. **القبيلة/العائلة** (family_name)
4. **الصف الدراسي** (grade: 1-12)
5. **الإجابات** (answers)
6. **الأدلة** (proofs) - لكل سؤال

---

## 🔧 API Reference

### POST /api/competition/submit

إرسال إجابات المسابقة

**Request Body:**
```json
{
  "competition_id": "uuid",
  "first_name": "محمد",
  "father_name": "أحمد",
  "family_name": "العامري",
  "grade": "10",
  "answers": {
    "question_id_1": "الإجابة 1",
    "question_id_2": "الإجابة 2"
  },
  "proofs": {
    "question_id_1": "الدليل 1",
    "question_id_2": "الدليل 2"
  },
  "score": 2,
  "total_questions": 2
}
```

**Response:**
```json
{
  "success": true,
  "submission_id": "uuid",
  "score": 2,
  "total_questions": 2,
  "tickets_earned": 2
}
```

**Error Responses:**
```json
// بيانات غير مكتملة
{
  "error": "بيانات غير مكتملة"
}

// الدليل مفقود
{
  "error": "يجب كتابة الدليل لجميع الأسئلة"
}

// مشاركة سابقة
{
  "error": "لقد قمت بالمشاركة مسبقاً. يمكنك إعادة المحاولة مرة واحدة فقط بموافقة المعلم"
}
```

---

## 🎨 المكونات

### ParticipationForm

مكون React للمشاركة في المسابقة

**Props:**
```typescript
interface Props {
  competition: Competition
  questions: Question[]
}
```

**States:**
```typescript
const [firstName, setFirstName] = useState('')
const [fatherName, setFatherName] = useState('')
const [familyName, setFamilyName] = useState('')
const [grade, setGrade] = useState('')
const [answers, setAnswers] = useState<Record<string, string>>({})
const [proofs, setProofs] = useState<Record<string, string>>({})
const [ticketsEarned, setTicketsEarned] = useState(0)
const [showAllQuestions, setShowAllQuestions] = useState(false)
```

**Usage:**
```tsx
<ParticipationForm 
  competition={competition}
  questions={questions}
/>
```

---

## 🗄️ قاعدة البيانات

### جدول submissions

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  
  -- الاسم الثلاثي
  first_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  participant_name TEXT, -- الاسم الكامل
  
  -- معلومات إضافية
  grade TEXT NOT NULL,
  
  -- الإجابات والأدلة
  answers JSONB NOT NULL,
  proofs JSONB NOT NULL,
  
  -- النتائج
  score INTEGER,
  total_questions INTEGER,
  tickets_earned INTEGER DEFAULT 0,
  
  -- نظام إعادة المحاولة
  retry_allowed BOOLEAN DEFAULT FALSE,
  is_retry BOOLEAN DEFAULT FALSE,
  previous_submission_id UUID REFERENCES submissions(id),
  retried BOOLEAN DEFAULT FALSE,
  new_submission_id UUID REFERENCES submissions(id),
  
  -- التواريخ
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);
```

### الفهارس
```sql
CREATE INDEX idx_submissions_first_name ON submissions(first_name);
CREATE INDEX idx_submissions_father_name ON submissions(father_name);
CREATE INDEX idx_submissions_family_name ON submissions(family_name);
CREATE INDEX idx_submissions_grade ON submissions(grade);
CREATE INDEX idx_submissions_participant_competition 
  ON submissions(competition_id, first_name, father_name, family_name);
```

---

## 🔐 الأمان

### التحقق من البيانات

**في الواجهة الأمامية:**
```typescript
// التحقق من الاسم الثلاثي
if (!firstName.trim() || !fatherName.trim() || !familyName.trim()) {
  alert('يرجى إدخال الاسم الثلاثي كاملاً')
  return
}

// التحقق من الصف
if (!grade.trim()) {
  alert('يرجى إدخال الصف')
  return
}

// التحقق من الدليل
if (!proofs[currentQuestion.id] || !proofs[currentQuestion.id].trim()) {
  alert('يرجى كتابة الدليل على إجابتك')
  return
}
```

**في الواجهة الخلفية:**
```typescript
// التحقق من الحقول المطلوبة
if (!competition_id || !participant_name || !first_name || 
    !father_name || !family_name || !grade || !answers || !proofs) {
  return NextResponse.json(
    { error: 'بيانات غير مكتملة' },
    { status: 400 }
  )
}

// التحقق من الأدلة
const answerKeys = Object.keys(answers)
for (const key of answerKeys) {
  if (!proofs[key] || !proofs[key].trim()) {
    return NextResponse.json(
      { error: 'يجب كتابة الدليل لجميع الأسئلة' },
      { status: 400 }
    )
  }
}
```

### سياسات RLS
```sql
-- القراءة: الجميع
CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- الإدراج: الجميع
CREATE POLICY "Anyone can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- التحديث: المدراء فقط
CREATE POLICY "Only managers can update submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_participants
      WHERE id = auth.uid()
      AND role IN ('LRC_MANAGER', 'CEO')
    )
  );
```

---

## 📊 حساب التذاكر

### القواعد

**1. all_correct (جميع الإجابات صحيحة):**
```typescript
if (score === totalQuestions) {
  tickets = score * ticketsPerCorrect
}
```

**2. min_correct (حد أدنى من الإجابات):**
```typescript
if (score >= minCorrectAnswers) {
  tickets = score * ticketsPerCorrect
}
```

### مثال
```typescript
function calculateTickets(
  score: number, 
  totalQuestions: number, 
  rules: any
): number {
  if (!rules) return 0
  
  const { eligibilityMode, minCorrectAnswers, ticketsPerCorrect } = rules
  
  if (eligibilityMode === 'all_correct') {
    return score === totalQuestions ? score * (ticketsPerCorrect || 1) : 0
  } else if (eligibilityMode === 'min_correct') {
    return score >= minCorrectAnswers ? score * (ticketsPerCorrect || 1) : 0
  }
  
  return 0
}
```

---

## 🔄 نظام إعادة المحاولة

### للطالب
1. المشاركة الأولى: مسموحة دائماً
2. المشاركة الثانية: تحتاج موافقة المعلم

### للمعلم
```typescript
// السماح بإعادة المحاولة
import { allowRetry } from '@/app/dashboard/actions/submissions'

await allowRetry(submissionId)
```

### التحقق من المشاركة السابقة
```typescript
const existingSubmission = submissions.find(
  (s: any) => 
    s.competition_id === competition_id && 
    s.first_name === first_name && 
    s.father_name === father_name && 
    s.family_name === family_name
)

if (existingSubmission && !existingSubmission.retry_allowed) {
  throw new Error('لقد قمت بالمشاركة مسبقاً')
}
```

---

## 🧪 الاختبار

### اختبار يدوي

**1. المشاركة الأساسية:**
```bash
# افتح المتصفح
http://localhost:3000/competition/[slug]/participate

# أدخل البيانات
الاسم الأول: محمد
اسم الأب: أحمد
القبيلة: العامري
الصف: 10

# أجب على الأسئلة
# اكتب الدليل لكل سؤال
# أرسل الإجابات
# تحقق من عرض التذاكر
```

**2. إعادة المحاولة:**
```bash
# شارك مرة أخرى → يجب أن يفشل
# سجل دخول كمعلم
# اسمح بإعادة المحاولة
# شارك مرة أخرى → يجب أن ينجح
```

### اختبار تلقائي (مستقبلي)
```typescript
describe('Participation System', () => {
  it('should require all three name parts', () => {
    // test implementation
  })
  
  it('should require grade', () => {
    // test implementation
  })
  
  it('should require proof for each answer', () => {
    // test implementation
  })
  
  it('should calculate tickets correctly', () => {
    // test implementation
  })
  
  it('should prevent duplicate submissions', () => {
    // test implementation
  })
  
  it('should allow retry when permitted', () => {
    // test implementation
  })
})
```

---

## 📝 الوثائق

### ملفات التوثيق:
- `PARTICIPATION_IMPROVEMENTS_AR.md` - توثيق شامل
- `QUICK_GUIDE_PARTICIPATION_AR.md` - دليل سريع
- `COMPLETION_SUMMARY_PARTICIPATION_AR.md` - ملخص الإكمال
- `README_PARTICIPATION_SYSTEM.md` - هذا الملف

### ملفات SQL:
- `update_submissions_schema.sql` - تحديث قاعدة البيانات

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يمكن إرسال الإجابات
**الأسباب المحتملة:**
1. حقل من حقول الاسم الثلاثي فارغ
2. الصف غير محدد
3. الدليل مفقود لأحد الأسئلة
4. مشاركة سابقة بدون إذن إعادة

**الحل:**
```typescript
// تحقق من console.log في المتصفح
console.log('firstName:', firstName)
console.log('fatherName:', fatherName)
console.log('familyName:', familyName)
console.log('grade:', grade)
console.log('proofs:', proofs)
```

### المشكلة: التذاكر = 0
**الأسباب المحتملة:**
1. قواعد المسابقة تتطلب جميع الإجابات صحيحة
2. عدد الإجابات الصحيحة أقل من الحد الأدنى
3. الدليل مفقود

**الحل:**
```typescript
// تحقق من قواعد المسابقة
console.log('competition.rules:', competition.rules)
console.log('score:', score)
console.log('totalQuestions:', totalQuestions)
```

### المشكلة: خطأ في قاعدة البيانات
**الأسباب المحتملة:**
1. الحقول الجديدة غير موجودة
2. الفهارس غير منشأة
3. الصلاحيات غير صحيحة

**الحل:**
```bash
# تحقق من تشغيل ملف SQL
psql -U your_user -d your_database -c "\d submissions"

# تحقق من الحقول
psql -U your_user -d your_database -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions'"
```

---

## 🔄 التحديثات المستقبلية

### الإصدار 2.1 (مخطط):
- [ ] تقييم جودة الدليل
- [ ] نظام نقاط للأدلة القوية
- [ ] مكتبة أدلة مشتركة
- [ ] تنبيهات للمعلم

### الإصدار 2.2 (مخطط):
- [ ] تصدير المشاركات إلى Excel
- [ ] تقارير تفصيلية
- [ ] إحصائيات متقدمة
- [ ] لوحة تحكم للطالب

---

## 📞 الدعم

### للمساعدة:
1. راجع الوثائق أعلاه
2. تحقق من الملفات المعدلة
3. راجع ملف SQL

### الإبلاغ عن مشاكل:
- افتح issue في GitHub
- أرفق رسالة الخطأ
- أرفق خطوات إعادة المشكلة

---

## 📄 الترخيص

هذا المشروع مرخص تحت [اسم الترخيص]

---

## 👥 المساهمون

- [اسمك] - التطوير الأساسي
- [أسماء أخرى] - المساهمات

---

**الإصدار:** 2.0.0  
**تاريخ الإصدار:** 28 يناير 2026  
**الحالة:** ✅ مستقر
