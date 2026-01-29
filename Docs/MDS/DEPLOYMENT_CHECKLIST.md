# 🚀 Supabase Deployment Checklist

## Pre-Deployment

### 1. Supabase Project Setup
- [ ] Create Supabase project at [app.supabase.com](https://app.supabase.com)
- [ ] Note down project URL
- [ ] Copy anon/public key
- [ ] Copy service role key (keep secret!)
- [ ] Enable email confirmations (optional)

### 2. Database Migration
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy entire `supabase_complete_migration.sql` content
- [ ] Paste and execute
- [ ] Verify success message appears
- [ ] Check tables are created (8 tables)

### 3. Verify Data Migration
Run these queries in SQL Editor:

```sql
-- Should return 3
SELECT COUNT(*) FROM users;

-- Should return 1
SELECT COUNT(*) FROM competitions;

-- Should return 5
SELECT COUNT(*) FROM questions;

-- Should return 3
SELECT COUNT(*) FROM submissions;

-- Should return 1
SELECT COUNT(*) FROM sessions;
```

- [ ] All counts match expected values
- [ ] Data looks correct

### 4. Environment Variables
Create/update `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] All three variables set
- [ ] No trailing spaces
- [ ] Keys are correct (test connection)

### 5. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] Dependencies installed
- [ ] No errors during installation

## Testing Phase

### 6. Local Testing
```bash
npm run dev
```

#### Authentication Tests
- [ ] Can access login page
- [ ] Can login with: `youssefyoussef` (CEO)
- [ ] Can login with: `مصادر التعلم` (LRC_MANAGER)
- [ ] Session persists after refresh
- [ ] Can logout successfully

#### Dashboard Tests (CEO/LRC_MANAGER)
- [ ] Dashboard loads without errors
- [ ] Overview section shows stats
- [ ] Can view competitions list
- [ ] Can view active competition
- [ ] Can view questions list
- [ ] Can view submissions list
- [ ] Can view wheel management
- [ ] Can view settings

#### Competition Management (CEO/LRC_MANAGER)
- [ ] Can view competition details
- [ ] Can edit competition
- [ ] Can change competition status
- [ ] Rules are saved correctly (JSONB)
- [ ] Dates validation works

#### Question Management (CEO/LRC_MANAGER)
- [ ] Can view questions list
- [ ] Can create new question
- [ ] Can edit existing question
- [ ] Can delete question
- [ ] Can toggle active/inactive
- [ ] Source references save correctly
- [ ] Options array saves correctly (MCQ)

#### Submission Review (CEO/LRC_MANAGER)
- [ ] Can view submissions list
- [ ] Can filter by status
- [ ] Can view submission details
- [ ] Can approve submission
- [ ] Can reject submission
- [ ] Tickets calculated correctly
- [ ] Score calculated correctly

#### Wheel Management (CEO/LRC_MANAGER)
- [ ] Can view wheel prizes
- [ ] Can create new prize
- [ ] Can edit prize
- [ ] Can delete prize
- [ ] Probability validation works
- [ ] Quantity tracking works

#### Audit Logs (CEO only)
- [ ] Can view audit logs
- [ ] Logs are being created
- [ ] User actions are tracked
- [ ] Timestamps are correct

### 7. Permission Tests

#### CEO Role
- [ ] Can access all sections
- [ ] Can create users
- [ ] Can delete items
- [ ] Can view audit logs

#### LRC_MANAGER Role
- [ ] Can manage competitions
- [ ] Can manage questions
- [ ] Can review submissions
- [ ] Cannot delete users
- [ ] Cannot view audit logs

#### VIEWER Role (if implemented)
- [ ] Can only view data
- [ ] Cannot edit anything

### 8. Performance Tests
- [ ] Page load times < 2 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Database queries are fast

### 9. Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## Production Deployment

### 10. Environment Setup
For production (Vercel/Netlify/etc):

- [ ] Add environment variables to hosting platform
- [ ] Verify variables are set correctly
- [ ] Test connection to Supabase

### 11. Supabase Production Settings

#### Security
- [ ] Enable RLS on all tables ✅ (already done)
- [ ] Review RLS policies
- [ ] Disable public schema access if needed
- [ ] Set up API rate limiting

#### Backups
- [ ] Enable automatic backups
- [ ] Set backup schedule (daily recommended)
- [ ] Test backup restoration

#### Monitoring
- [ ] Enable email alerts
- [ ] Set up error notifications
- [ ] Monitor API usage

### 12. Deploy Application
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to hosting platform
git push origin main  # or your deployment method
```

- [ ] Build succeeds without errors
- [ ] Production build works locally
- [ ] Deployment succeeds
- [ ] Production site is accessible

### 13. Post-Deployment Verification

#### Smoke Tests
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can view data
- [ ] Can create new items
- [ ] Can edit items
- [ ] Can delete items

#### Data Integrity
- [ ] All migrated data is present
- [ ] No data corruption
- [ ] Relationships are intact
- [ ] JSONB fields are correct

#### Performance
- [ ] Response times acceptable
- [ ] No timeout errors
- [ ] Database queries optimized
- [ ] Indexes are being used

## Post-Deployment

### 14. Monitoring Setup
- [ ] Set up Supabase monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

### 15. Documentation
- [ ] Update README with Supabase setup
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document API endpoints

### 16. Cleanup
- [ ] Remove old JSON files (optional)
- [ ] Remove unused code
- [ ] Remove old migration files
- [ ] Update .gitignore

### 17. Team Onboarding
- [ ] Share Supabase project access
- [ ] Share environment variables (securely)
- [ ] Provide migration documentation
- [ ] Train team on new system

## Rollback Plan

### If Something Goes Wrong

#### Option 1: Quick Fix
1. Check Supabase logs
2. Fix the issue
3. Redeploy

#### Option 2: Rollback Database
1. Go to Supabase Dashboard → Database → Backups
2. Restore previous backup
3. Re-run migration if needed

#### Option 3: Rollback Code
1. Revert to previous commit
2. Redeploy application
3. Investigate issue

## Success Criteria

- [ ] All tests pass
- [ ] No errors in production
- [ ] Performance is acceptable
- [ ] Users can login and use the system
- [ ] Data is being saved correctly
- [ ] Backups are working
- [ ] Monitoring is active

## Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor API usage
- [ ] Check backup status

### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Review audit logs
- [ ] Update dependencies

### Monthly
- [ ] Test backup restoration
- [ ] Review and optimize queries
- [ ] Update documentation
- [ ] Security audit

## Emergency Contacts

- **Supabase Support**: [support.supabase.com](https://support.supabase.com)
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **Documentation**: [supabase.com/docs](https://supabase.com/docs)

## Notes

- Keep service role key secret - never commit to git
- Regular backups are essential
- Monitor database size and performance
- Update Supabase client libraries regularly
- Review RLS policies periodically

---

**Deployment Complete! 🎉**

Your application is now running on Supabase PostgreSQL with full production readiness.
