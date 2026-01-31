# Competition Display Fix - JSON Implementation

## Problem
The active competition was showing in the LRC Manager Dashboard but not on the homepage or wheel page.

## Root Cause
The application was using two different data sources:
- **Dashboard**: Reading directly from `data/competitions.json` 
- **Homepage & Wheel**: Using `competitionsRepo` which was returning Mock data (always null)

## Solution

### 1. Created JSON-based Competition Repository
Updated `lib/repos/index.ts` to use `JsonCompetitionsRepo` instead of Mock:

```typescript
class JsonCompetitionsRepo implements ICompetitionsRepo {
  // Reads from data/competitions.json
  // Transforms snake_case to camelCase
  // Handles missing slug field by generating from title
}
```

### 2. Created API Endpoints

#### `/api/competitions/active/route.ts`
Returns the active competition from JSON file:
```typescript
GET /api/competitions/active
Response: { competition: Competition | null }
```

#### `/api/wheel/public/route.ts`
Returns wheel run data for a competition:
```typescript
GET /api/wheel/public?competitionId=xxx
Response: { wheelRun: WheelRun | null }
```

### 3. Updated Competition Data
Added missing `slug` field to `data/competitions.json`:
```json
{
  "id": "897f09f1-b865-4ae5-994e-aa326f522f7a",
  "title": "DGV",
  "slug": "dgv",  // Added this
  "status": "active",
  ...
}
```

## Files Modified
- `lib/repos/index.ts` - Replaced Mock with JSON implementation
- `data/competitions.json` - Added slug field
- `app/api/competitions/active/route.ts` - New API endpoint
- `app/api/wheel/public/route.ts` - New API endpoint

## Testing
1. Start dev server: `npm run dev`
2. Visit homepage: `http://localhost:3000` - Should show active competition
3. Visit wheel page: `http://localhost:3000/wheel` - Should show competition info
4. Test API: `curl http://localhost:3000/api/competitions/active`

## Result
✅ Homepage now displays active competition with countdown
✅ Wheel page shows competition information
✅ All pages use the same data source (JSON files)
✅ Consistent behavior between dashboard and public pages

## Date
January 28, 2026
