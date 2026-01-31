# Dashboard Sections Visibility Fix

## Problem
When clicking on sidebar menu items like "إدارة المسابقات" (Competitions Management), the content was not showing up. The sections were actually rendering, but they were invisible due to missing dark mode styling.

## Root Cause
The dashboard sections had:
- White backgrounds (`bg-white`)
- Dark text colors (`text-neutral-900`)

When the ThemeProvider applied dark mode, the backgrounds became dark but the text colors weren't updated, resulting in dark text on dark backgrounds - making everything invisible.

## Solution Applied

### 1. Sidebar Component (`app/dashboard/components/Sidebar.tsx`)
Added dark mode classes:
- `dark:bg-neutral-800` for sidebar background
- `dark:border-neutral-700` for borders
- `dark:text-white` for headings
- `dark:text-neutral-300` for menu items
- `dark:bg-blue-900/30` for active menu item background
- `dark:hover:bg-neutral-700` for hover states

### 2. Overview Section (`app/dashboard/components/sections/Overview.tsx`)
Added dark mode classes to:
- All card backgrounds: `dark:bg-neutral-800`
- All borders: `dark:border-neutral-700`
- All headings: `dark:text-white`
- All body text: `dark:text-neutral-400`
- All icon backgrounds: `dark:bg-{color}-900/30`

### 3. Competitions Management (`app/dashboard/components/sections/CompetitionsManagement.tsx`)
Added dark mode classes to:
- Loading states
- Empty states
- Competition cards
- Form inputs and labels
- Buttons hover states

### 4. Debug Logging
Added console.log in `DashboardShell.tsx` to track which section is being rendered:
```typescript
console.log('Rendering section:', activeSection)
```

## Testing
To verify the fix:
1. Navigate to `/dashboard`
2. Click on any sidebar menu item
3. Content should now be visible in both light and dark modes
4. Check browser console for "Rendering section: {section-name}" logs

## Remaining Work
Other section components may need similar dark mode updates:
- `QuestionsManagement.tsx`
- `Archives.tsx`
- `UsersManagement.tsx`
- `AuditLog.tsx`
- `Settings.tsx`
- `SubmissionsReview.tsx`
- `WheelManagement.tsx`

## Files Modified
1. `app/dashboard/components/Sidebar.tsx`
2. `app/dashboard/components/sections/Overview.tsx`
3. `app/dashboard/components/sections/CompetitionsManagement.tsx` (partial)
4. `app/dashboard/components/DashboardShell.tsx` (debug logging)
