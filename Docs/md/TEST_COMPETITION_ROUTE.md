# Test Competition Route

## Steps to Test

1. **Go to Dashboard**
   - Navigate to `http://localhost:3000/dashboard`
   - Login if needed (yussef@local.app)

2. **Go to Competitions**
   - Click "إدارة المسابقات" in sidebar
   - OR navigate directly to `http://localhost:3000/dashboard/competitions`

3. **Click "عرض المسابقة"**
   - Find a competition card
   - Click the blue "عرض المسابقة" button
   - Should navigate to `/dashboard/competitions/[id]`

4. **Check Console Logs**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to see the request

5. **Check Terminal Output**
   - Look for console.log messages:
     - "Profile data: ..."
     - "Profile error: ..."
     - "Competition data: ..."
     - "Competition error: ..."

## Expected Behavior

✅ Should navigate to Competition Hub page
✅ Should show 4 action cards
✅ Should display competition details

## If It Redirects Back

Check terminal for these messages:
- "No profile found for user: ..." → Profile issue
- "Insufficient role: ..." → Role issue
- "Competition not found: ..." → Competition ID issue

## Common Issues

### Issue 1: Params not awaited
**Fixed** - All pages now use `await params`

### Issue 2: Profile role mismatch
**Check** - Profile should have role 'CEO' or 'LRC_MANAGER'

### Issue 3: Competition not found
**Check** - Competition ID in URL matches database

## Direct Test URLs

If you have a competition with ID `abc123`, try:
- `http://localhost:3000/dashboard/competitions/abc123`

This will bypass the button click and test the route directly.

## Debug Commands

```bash
# Check if competition exists in database
# In Supabase SQL Editor:
SELECT id, title, status FROM competitions LIMIT 5;

# Check profile role
SELECT id, username, role FROM profiles WHERE username = 'yussef';
```
