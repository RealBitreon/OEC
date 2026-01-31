# Supabase-Only System - Quick Reference

## ✅ Migration Complete
The system is now 100% Supabase-based with zero JSON file dependencies.

## Authentication

### Import Auth Functions
```typescript
import { 
  login, 
  signup, 
  logout, 
  getCurrentUser, 
  requireAuth 
} from '@/lib/auth/supabase-auth-v2'
```

### Usage Examples

**Login:**
```typescript
const result = await login(username, password)
if (result.success) {
  // User logged in
}
```

**Signup:**
```typescript
const result = await signup(username, password, roleCode)
if (result.success) {
  // User created
}
```

**Get Current User:**
```typescript
const user = await getCurrentUser()
if (user) {
  console.log(user.username, user.role)
}
```

## Data Access

### Import Repositories
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
  trainingSubmissionsRepo
} from '@/lib/repos'
```

### Usage Examples

**Get All Competitions:**
```typescript
const competitions = await competitionsRepo.getAll()
```

**Get Question by ID:**
```typescript
const question = await questionsRepo.getById(questionId)
```

**Create Submission:**
```typescript
const submission = await submissionsRepo.create({
  id: crypto.randomUUID(),
  userId,
  questionId,
  answer,
  isCorrect,
  submittedAt: new Date().toISOString()
})
```

## File Structure

```
lib/
├── auth/
│   ├── supabase-auth-v2.ts  ← All auth functions
│   └── types.ts             ← Auth types
├── repos/
│   ├── index.ts             ← Repository exports
│   ├── interfaces.ts        ← Repository interfaces
│   └── supabase/           ← Supabase implementations
│       ├── audit.ts
│       ├── competitions.ts
│       ├── questions.ts
│       ├── submissions.ts
│       ├── tickets.ts
│       ├── users.ts
│       └── wheel.ts
└── supabase/
    ├── client.ts            ← Client-side Supabase
    └── server.ts            ← Server-side Supabase
```

## Environment Setup

Required variables in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CEO_ROLE_CODE=your_ceo_code
MANAGER_ROLE_CODE=your_manager_code
```

## Key Points

1. **No JSON Files** - All data stored in Supabase
2. **Single Auth Module** - Only `supabase-auth-v2.ts` is used
3. **Repository Pattern** - All data access through repositories
4. **Type Safety** - Full TypeScript support
5. **Server Actions** - All mutations use 'use server'

## Common Operations

### Check User Role
```typescript
const user = await getCurrentUser()
if (user?.role === 'CEO') {
  // CEO-only operations
}
```

### Create Competition
```typescript
const competition = await competitionsRepo.create({
  id: crypto.randomUUID(),
  title: 'Competition Title',
  slug: 'competition-slug',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  status: 'active'
})
```

### Get Active Competition
```typescript
const active = await competitionsRepo.getActive()
```

## Dashboard Auth

Dashboard uses its own auth wrapper in `app/dashboard/lib/auth.ts`:
```typescript
import { getUserProfile } from '@/app/dashboard/lib/auth'

const user = await getUserProfile()
```

This internally uses Supabase Auth but provides dashboard-specific functionality.

## No More JSON!

❌ No `data/users.json`
❌ No `data/sessions.json`
❌ No `data/competitions.json`
❌ No `data/questions.json`
❌ No `data/submissions.json`
❌ No `lib/auth/json-auth.ts`

✅ Everything in Supabase database
✅ Real-time updates
✅ Scalable and secure
✅ Automatic backups
