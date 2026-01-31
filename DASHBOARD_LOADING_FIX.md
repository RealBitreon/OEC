# Dashboard Loading Fix

## Problem
After successful login, the dashboard page redirects to `/dashboard` but gets stuck on infinite loading.

## Root Causes

1. **Data Structure Mismatch**: The session API was returning field names (`auth_id`, `created_at`, `updated_at`) that didn't match the `User` interface expected by `AuthProvider` (`id`, `username`, `email`, `role`, `createdAt`).

2. **Profile Fetch Error Handling**: The dashboard layout wasn't properly handling cases where the user profile couldn't be fetched from the database.

3. **Unused Loading State**: The `DashboardContent` component was destructuring `loading` and `error` from `useAuth()` but not using them, causing confusion.

## Fixes Applied

### 1. Fixed Session API Response (`app/api/session/route.ts`)
```typescript
// Before: Returned snake_case fields
return NextResponse.json({
  user: {
    id: profile.id,
    auth_id: profile.auth_id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    created_at: profile.created_at,
    updated_at: profile.updated_at
  }
});

// After: Returns camelCase fields matching User interface
return NextResponse.json({
  user: {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at
  }
});
```

### 2. Fixed Dashboard Layout (`app/dashboard/layout.tsx`)
```typescript
// Before: Could pass null userProfile
const userProfile = profile ? {
  id: profile.id,
  username: profile.username,
  email: profile.email,
  role: profile.role,
  createdAt: profile.created_at
} : null

// After: Redirects to login if profile not found
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('id, username, email, role, created_at')
  .eq('auth_id', user.id)
  .single()

if (profileError || !profile) {
  console.error('Profile not found for user:', user.id, profileError)
  redirect('/login')
}

const userProfile = {
  id: profile.id,
  username: profile.username,
  email: profile.email || undefined,
  role: profile.role as 'CEO' | 'LRC_MANAGER',
  createdAt: profile.created_at
}
```

### 3. Cleaned Up DashboardContent (`app/dashboard/components/DashboardShell.tsx`)
```typescript
// Before: Destructured but didn't use loading/error
const { user: profile, loading, error } = useAuth()

// After: Only get what we need
const { user: profile } = useAuth()
```

### 4. Added Debug Logging
Added console.log statements to track the flow:
- `[AuthProvider]` logs initialization and fetch status
- `[DashboardShell]` logs when rendering with initialUser
- `[DashboardContent]` logs when rendering with profile

## Testing

1. Clear browser cache and cookies
2. Login with valid credentials
3. Check browser console for debug logs:
   - Should see `[DashboardShell] Rendering with initialUser: <username>`
   - Should see `[AuthProvider] Initialized with: { hasInitialUser: true, ... }`
   - Should see `[DashboardContent] Rendering with profile: <username>`
4. Dashboard should render immediately without loading state

## Expected Behavior

- After login, user is redirected to `/dashboard`
- Dashboard layout fetches user profile from database
- Profile is passed as `initialUser` to `DashboardShell`
- `AuthProvider` uses `initialUser` and skips API fetch
- `DashboardContent` renders immediately with profile data
- No infinite loading, no stuck state

## Notes

- The WebSocket errors in console are just HMR (Hot Module Replacement) warnings and don't affect functionality
- Auth is checked at the layout level, so components can assume user is authenticated
- The `AuthProvider` only fetches session once per app lifecycle to prevent request flooding
