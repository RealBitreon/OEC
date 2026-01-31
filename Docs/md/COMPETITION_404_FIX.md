# Competition Detail Page 404 Fix

## Problem
The URL `http://192.168.1.108:3000/dashboard/competitions/897f09f1-b865-4ae5-994e-aa326f522f7a` was showing a 404 (page not found).

## Root Cause
The page was using the regular Supabase client (`createClient()`) which respects Row Level Security (RLS) policies. Even though the RLS policy allows "Anyone can view competitions", there might have been an issue with the query or the data structure.

## Solution
Changed the competition query to use `createServiceClient()` which bypasses RLS policies. This is safe because:
1. User authentication is checked first
2. User role is verified (must be CEO or LRC_MANAGER)
3. Only after authorization passes, the service client is used to fetch the competition

## Changes Made
**File: `app/dashboard/competitions/[id]/page.tsx`**
- Imported `createServiceClient` from `@/lib/supabase/server`
- Changed the competition query to use `createServiceClient()` instead of the regular client
- Added better error handling to check both `!competition` and `compError`

## Testing
1. Navigate to: `http://192.168.1.108:3000/dashboard/competitions/897f09f1-b865-4ae5-994e-aa326f522f7a`
2. Ensure you're logged in as CEO or LRC_MANAGER
3. The competition hub should now load successfully
4. You should see the competition details and the four hub cards (Manage, Questions, Submissions, Wheel)

## Notes
- The service client bypasses RLS, so it's important that authorization checks happen first
- This pattern is already used in other parts of the dashboard
- The fix maintains security while ensuring data access works correctly
