# 🔧 Build Error Fixes - Quick Reference

## 🎯 How to Use This Guide

1. Run `npm run build` locally
2. Find the error message
3. Search for the error in this document
4. Apply the fix
5. Run `npm run build` again

---

## ❌ ERROR: "cookies() expects to be called within a request scope"

### Cause
Calling `cookies()` at module top-level or during build time.

### Fix
Ensure `createClient()` is only called inside async functions:

**❌ WRONG:**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient() // ❌ Top-level call

export default function Page() {
  // ...
}
```

**✅ CORRECT:**
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient() // ✅ Inside async function
  // ...
}
```

### Files to Check
- All page.tsx files
- All layout.tsx files
- Server actions (files with 'use server')

---

## ❌ ERROR: "NEXT_PUBLIC_SUPABASE_URL is not defined"

### Cause
Missing environment variables.

### Fix

1. **Local Development:**
   - Check `.env` file exists
   - Verify all required vars are present
   - No spaces around `=` (use `VAR=value` not `VAR = value`)

2. **Vercel Deployment:**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add all 6 required variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     NEXT_PUBLIC_APP_URL
     CEO_ROLE_CODE
     MANAGER_ROLE_CODE
     ```
   - Select: Production, Preview, Development
   - Click "Save"
   - Redeploy

---

## ❌ ERROR: "Module not found: Can't resolve '@/...'"

### Cause
Path alias not configured correctly.

### Fix

Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Check `next.config.js` (if using Turbopack):
```javascript
module.exports = {
  turbopack: {
    resolveAlias: {
      '@': './',
    },
  },
}
```

---

## ❌ ERROR: "Type error: Property 'X' does not exist on type 'Y'"

### Cause
TypeScript type mismatch.

### Quick Fix (Temporary)
Add `// @ts-ignore` above the error line:
```typescript
// @ts-ignore
const value = object.propertyThatDoesntExist
```

### Proper Fix
Add proper types:
```typescript
interface MyType {
  propertyThatDoesntExist?: string
}

const object: MyType = { /* ... */ }
const value = object.propertyThatDoesntExist
```

---

## ❌ ERROR: "Error: Invalid src prop"

### Cause
Using external images without configuring Next.js.

### Fix

Add to `next.config.js`:
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
    ],
  },
}
```

---

## ❌ ERROR: "Cannot read properties of undefined (reading 'X')"

### Cause
Accessing property on undefined/null value.

### Fix

Add null checks:

**❌ WRONG:**
```typescript
const name = user.profile.name // ❌ user might be null
```

**✅ CORRECT:**
```typescript
const name = user?.profile?.name ?? 'Unknown' // ✅ Safe access
```

---

## ❌ ERROR: "Hydration failed because the initial UI does not match"

### Cause
Server-rendered HTML differs from client-rendered HTML.

### Common Causes & Fixes

1. **Using `window` or `document` in Server Components:**
   ```typescript
   // ❌ WRONG
   const width = window.innerWidth
   
   // ✅ CORRECT - Add 'use client'
   'use client'
   const width = window.innerWidth
   ```

2. **Date/Time rendering:**
   ```typescript
   // ❌ WRONG - Different on server/client
   <div>{new Date().toLocaleString()}</div>
   
   // ✅ CORRECT - Use suppressHydrationWarning
   <div suppressHydrationWarning>
     {new Date().toLocaleString()}
   </div>
   ```

3. **Random values:**
   ```typescript
   // ❌ WRONG
   <div>{Math.random()}</div>
   
   // ✅ CORRECT - Use state
   'use client'
   const [random] = useState(() => Math.random())
   <div>{random}</div>
   ```

---

## ❌ ERROR: "Error: Invariant: cookies() expects to have requestAsyncStorage"

### Cause
Using `cookies()` in wrong context.

### Fix

Only use `cookies()` in:
- Server Components (async functions)
- Server Actions ('use server')
- Route Handlers (API routes)

**❌ WRONG:**
```typescript
// In a client component
'use client'
import { cookies } from 'next/headers'
const cookieStore = cookies() // ❌ Can't use in client
```

**✅ CORRECT:**
```typescript
// In a server component
export default async function Page() {
  const cookieStore = await cookies() // ✅ Correct
}
```

---

## ❌ ERROR: "Failed to compile - ./app/..."

### Cause
Syntax error in code.

### Fix

1. Read the full error message
2. Go to the file and line number mentioned
3. Check for:
   - Missing semicolons
   - Unclosed brackets `{ } [ ] ( )`
   - Missing imports
   - Typos in variable names

---

## ❌ ERROR: "Error: Route "/..." used `redirect()` outside of a Server Action"

### Cause
Using `redirect()` in wrong place.

### Fix

**❌ WRONG:**
```typescript
// In a client component
'use client'
import { redirect } from 'next/navigation'

function handleClick() {
  redirect('/dashboard') // ❌ Wrong
}
```

**✅ CORRECT Option 1 - Use router:**
```typescript
'use client'
import { useRouter } from 'next/navigation'

function Component() {
  const router = useRouter()
  
  function handleClick() {
    router.push('/dashboard') // ✅ Correct
  }
}
```

**✅ CORRECT Option 2 - Server Action:**
```typescript
// actions.ts
'use server'
import { redirect } from 'next/navigation'

export async function navigateToDashboard() {
  redirect('/dashboard') // ✅ Correct in server action
}

// Component.tsx
'use client'
import { navigateToDashboard } from './actions'

function Component() {
  async function handleClick() {
    await navigateToDashboard()
  }
}
```

---

## ❌ ERROR: "Error: Dynamic server usage"

### Cause
Using dynamic functions in static pages.

### Fix

Add to page:
```typescript
export const dynamic = 'force-dynamic'
```

Or make the page static:
```typescript
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour
```

---

## ❌ ERROR: "Cannot find module 'X' or its corresponding type declarations"

### Cause
Missing dependency or type definitions.

### Fix

1. **Install missing package:**
   ```bash
   npm install X
   ```

2. **Install type definitions:**
   ```bash
   npm install --save-dev @types/X
   ```

3. **If types don't exist, create declaration:**
   ```typescript
   // types/X.d.ts
   declare module 'X' {
     const content: any
     export default content
   }
   ```

---

## ❌ ERROR: "Error: ENOENT: no such file or directory"

### Cause
Trying to read a file that doesn't exist.

### Fix

1. **Check file path is correct**
2. **Add file existence check:**
   ```typescript
   import fs from 'fs'
   
   if (fs.existsSync(filePath)) {
     const content = fs.readFileSync(filePath, 'utf8')
   }
   ```

3. **Use try-catch:**
   ```typescript
   try {
     const content = fs.readFileSync(filePath, 'utf8')
   } catch (error) {
     console.error('File not found:', filePath)
   }
   ```

---

## ❌ ERROR: "Error: Postgres error code 42703: column does not exist"

### Cause
Database schema mismatch.

### Fix

Run the missing SQL migration in Supabase:

1. Go to Supabase Dashboard > SQL Editor
2. Run the appropriate migration:

**For `is_winner` column:**
```sql
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_submissions_is_winner 
ON submissions(is_winner) WHERE is_winner = true;
```

**For `end_at` vs `end_date`:**
```sql
-- If you have end_date, rename it
ALTER TABLE competitions 
RENAME COLUMN end_date TO end_at;

-- Or add end_at if missing
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
```

---

## 🔍 DEBUGGING STEPS

### Step 1: Clean Build
```bash
# Windows
npm run clean
npm install
npm run build

# Mac/Linux
rm -rf .next node_modules
npm install
npm run build
```

### Step 2: Check Environment
```bash
node verify-build.js
```

### Step 3: Enable Verbose Logging
```bash
# Add to next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

### Step 4: Check Vercel Logs
1. Go to Vercel Dashboard
2. Click on failed deployment
3. Click "View Build Logs"
4. Find first ERROR line
5. Copy full error message

---

## 📞 STILL STUCK?

If none of these fixes work:

1. **Copy the FULL error message**
2. **Note which file it mentions**
3. **Check if error happens locally:**
   ```bash
   npm run build
   ```
4. **If only fails on Vercel:**
   - Check env vars in Vercel Dashboard
   - Verify Node.js version (use 20.x)
   - Check build logs for clues

---

## ✅ PREVENTION CHECKLIST

Before every deployment:

- [ ] Run `npm run verify-build`
- [ ] Run `npm run build` locally
- [ ] Check all env vars are set
- [ ] Test critical pages work
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

**Last Updated:** 2026-01-31
