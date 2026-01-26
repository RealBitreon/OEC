# Prompt 9: Repository Layer Migration Guide

## What Changed

### Architecture Refactor
The application now uses a **Repository Pattern** to abstract data access. All direct JSON file operations have been moved behind repository interfaces, making it possible to swap data providers without changing business logic.

### New Structure

```
lib/repos/
├── interfaces.ts              # Repository interface definitions
├── index.ts                   # Factory that switches between implementations
├── json/                      # JSON file implementations (current/active)
│   ├── competitions.ts
│   ├── questions.ts
│   ├── submissions.ts
│   ├── tickets.ts
│   ├── wheel.ts
│   ├── winners.ts
│   ├── users.ts
│   ├── audit.ts
│   └── training-submissions.ts
└── supabase/                  # Supabase implementations (stubs, not active)
    ├── competitions.ts
    ├── questions.ts
    ├── submissions.ts
    ├── tickets.ts
    ├── wheel.ts
    ├── winners.ts
    ├── users.ts
    ├── audit.ts
    └── training-submissions.ts
```

### Files Modified

1. **lib/repos/** - New repository layer
2. **lib/competition/tickets.ts** - Now uses repos instead of direct file access
3. **lib/competition/wheel.ts** - Now uses repos instead of direct file access
4. **lib/store/helpers.ts** - Now uses repos instead of direct file access
5. **app/dashboard/actions.ts** - Now uses repos instead of direct file access
6. **.env** - Added DATA_PROVIDER=json
7. **.env.example** - Added DATA_PROVIDER documentation
8. **supabase/schema.sql** - Database schema prepared (not executed)

### No Behavior Changes

- All routes work exactly the same
- All exports, audit logs, wheel, archives work identically
- JSON files remain the data source
- No 404s, no broken functionality
- All Prompt 8 tests should still pass

## How to Enable Supabase Later

### Step 1: Set Up Supabase Project

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Add to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Run Database Migration

1. Open Supabase SQL Editor
2. Run the schema from `supabase/schema.sql`
3. Verify all tables are created

### Step 3: Implement Supabase Repositories

Replace the stub implementations in `lib/repos/supabase/` with real Supabase queries:

```typescript
// Example: lib/repos/supabase/competitions.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class SupabaseCompetitionsRepo implements ICompetitionsRepo {
  async getActive(): Promise<Competition | null> {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .single()
    
    if (error) return null
    return data
  }
  
  // ... implement other methods
}
```

### Step 4: Migrate Data from JSON to Supabase

Create a migration script to copy existing JSON data:

```typescript
// scripts/migrate-json-to-supabase.ts
import { readJson } from '@/lib/store/readWrite'
import { createClient } from '@supabase/supabase-js'

async function migrate() {
  const supabase = createClient(...)
  
  // Migrate competitions
  const competitions = await readJson('competitions.json', [])
  await supabase.from('competitions').insert(competitions)
  
  // Migrate questions
  const questions = await readJson('questions.json', [])
  await supabase.from('questions').insert(questions)
  
  // ... migrate all other data
}
```

### Step 5: Switch Data Provider

1. Update `.env`:
   ```
   DATA_PROVIDER=supabase
   ```

2. Restart your application

3. Test all functionality:
   - Create competition
   - Add questions
   - Submit answers
   - Run wheel
   - Export data
   - View audit logs

### Step 6: Enable RLS Policies (Optional)

Once Supabase is working, you can enable Row Level Security:

```sql
-- Enable RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Example policy: Students can only read active competitions
CREATE POLICY "Students can view active competitions"
  ON competitions FOR SELECT
  USING (status = 'active');

-- Example policy: Managers can do everything
CREATE POLICY "Managers have full access"
  ON competitions FOR ALL
  USING (auth.jwt() ->> 'role' IN ('ceo', 'lrc_manager'));
```

## Repository Interface Reference

### ICompetitionsRepo
- `getActive()` - Get active competition
- `getBySlug(slug)` - Get competition by slug
- `getById(id)` - Get competition by ID
- `listAll()` - List all competitions
- `listByStatus(status)` - List competitions by status
- `create(data)` - Create new competition
- `update(id, patch)` - Update competition
- `archiveActive()` - Archive all active competitions

### IQuestionsRepo
- `listByCompetition(competitionId)` - List questions for competition
- `listTraining()` - List training questions
- `listActive()` - List active questions
- `getById(id)` - Get question by ID
- `create(data)` - Create new question
- `update(id, patch)` - Update question
- `delete(id)` - Delete question

### ISubmissionsRepo
- `list(filters)` - List submissions with optional filters
- `getById(id)` - Get submission by ID
- `create(data)` - Create new submission
- `update(id, patch)` - Update submission
- `countCorrectByStudent(competitionId, studentUsername)` - Count correct submissions

### ITicketsRepo
- `listByCompetition(competitionId)` - List tickets for competition
- `listByStudent(competitionId, studentUsername)` - List student's tickets
- `getTotalsByStudent(competitionId)` - Get ticket totals by student
- `getById(id)` - Get ticket by ID
- `create(data)` - Create new ticket
- `deleteBySubmission(submissionId)` - Delete tickets for submission
- `deleteByCompetition(competitionId)` - Delete all tickets for competition
- `bulkCreate(tickets)` - Create multiple tickets

### IWheelRepo
- `getRunByCompetition(competitionId)` - Get wheel run for competition
- `getRunById(id)` - Get wheel run by ID
- `listRuns(filters)` - List wheel runs with optional filters
- `create(data)` - Create new wheel run
- `update(id, patch)` - Update wheel run

### IWinnersRepo
- `getByCompetition(competitionId)` - Get winner for competition
- `listAll()` - List all winners
- `create(data)` - Create new winner

### IUsersRepo
- `findByUsername(username)` - Find user by username
- `listAll()` - List all users
- `create(data)` - Create new user
- `updateRole(username, role)` - Update user role

### IAuditRepo
- `list(filters)` - List audit logs with optional filters
- `append(entry)` - Append new audit log entry

## Benefits of This Architecture

1. **Clean Separation** - Business logic doesn't know about storage details
2. **Easy Testing** - Can mock repositories for unit tests
3. **Flexible Migration** - Switch data providers with one env variable
4. **Type Safety** - Interfaces ensure consistent API across implementations
5. **No Breaking Changes** - Existing code continues to work
6. **Future-Proof** - Can add more providers (PostgreSQL, MongoDB, etc.)

## Verification Checklist

After implementing Prompt 9, verify:

- [ ] Application starts without errors
- [ ] Can create competitions
- [ ] Can add questions
- [ ] Can submit answers
- [ ] Tickets are calculated correctly
- [ ] Wheel snapshot locks properly
- [ ] Wheel draw selects winner
- [ ] Exports work (submissions, tickets, winners)
- [ ] Audit logs are recorded
- [ ] User role management works
- [ ] Archives display correctly
- [ ] All Prompt 8 tests pass

## Rollback Plan

If issues occur, rollback is simple:

1. The JSON implementation is still active
2. No database changes were made
3. Simply revert the code changes
4. All data remains in JSON files

## Next Steps

After Prompt 9 is stable:

1. Implement Supabase repositories (one at a time)
2. Write integration tests for Supabase repos
3. Create data migration script
4. Test in staging environment
5. Migrate production data
6. Switch DATA_PROVIDER to supabase
7. Monitor for issues
8. Keep JSON as backup for 30 days
9. Enable RLS policies
10. Remove JSON implementation (optional)
