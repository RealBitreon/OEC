# 🏗️ Supabase Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages/     │  │  Components  │  │   API        │      │
│  │   Routes     │  │              │  │   Routes     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────┐        │
│  │         Repository Layer (lib/repos/)           │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │        │
│  │  │  Users   │ │Competitions│ │Questions │       │        │
│  │  │   Repo   │ │    Repo    │ │   Repo   │       │        │
│  │  └──────────┘ └──────────┘ └──────────┘       │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │        │
│  │  │Submissions│ │  Wheel   │ │  Audit   │       │        │
│  │  │   Repo   │ │   Repo   │ │   Repo   │       │        │
│  │  └──────────┘ └──────────┘ └──────────┘       │        │
│  └────────────────────┬────────────────────────────┘        │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ Supabase Client
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                    Supabase Platform                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │              PostgreSQL Database                   │      │
│  │                                                     │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │      │
│  │  │  users   │ │competitions│ │questions │          │      │
│  │  └──────────┘ └──────────┘ └──────────┘          │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │      │
│  │  │submissions│ │wheel_prizes│ │wheel_spins│         │      │
│  │  └──────────┘ └──────────┘ └──────────┘          │      │
│  │  ┌──────────┐ ┌──────────┐                        │      │
│  │  │ sessions │ │audit_logs│                        │      │
│  │  └──────────┘ └──────────┘                        │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │         Row Level Security (RLS) Policies          │      │
│  │  • CEO: Full access                                │      │
│  │  • LRC_MANAGER: Manage competitions & questions    │      │
│  │  • VIEWER: Read-only access                        │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │              Helper Functions                      │      │
│  │  • get_active_competition()                        │      │
│  │  • calculate_submission_score()                    │      │
│  │  • get_competition_stats()                         │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Request Flow
```
User Action
    ↓
Next.js Page/Component
    ↓
Repository Method
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
RLS Policy Check
    ↓
Data Returned
    ↓
Transform to App Types
    ↓
Display to User
```

### 2. Authentication Flow
```
Login Request
    ↓
Check credentials in users table
    ↓
Create session in sessions table
    ↓
Return session token
    ↓
Store in cookies
    ↓
Include in subsequent requests
    ↓
Validate session on each request
```

### 3. Submission Flow
```
User submits answers
    ↓
Create submission record
    ↓
Calculate score (helper function)
    ↓
Calculate tickets (based on rules)
    ↓
Store in submissions table
    ↓
Create audit log entry
    ↓
Return result to user
```

## Database Schema Relationships

```
users
  ├─→ sessions (user_id)
  ├─→ competitions (created_by)
  ├─→ submissions (reviewed_by)
  └─→ audit_logs (user_id)

competitions
  ├─→ questions (competition_id)
  ├─→ submissions (competition_id)
  ├─→ wheel_prizes (competition_id)
  └─→ wheel_spins (competition_id)

questions
  └─→ submissions.answers (JSONB key)

submissions
  ├─→ wheel_spins (submission_id)
  └─→ submissions (previous_submission_id) [self-reference]

wheel_prizes
  └─→ wheel_spins (prize_id)
```

## Repository Pattern

```
Application Code
       ↓
   Interface (IUsersRepo, ICompetitionsRepo, etc.)
       ↓
   Implementation (SupabaseUsersRepo, etc.)
       ↓
   Supabase Client
       ↓
   Database
```

**Benefits:**
- ✅ Decoupled from database implementation
- ✅ Easy to test (mock repositories)
- ✅ Consistent API across the app
- ✅ Type-safe with TypeScript
- ✅ Can switch databases without changing app code

## Security Layers

```
┌─────────────────────────────────────────┐
│  1. Application Layer                   │
│     • Role checks in components         │
│     • Route protection                  │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Repository Layer                    │
│     • Input validation                  │
│     • Business logic                    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Supabase Client Layer               │
│     • Authentication                    │
│     • Session management                │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. Database Layer (RLS)                │
│     • Row-level security policies       │
│     • Role-based access control         │
│     • Data integrity constraints        │
└─────────────────────────────────────────┘
```

## File Structure

```
project/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   │   ├── actions/              # Server actions
│   │   ├── components/           # Dashboard components
│   │   └── page.tsx              # Dashboard page
│   ├── login/                    # Login page
│   └── ...
│
├── lib/
│   ├── repos/                    # Repository layer
│   │   ├── supabase/             # Supabase implementations
│   │   │   ├── users.ts          # Users repository
│   │   │   ├── competitions.ts   # Competitions repository
│   │   │   ├── questions.ts      # Questions repository
│   │   │   ├── submissions.ts    # Submissions repository
│   │   │   ├── tickets.ts        # Tickets repository
│   │   │   ├── wheel.ts          # Wheel repository
│   │   │   └── audit.ts          # Audit repository
│   │   ├── interfaces.ts         # Repository interfaces
│   │   └── index.ts              # Export repositories
│   │
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   │
│   ├── auth/                     # Authentication
│   │   ├── supabase.ts           # Supabase auth helpers
│   │   └── types.ts              # Auth types
│   │
│   └── store/
│       └── types.ts              # Application types
│
├── supabase_complete_migration.sql  # Database migration
├── SUPABASE_MIGRATION_COMPLETE.md   # Migration guide
├── SUPABASE_QUICK_REFERENCE.md      # Quick reference
├── DEPLOYMENT_CHECKLIST.md          # Deployment guide
├── MIGRATION_SUMMARY.md             # Summary
└── ARCHITECTURE.md                  # This file
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend Layer                  │
│  • Next.js 14 (App Router)              │
│  • React 18                             │
│  • TypeScript                           │
│  • Tailwind CSS                         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│  • Server Actions                       │
│  • API Routes                           │
│  • Repository Pattern                   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Layer                      │
│  • Supabase Client                      │
│  • PostgreSQL                           │
│  • Row Level Security                   │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Vercel/Netlify                  │
│  • Next.js Application                  │
│  • Edge Functions                       │
│  • Static Assets                        │
└─────────────────┬───────────────────────┘
                  ↓
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────┐
│         Supabase Cloud                  │
│  • PostgreSQL Database                  │
│  • Authentication                       │
│  • Storage (if needed)                  │
│  • Real-time (if needed)                │
└─────────────────────────────────────────┘
```

## Performance Optimizations

### 1. Database Level
- ✅ Indexes on frequently queried columns
- ✅ JSONB for flexible data structures
- ✅ Views for complex queries
- ✅ Helper functions for calculations

### 2. Application Level
- ✅ Repository pattern for caching
- ✅ Server-side rendering
- ✅ Static generation where possible
- ✅ Optimistic updates

### 3. Network Level
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Batch operations
- ✅ Pagination

## Monitoring & Observability

```
Application Logs
       ↓
Supabase Dashboard
       ↓
┌─────────────────────────────────────────┐
│  • API Logs                             │
│  • Database Logs                        │
│  • Performance Metrics                  │
│  • Error Tracking                       │
└─────────────────────────────────────────┘
       ↓
Alerts & Notifications
```

## Backup & Recovery

```
┌─────────────────────────────────────────┐
│         Automatic Backups               │
│  • Daily snapshots                      │
│  • Point-in-time recovery               │
│  • 7-day retention (default)            │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Manual Backups                  │
│  • On-demand snapshots                  │
│  • Before major changes                 │
│  • Export to external storage           │
└─────────────────────────────────────────┘
```

## Scaling Strategy

### Vertical Scaling
- Upgrade Supabase plan
- Increase database resources
- More connection pooling

### Horizontal Scaling
- Read replicas (Supabase Pro)
- CDN for static assets
- Edge functions for API routes

### Data Scaling
- Partitioning large tables
- Archiving old data
- Optimizing queries

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **Row Level Security**
   - Enable on all tables
   - Test policies thoroughly
   - Review regularly

3. **Authentication**
   - Strong password hashing
   - Session expiration
   - Secure cookie settings

4. **API Security**
   - Rate limiting
   - Input validation
   - SQL injection prevention (automatic with Supabase)

## Future Enhancements

### Phase 1 (Immediate)
- ✅ Complete migration
- ✅ Test thoroughly
- ✅ Deploy to production

### Phase 2 (Short-term)
- [ ] Add real-time subscriptions
- [ ] Implement full-text search
- [ ] Add file storage for proofs
- [ ] Enhanced analytics

### Phase 3 (Long-term)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Machine learning for scoring
- [ ] Multi-language support

---

**This architecture provides a solid foundation for a scalable, secure, and maintainable application! 🚀**
