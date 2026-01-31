# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Environment Variables

#### Issue: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Symptoms:**
- Console warning about missing URL
- Cannot connect to database
- Supabase client is null

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify content
cat .env

# Should have:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common Mistakes:**
- ❌ Trailing spaces in values
- ❌ Missing quotes (not needed for .env)
- ❌ Wrong variable names
- ❌ File named `.env.local` instead of `.env`

**Fix:**
1. Copy values from Supabase Dashboard → Settings → API
2. Paste exactly as shown (no quotes, no spaces)
3. Restart dev server: `npm run dev`

---

### 2. Database Migration

#### Issue: "relation 'users' does not exist"
**Symptoms:**
- Error when querying database
- Tables not found
- Migration didn't run

**Solution:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show 8 tables:
-- users, sessions, competitions, questions, submissions,
-- wheel_prizes, wheel_spins, audit_logs
```

**If tables missing:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire `supabase_complete_migration.sql`
3. Paste and click "Run"
4. Wait for success message
5. Verify tables created

---

### 3. Permission Errors

#### Issue: "permission denied for table users"
**Symptoms:**
- 403 Forbidden errors
- "new row violates row-level security policy"
- Cannot read/write data

**Solution:**

**Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Check policies exist:**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Common Causes:**
1. **Using anon key for admin operations**
   - Use service role key for admin ops
   - Check `createServiceClient()` is used

2. **Wrong role in RLS policy**
   - Verify user role in database
   - Check policy conditions

3. **Missing auth context**
   - Ensure user is authenticated
   - Check session is valid

**Fix:**
```typescript
// For admin operations, use service client
import { createServiceClient } from '@/lib/supabase/server'
const supabase = createServiceClient()

// For user operations, use regular client
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

---

### 4. Authentication Issues

#### Issue: "User not found" or "Invalid credentials"
**Symptoms:**
- Cannot login
- Session not persisting
- Logged out immediately

**Solution:**

**Check user exists:**
```sql
SELECT id, username, role FROM users;
```

**Check password hash:**
```sql
-- Passwords should be hashed (long strings)
SELECT username, LENGTH(password) as pwd_length FROM users;
-- Should be 64+ characters
```

**Check session:**
```sql
SELECT * FROM sessions WHERE expires_at > NOW();
```

**Common Issues:**
1. **Password not hashed**
   - Passwords must be hashed before storing
   - Use crypto.createHash('sha256')

2. **Session expired**
   - Check expires_at timestamp
   - Create new session on login

3. **Cookie not set**
   - Check browser cookies
   - Verify domain matches

**Fix:**
```typescript
// Hash password before storing
import crypto from 'crypto'
const hashedPassword = crypto
  .createHash('sha256')
  .update(password)
  .digest('hex')
```

---

### 5. Data Not Showing

#### Issue: "No data returned" or "Empty array"
**Symptoms:**
- Queries return empty results
- Data exists in database but not in app
- Filters not working

**Solution:**

**Check data exists:**
```sql
SELECT COUNT(*) FROM competitions;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM submissions;
```

**Check filters:**
```sql
-- Check active competition
SELECT * FROM competitions WHERE status = 'active';

-- Check active questions
SELECT * FROM questions WHERE is_active = true;
```

**Common Issues:**
1. **Wrong filter values**
   - Check status values match exactly
   - Case-sensitive comparisons

2. **RLS blocking data**
   - Check RLS policies
   - Verify user has permission

3. **Wrong foreign keys**
   - Check relationships
   - Verify IDs match

**Debug:**
```typescript
// Add logging
const { data, error } = await supabase
  .from('competitions')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)
```

---

### 6. JSONB Field Issues

#### Issue: "Cannot read property of undefined" with JSONB
**Symptoms:**
- Error accessing answers/options/rules
- JSONB fields are null
- Type errors with JSONB data

**Solution:**

**Check JSONB structure:**
```sql
-- View JSONB data
SELECT id, answers FROM submissions;
SELECT id, options FROM questions;
SELECT id, rules FROM competitions;
```

**Common Issues:**
1. **JSONB is null**
   - Set default value: `DEFAULT '{}'::jsonb`
   - Check insert includes JSONB field

2. **Wrong JSONB structure**
   - Validate JSON before insert
   - Use proper JSONB operators

3. **Type mismatch**
   - JSONB vs JSON vs TEXT
   - Cast properly: `::jsonb`

**Fix:**
```typescript
// Ensure JSONB is valid
const answers = submission.answers || {}
const options = question.options || []
const rules = competition.rules || { eligibilityMode: 'all_correct' }

// When inserting
const { data, error } = await supabase
  .from('submissions')
  .insert({
    answers: JSON.parse(answersString), // Parse if string
    // or
    answers: answersObject, // Direct if object
  })
```

---

### 7. Connection Issues

#### Issue: "Failed to fetch" or "Network error"
**Symptoms:**
- Cannot connect to Supabase
- Timeout errors
- CORS errors

**Solution:**

**Check Supabase status:**
- Visit: https://status.supabase.com
- Check your project isn't paused

**Check URL:**
```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/

# Should return API info
```

**Common Issues:**
1. **Project paused**
   - Free tier pauses after inactivity
   - Resume in dashboard

2. **Wrong URL**
   - Check NEXT_PUBLIC_SUPABASE_URL
   - Should end with .supabase.co

3. **Network firewall**
   - Check corporate firewall
   - Try different network

4. **CORS issues**
   - Check allowed origins in Supabase
   - Verify domain is whitelisted

---

### 8. Performance Issues

#### Issue: "Slow queries" or "Timeout"
**Symptoms:**
- Pages load slowly
- Database queries take long
- Timeout errors

**Solution:**

**Check query performance:**
```sql
-- Enable query timing
\timing

-- Run slow query
SELECT * FROM submissions WHERE competition_id = 'xxx';

-- Check if indexes are used
EXPLAIN ANALYZE 
SELECT * FROM submissions WHERE competition_id = 'xxx';
```

**Common Issues:**
1. **Missing indexes**
   - Check indexes exist
   - Add if needed

2. **Large result sets**
   - Add pagination
   - Limit results

3. **Complex joins**
   - Optimize query
   - Use views

**Fix:**
```typescript
// Add pagination
const { data, error } = await supabase
  .from('submissions')
  .select('*')
  .range(0, 9) // First 10 results
  .order('submitted_at', { ascending: false })

// Add specific columns
const { data, error } = await supabase
  .from('submissions')
  .select('id, participant_name, score, status')
  // Don't select large JSONB fields if not needed
```

---

### 9. TypeScript Errors

#### Issue: "Type 'X' is not assignable to type 'Y'"
**Symptoms:**
- TypeScript compilation errors
- Type mismatches
- Cannot build

**Solution:**

**Check type definitions:**
```typescript
// Ensure types match database schema
interface User {
  id: string
  username: string
  role: 'CEO' | 'LRC_MANAGER' | 'VIEWER'
  // ...
}
```

**Common Issues:**
1. **Database schema changed**
   - Update types in `lib/store/types.ts`
   - Regenerate types if using Supabase CLI

2. **Null values**
   - Add `| null` to types
   - Handle null cases

3. **JSONB types**
   - Use `any` or specific interface
   - Validate at runtime

**Fix:**
```typescript
// Handle nullable fields
const user = await usersRepo.getById(id)
if (!user) {
  throw new Error('User not found')
}

// Type JSONB properly
interface SubmissionAnswers {
  [questionId: string]: string
}

const answers: SubmissionAnswers = submission.answers
```

---

### 10. Build/Deploy Errors

#### Issue: "Build failed" or "Module not found"
**Symptoms:**
- npm run build fails
- Missing dependencies
- Import errors

**Solution:**

**Check dependencies:**
```bash
# Install all dependencies
npm install

# Check for missing packages
npm ls @supabase/supabase-js
npm ls @supabase/ssr
```

**Check imports:**
```typescript
// Correct imports
import { createClient } from '@/lib/supabase/server'
import { usersRepo } from '@/lib/repos'

// Not
import { createClient } from '@supabase/supabase-js' // Wrong
```

**Common Issues:**
1. **Missing dependencies**
   - Run `npm install`
   - Check package.json

2. **Wrong import paths**
   - Use `@/` for absolute imports
   - Check tsconfig.json paths

3. **Environment variables in build**
   - Set in hosting platform
   - Verify all required vars

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build
npm start
```

---

## Debugging Tools

### 1. Supabase Dashboard
- **SQL Editor**: Run queries directly
- **Table Editor**: View/edit data
- **API Logs**: See all requests
- **Database Logs**: See errors

### 2. Browser DevTools
- **Console**: Check for errors
- **Network**: See API calls
- **Application**: Check cookies/storage

### 3. Database Queries
```sql
-- Check table structure
\d users

-- Check indexes
\di

-- Check policies
\dp users

-- Check functions
\df

-- Check views
\dv
```

### 4. Application Logging
```typescript
// Add detailed logging
console.log('Fetching competition:', competitionId)
const { data, error } = await supabase
  .from('competitions')
  .select('*')
  .eq('id', competitionId)
  .single()

console.log('Result:', { data, error })
```

---

## Getting Help

### 1. Check Documentation
- **This guide**: TROUBLESHOOTING.md
- **Migration guide**: SUPABASE_MIGRATION_COMPLETE.md
- **Quick reference**: SUPABASE_QUICK_REFERENCE.md
- **Architecture**: ARCHITECTURE.md

### 2. Check Logs
- Supabase Dashboard → Logs
- Browser console
- Server logs (npm run dev output)

### 3. Test Queries
- Use Supabase SQL Editor
- Test with curl/Postman
- Check with psql

### 4. Community Resources
- Supabase Discord
- Supabase GitHub Discussions
- Stack Overflow

---

## Prevention Tips

1. **Always test locally first**
2. **Use version control (git)**
3. **Keep backups**
4. **Monitor logs regularly**
5. **Document changes**
6. **Test after each change**
7. **Use TypeScript strictly**
8. **Validate inputs**
9. **Handle errors properly**
10. **Keep dependencies updated**

---

**Most issues can be solved by:**
1. ✅ Checking environment variables
2. ✅ Verifying database migration ran
3. ✅ Checking RLS policies
4. ✅ Looking at error logs
5. ✅ Testing queries in SQL Editor

**Happy debugging! 🐛🔧**
