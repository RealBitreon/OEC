# Quick Start: Question Library System

## 🚀 Setup (One-Time)

### Step 1: Run Database Migration
Execute this SQL file in your Supabase SQL Editor:
```
Docs/SQL/question_library_migration.sql
```

This adds the `status` column and sets up proper constraints.

### Step 2: Verify Migration
Run this query to check question distribution:
```sql
SELECT 
    CASE 
        WHEN competition_id IS NOT NULL THEN 'Competition'
        WHEN is_training = true AND competition_id IS NULL THEN 'Training'
        WHEN is_training = false AND competition_id IS NULL THEN 'Library'
    END as question_type,
    status,
    COUNT(*) as count
FROM questions
GROUP BY question_type, status
ORDER BY question_type, status;
```

## 📚 Using the System

### Adding a New Question

1. Go to `/dashboard/question-bank` or `/dashboard/training-questions`
2. Click "إضافة سؤال" (Add Question)
3. **Choose destination** in modal:
   - 📚 "حفظ في المكتبة (مسودة)" - Save as draft
   - ✅ "نشر كسؤال تدريبي" - Publish to training (default)
4. Fill in question details
5. Click "حفظ" (Save)

**Result**: Question saved to chosen destination, NOT to any competition

### Moving Questions Between States

#### Library → Training
1. Go to `/dashboard/question-bank`
2. Find question
3. Click "نشر للتدريب" (Publish to Training)
4. Confirm

#### Training → Library
1. Go to `/dashboard/training-questions`
2. Find question
3. Click "نقل للمكتبة" (Move to Library)
4. Confirm

### Adding Questions to Competition

1. Go to `/dashboard/competitions/[id]/questions`
2. Click one of:
   - "من التدريب" (From Training) - green button
   - "من المكتبة" (From Library) - yellow button
3. Select questions in modal (checkbox)
4. Click "إضافة X سؤال" (Add X questions)
5. Confirm

**Result**: Questions COPIED to competition, originals preserved

## 🎯 Quick Reference

### Question States

| State | Route | status | is_training | competition_id |
|-------|-------|--------|-------------|----------------|
| Library | `/dashboard/question-bank` | DRAFT | false | NULL |
| Training | `/dashboard/training-questions` | PUBLISHED | true | NULL |
| Competition | `/dashboard/competitions/[id]/questions` | PUBLISHED | false | UUID |

### Available Actions

| Action | From | To | Button Text |
|--------|------|-----|-------------|
| Create | - | Library/Training | إضافة سؤال |
| Publish | Library | Training | نشر للتدريب |
| Archive | Training | Library | نقل للمكتبة |
| Add to Comp | Library/Training | Competition | من المكتبة / من التدريب |
| Duplicate | Any | Same state | نسخ |
| Delete | Any | - | حذف |

### Important Rules

✅ **DO**:
- Create questions in Library or Training
- Move questions between Library and Training
- Add questions to competitions explicitly
- Duplicate questions freely

❌ **DON'T**:
- Try to create questions directly in competitions
- Expect questions to auto-assign to competitions
- Worry about losing originals when adding to competitions

## 🧪 Testing

### Test 1: Create Library Question
1. Go to `/dashboard/question-bank`
2. Click "إضافة سؤال"
3. Choose "حفظ في المكتبة"
4. Fill form and save
5. ✅ Verify: Question appears in library with "مسودة" badge

### Test 2: Create Training Question
1. Go to `/dashboard/training-questions`
2. Click "إضافة سؤال"
3. Choose "نشر كسؤال تدريبي"
4. Fill form and save
5. ✅ Verify: Question appears in training with "منشور" badge

### Test 3: Add to Competition
1. Go to `/dashboard/competitions/[id]/questions`
2. Click "من التدريب"
3. Select 2-3 questions
4. Click "إضافة X سؤال"
5. ✅ Verify: Questions appear in competition
6. ✅ Verify: Originals still in training (check `/dashboard/training-questions`)

### Test 4: Server Guards
1. Open browser console
2. Try to create question with competition_id:
```javascript
// This should fail with error
await fetch('/api/questions', {
  method: 'POST',
  body: JSON.stringify({
    competition_id: 'some-uuid', // ❌ Should be rejected
    question_text: 'Test',
    // ... other fields
  })
})
```
3. ✅ Verify: Error message about using addToCompetition instead

## 🐛 Troubleshooting

### Questions not showing in Library
- Check filter: Make sure "النوع" is set to "الكل"
- Check database: `SELECT * FROM questions WHERE is_training = false AND competition_id IS NULL AND status = 'DRAFT'`

### Questions not showing in Training
- Check database: `SELECT * FROM questions WHERE is_training = true AND competition_id IS NULL AND status = 'PUBLISHED'`
- Verify migration ran: `SELECT column_name FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'status'`

### Can't add questions to competition
- Verify competition exists: Check `/dashboard/competitions`
- Check browser console for errors
- Verify questions are in library or training (not already in another competition)

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify migration ran successfully
4. Review `QUESTION_LIBRARY_SYSTEM.md` for detailed documentation

## ✨ Success!

You now have a fully functional Question Library system with:
- Clear separation between drafts, training, and competition questions
- No accidental assignments to competitions
- Easy movement between states
- Preserved originals when copying to competitions
- Full teacher control over question lifecycle

Happy teaching! 🎓
