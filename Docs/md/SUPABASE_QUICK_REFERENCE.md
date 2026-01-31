# Supabase Quick Reference

## 🚀 Quick Start

### 1. Run Migration
```bash
# Copy supabase_complete_migration.sql content
# Paste in Supabase Dashboard → SQL Editor → Run
```

### 2. Set Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start Development
```bash
npm run dev
```

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | username, role, password |
| `sessions` | Auth sessions | user_id, expires_at |
| `competitions` | Competitions | title, slug, status, rules |
| `questions` | Questions | question_text, options, correct_answer |
| `submissions` | Participant answers | answers, score, status |
| `wheel_prizes` | Wheel prizes | name, quantity, probability |
| `wheel_spins` | Spin history | participant_name, prize_name |
| `audit_logs` | Activity logs | user_id, action, details |

## 🔑 Common Queries

### Get Active Competition
```typescript
import { competitionsRepo } from '@/lib/repos'
const competition = await competitionsRepo.getActive()
```

### Get Questions for Competition
```typescript
import { questionsRepo } from '@/lib/repos'
const questions = await questionsRepo.listByCompetition(competitionId)
```

### Get Submissions
```typescript
import { submissionsRepo } from '@/lib/repos'
const submissions = await submissionsRepo.listByCompetition(competitionId)
```

### Create Question
```typescript
import { questionsRepo } from '@/lib/repos'
const question = await questionsRepo.create({
  id: crypto.randomUUID(),
  competitionId: 'comp-id',
  isTraining: false,
  type: 'mcq',
  questionText: 'What is...?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
  sourceRef: { volume: '1', page: '10', lineFrom: '5', lineTo: '7' },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
```

### Update Submission Status
```typescript
import { submissionsRepo } from '@/lib/repos'
await submissionsRepo.update(submissionId, {
  finalResult: 'correct',
  reviewedAt: new Date().toISOString(),
  reviewedBy: userId,
})
```

## 🔒 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **CEO** | Full access - manage everything |
| **LRC_MANAGER** | Manage competitions, questions, submissions |
| **VIEWER** | Read-only access |

## 🛠️ Helper Functions

### Calculate Score
```sql
SELECT * FROM calculate_submission_score(
  'competition-id',
  '{"question-id": "answer"}'::jsonb
);
```

### Get Competition Stats
```sql
SELECT * FROM get_competition_stats('competition-id');
```

### Get Active Competition
```sql
SELECT * FROM get_active_competition();
```

## 📈 Useful Views

### Active Questions with Competition Info
```sql
SELECT * FROM active_questions_view;
```

### Submissions with Details
```sql
SELECT * FROM submissions_detailed_view
WHERE competition_id = 'comp-id';
```

### Available Wheel Prizes
```sql
SELECT * FROM wheel_prizes_available_view
WHERE competition_id = 'comp-id';
```

## 🔍 Direct SQL Queries (Supabase Dashboard)

### Count Everything
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM competitions) as competitions,
  (SELECT COUNT(*) FROM questions) as questions,
  (SELECT COUNT(*) FROM submissions) as submissions;
```

### Recent Activity
```sql
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Pending Submissions
```sql
SELECT * FROM submissions
WHERE status = 'pending'
ORDER BY submitted_at DESC;
```

### Competition Leaderboard
```sql
SELECT 
  participant_name,
  SUM(tickets_earned) as total_tickets,
  COUNT(*) as submissions,
  AVG(score) as avg_score
FROM submissions
WHERE competition_id = 'comp-id'
  AND status = 'approved'
GROUP BY participant_name
ORDER BY total_tickets DESC;
```

## 🐛 Debugging

### Check Supabase Connection
```typescript
import { createServiceClient } from '@/lib/supabase/server'

const supabase = createServiceClient()
const { data, error } = await supabase.from('users').select('count')
console.log('Connection:', error ? 'Failed' : 'Success', data)
```

### View Logs
- Supabase Dashboard → Logs → API Logs
- Check for 401 (auth), 403 (permissions), 404 (not found)

### Test RLS Policies
```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id", "role": "CEO"}';
SELECT * FROM users;
```

## 📦 Repository Pattern

All data access goes through repositories:

```typescript
import {
  usersRepo,
  competitionsRepo,
  questionsRepo,
  submissionsRepo,
  ticketsRepo,
  wheelRepo,
  winnersRepo,
  auditRepo,
  participantsRepo,
  trainingSubmissionsRepo,
} from '@/lib/repos'
```

**Benefits:**
- ✅ Consistent API across the app
- ✅ Easy to test and mock
- ✅ Type-safe with TypeScript
- ✅ Centralized data access logic

## 🔄 Migration Status

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Complete |
| Users Repository | ✅ Complete |
| Competitions Repository | ✅ Complete |
| Questions Repository | ✅ Complete |
| Submissions Repository | ✅ Complete |
| Wheel Repository | ✅ Complete |
| Audit Repository | ✅ Complete |
| RLS Policies | ✅ Complete |
| Helper Functions | ✅ Complete |
| Views | ✅ Complete |
| Data Migration | ✅ Complete |

## 📝 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)

## 🎯 Testing Checklist

- [ ] SQL migration runs without errors
- [ ] Can login with existing users
- [ ] Dashboard loads
- [ ] Can view competitions
- [ ] Can view questions
- [ ] Can view submissions
- [ ] Can create new items (CEO/LRC_MANAGER)
- [ ] RLS policies work correctly

## 💡 Tips

1. **Use service client for admin operations** - Bypasses RLS
2. **Always handle errors** - Database operations can fail
3. **Use transactions for related operations** - Ensure data consistency
4. **Monitor query performance** - Check Supabase dashboard
5. **Keep service role key secret** - Never expose in client code

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Ready to go! 🚀**
