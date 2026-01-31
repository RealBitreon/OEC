# Quick Start - New Dashboard Flow

## 🚀 Run Database Migration First

```sql
-- In Supabase SQL Editor, run:
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED' 
CHECK (status IN ('DRAFT', 'PUBLISHED'));

CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

UPDATE questions SET status = 'PUBLISHED';
```

## 📱 New User Flow

### Create Competition
1. Sidebar → **إدارة المسابقات**
2. Click **إنشاء مسابقة**
3. Fill details → Save
4. Click **عرض المسابقة** on card

### Add Questions to Competition
1. From Competition Hub → Click **الأسئلة**
2. Two options:
   - **إنشاء سؤال جديد** - Create new
   - **إضافة من المكتبة** - Add from library
3. In library modal:
   - Tab 1: **الأسئلة التدريبية** (Training)
   - Tab 2: **مكتبة الأسئلة** (Bank)
4. Select questions → **إضافة الأسئلة**

### Create Training Questions
1. Sidebar → **الأسئلة التدريبية**
2. Click **إضافة سؤال**
3. Check ✓ **سؤال تدريبي**
4. Fill & Save

### Create Bank Questions
1. Sidebar → **مكتبة الأسئلة**
2. Click **إضافة سؤال**
3. Don't check training
4. Don't select competition
5. Fill & Save (saved as DRAFT)

### Review Submissions
1. From Competition Hub → Click **إجابات الطلاب**
2. Shows only this competition's submissions
3. Review & correct

### Run Wheel
1. From Competition Hub → Click **عجلة الحظ**
2. Lock snapshot → Run draw → Publish

## 🗺️ Route Map

```
Dashboard
├─ Overview (/dashboard)
├─ Competitions (/dashboard/competitions)
│  └─ [Competition Hub] (/dashboard/competitions/[id])
│     ├─ Manage (/dashboard/competitions/[id]/manage)
│     ├─ Questions (/dashboard/competitions/[id]/questions)
│     ├─ Submissions (/dashboard/competitions/[id]/submissions)
│     └─ Wheel (/dashboard/competitions/[id]/wheel)
├─ Training Questions (/dashboard/training-questions)
├─ Question Bank (/dashboard/question-bank)
├─ Archives (/dashboard/archives)
├─ Settings (/dashboard/settings)
├─ Users (/dashboard/users) [CEO only]
└─ Audit (/dashboard/audit) [CEO only]
```

## 🎯 Question Types Quick Reference

| Type | Where | is_training | competition_id | status |
|------|-------|-------------|----------------|--------|
| Training | Sidebar → الأسئلة التدريبية | ✓ | null | PUBLISHED |
| Bank | Sidebar → مكتبة الأسئلة | ✗ | null | DRAFT |
| Competition | Competition → الأسئلة | ✗ | [id] | DRAFT/PUBLISHED |

## ✅ What's Removed

- ❌ التذاكر (Tickets) - Removed from sidebar
- ❌ Global Submissions page - Now per-competition
- ❌ Global Wheel page - Now per-competition
- ❌ المسابقة الحالية - Replaced by Competition Hub

## 🎨 Key Features

- **Competition Hub**: Central page for each competition with 4 action cards
- **Add from Library**: Modal to add training/bank questions to competition
- **Back Buttons**: Easy navigation back to hub
- **RTL Arabic**: Full right-to-left support
- **Role-based**: CEO and LRC_MANAGER access

## 📝 Build Status

✅ Build successful
✅ 22 routes compiled
✅ No TypeScript errors
✅ Ready for testing
