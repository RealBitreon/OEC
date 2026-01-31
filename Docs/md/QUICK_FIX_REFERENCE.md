# Quick Fix Reference - Vercel Build Error

## Problem
```
Type error: Property 'ticketsPerCorrect' does not exist on type...
File: ./app/api/competition/submit/route.ts (line ~47)
```

## Root Cause
Schema mismatch: Database has `ticketsPerCorrect`, TypeScript expects `ticketsConfig.baseTickets`

## Solution Applied
✅ Added backward-compatible type guard
✅ Created `computeTickets()` helper supporting both schemas
✅ Handles early bonus tiers correctly
✅ No breaking changes

## Verification
```bash
npm run build          # ✓ PASSED
npx tsc --noEmit      # ✓ PASSED
```

## What Changed
**File:** `app/api/competition/submit/route.ts`

**Before:**
```typescript
ticketsEarned = rules.ticketsPerCorrect || 1  // ❌ Type error
```

**After:**
```typescript
const ticketsEarned = computeTickets(
  competition.rules,
  score,
  totalQuestions,
  submittedAt
)  // ✅ Type-safe, supports both schemas
```

## Deploy Status
🟢 **READY FOR PRODUCTION**

See `VERCEL_BUILD_FIX_SUMMARY.md` for complete details.
