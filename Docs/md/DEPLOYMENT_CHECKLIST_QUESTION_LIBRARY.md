# Deployment Checklist: Question Library System

## Pre-Deployment

### 1. Database Migration
- [ ] Backup current database
- [ ] Review migration SQL: `Docs/SQL/question_library_migration.sql`
- [ ] Execute migration in Supabase SQL Editor
- [ ] Verify `status` column added: 
  ```sql
  SELECT column_name, data_type, column_default 
  FROM information_schema.columns 
  WHERE table_name = 'questions' AND column_name = 'status';
  ```
- [ ] Verify existing questions updated:
  ```sql
  SELECT 
      CASE 
          WHEN competition_id IS NOT NULL THEN 'Competition'
          WHEN is_training = true THEN 'Training'
          ELSE 'Library'
      END as type,
      status,
      COUNT(*) as count
  FROM questions
  GROUP BY type, status;
  ```

### 2. Code Review
- [ ] All TypeScript files compile without errors
- [ ] No console errors in development
- [ ] All imports resolved correctly
- [ ] Type definitions match database schema

### 3. Testing (Development)

#### Test 1: Create Library Question
- [ ] Navigate to `/dashboard/question-bank`
- [ ] Click "إضافة سؤال"
- [ ] Choose "حفظ في المكتبة"
- [ ] Fill form and save
- [ ] Verify question appears with "مسودة" badge
- [ ] Verify in database: `status='DRAFT'`, `is_training=false`, `competition_id=NULL`

#### Test 2: Create Training Question
- [ ] Navigate to `/dashboard/training-questions`
- [ ] Click "إضافة سؤال"
- [ ] Choose "نشر كسؤال تدريبي"
- [ ] Fill form and save
- [ ] Verify question appears with "منشور" badge
- [ ] Verify in database: `status='PUBLISHED'`, `is_training=true`, `competition_id=NULL`

#### Test 3: Move Library → Training
- [ ] Go to library question
- [ ] Click "نشر للتدريب"
- [ ] Confirm
- [ ] Verify question moved to training
- [ ] Verify in database: status changed to 'PUBLISHED', is_training=true

#### Test 4: Move Training → Library
- [ ] Go to training question
- [ ] Click "نقل للمكتبة"
- [ ] Confirm
- [ ] Verify question moved to library
- [ ] Verify in database: status changed to 'DRAFT', is_training=false

#### Test 5: Add to Competition
- [ ] Navigate to `/dashboard/competitions/[id]/questions`
- [ ] Click "من التدريب" or "من المكتبة"
- [ ] Select 2-3 questions
- [ ] Click "إضافة X سؤال"
- [ ] Confirm
- [ ] Verify questions appear in competition
- [ ] Verify originals still in library/training (check database)
- [ ] Verify new records created with competition_id set

#### Test 6: Server Guards
- [ ] Try to create question with competition_id via API (should fail)
- [ ] Try to update question with competition_id via API (should fail)
- [ ] Verify error messages are clear

#### Test 7: Delete Operations
- [ ] Delete question from library (should remove completely)
- [ ] Delete question from training (should remove completely)
- [ ] Delete question from competition (should keep original)

### 4. Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile responsive (iOS Safari, Chrome Android)

### 5. Performance
- [ ] Question list loads in < 2 seconds
- [ ] Modal opens instantly
- [ ] Form submission completes in < 1 second
- [ ] No memory leaks (check DevTools)

## Deployment

### 1. Environment Variables
- [ ] Verify all Supabase environment variables set
- [ ] Verify API keys are correct
- [ ] Test connection to Supabase

### 2. Build
- [ ] Run `npm run build`
- [ ] Verify no build errors
- [ ] Check build output size
- [ ] Test production build locally

### 3. Deploy to Vercel/Production
- [ ] Push code to repository
- [ ] Trigger deployment
- [ ] Monitor deployment logs
- [ ] Verify deployment successful

### 4. Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test authentication
- [ ] Test question creation (library)
- [ ] Test question creation (training)
- [ ] Test add to competition
- [ ] Check browser console for errors
- [ ] Check Supabase logs for errors

## Post-Deployment

### 1. Smoke Tests (Production)
- [ ] Create library question
- [ ] Create training question
- [ ] Move question between states
- [ ] Add questions to competition
- [ ] Delete questions
- [ ] Verify all success messages appear

### 2. User Acceptance Testing
- [ ] Have teacher test the flow
- [ ] Verify they understand destination modal
- [ ] Verify they can add questions to competitions
- [ ] Collect feedback

### 3. Monitoring
- [ ] Check error logs (first 24 hours)
- [ ] Monitor database performance
- [ ] Check for any user-reported issues
- [ ] Verify no data corruption

### 4. Documentation
- [ ] Share `نظام_مكتبة_الأسئلة.md` with teachers
- [ ] Share `QUICK_START_QUESTION_LIBRARY.md` with admins
- [ ] Update internal wiki/docs
- [ ] Create video tutorial (optional)

## Rollback Plan

If critical issues found:

### 1. Immediate Rollback
```bash
# Revert to previous deployment
git revert <commit-hash>
git push
```

### 2. Database Rollback (if needed)
```sql
-- Remove status column
ALTER TABLE questions DROP COLUMN IF EXISTS status;

-- Restore from backup if necessary
-- (Use Supabase backup/restore feature)
```

### 3. Communication
- [ ] Notify users of rollback
- [ ] Explain issue and timeline
- [ ] Provide workaround if available

## Success Criteria

- [ ] All tests pass
- [ ] No errors in production logs
- [ ] Teachers can create questions successfully
- [ ] Questions never auto-assign to competitions
- [ ] Add to competition flow works correctly
- [ ] Performance is acceptable
- [ ] No data loss or corruption
- [ ] User feedback is positive

## Known Limitations

Document any known limitations:
- [ ] None currently

## Future Enhancements

Ideas for future improvements:
- [ ] Bulk import UI (CSV upload)
- [ ] Question templates library
- [ ] Question preview before adding to competition
- [ ] Question analytics (usage stats)
- [ ] Question versioning
- [ ] Question tags/categories

## Sign-Off

- [ ] Developer: Tested and verified
- [ ] QA: All tests passed
- [ ] Product Owner: Approved for deployment
- [ ] DevOps: Deployment successful
- [ ] Support: Documentation received

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: 2.0
**Status**: ☐ Pending ☐ In Progress ☐ Complete ☐ Rolled Back
