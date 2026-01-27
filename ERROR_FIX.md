# 🔧 Error Fix: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Error**: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`  
**Cause**: Clerk API is returning HTML error pages instead of JSON  
**Reason**: Invalid or expired Clerk credentials

---

## 🎯 SOLUTION

### Option 1: Get New Clerk Credentials (Recommended)

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign in or create account

2. **Create New Application**
   - Click "Add application"
   - Name: "Omani Encyclopedia Competition"
   - Select "Username" as authentication method
   - Click "Create application"

3. **Copy API Keys**
   - Go to "API Keys" section
   - Copy "Publishable key" (starts with `pk_test_`)
   - Copy "Secret key" (starts with `sk_test_`)

4. **Update .env File**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_NEW_KEY_HERE
   CLERK_SECRET_KEY=sk_test_YOUR_NEW_KEY_HERE
   ```

5. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   # Clear Next.js cache
   npm run clean
   # Start fresh
   npm run dev
   ```

---

### Option 2: Disable Clerk Temporarily (Quick Fix)

If you just want to see the UI without authentication:

1. **Comment out ClerkProvider in layout**
   
   Edit `app/layout.tsx`:
   ```tsx
   export default async function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       // <ClerkProvider localization={arSA}>
         <html lang="ar" dir="rtl">
           <body className="overflow-x-hidden">
             <ToastProvider>
               {children}
             </ToastProvider>
           </body>
         </html>
       // </ClerkProvider>
     )
   }
   ```

2. **Disable middleware**
   
   Rename `middleware.ts` to `middleware.ts.disabled`

3. **Restart server**
   ```bash
   npm run clean
   npm run dev
   ```

**Note**: This will disable authentication completely. Dashboard and protected routes will be accessible to everyone.

---

### Option 3: Use Mock Auth (Development Only)

Create a mock auth system for development:

1. **Create mock auth file**
   
   `lib/auth/mock.ts`:
   ```typescript
   export async function getMockSession() {
     return {
       id: 'mock-user-1',
       clerkId: 'mock-clerk-1',
       username: 'test-user',
       email: 'test@example.com',
       role: 'ceo' as const,
       displayName: 'Test User',
     }
   }
   ```

2. **Update auth/clerk.ts to use mock**
   ```typescript
   import { getMockSession } from './mock'
   
   export async function getClerkSession() {
     // Use mock in development
     if (process.env.NODE_ENV === 'development') {
       return getMockSession()
     }
     // ... rest of code
   }
   ```

---

## 🔍 DIAGNOSIS

### Check Current Clerk Status

1. **Check environment variables**
   ```bash
   # In PowerShell
   Get-Content .env | Select-String "CLERK"
   ```

2. **Verify keys are not placeholders**
   - ❌ BAD: `pk_test_your_key_here`
   - ✅ GOOD: `pk_test_d2VsY29tZS1tb2xsdXNrLTI2...`

3. **Test Clerk API**
   - Open browser console
   - Look for failed requests to `clerk.com` or `clerk.accounts.dev`
   - Check if they return 401/403 errors

---

## 🚨 COMMON ISSUES

### Issue 1: Old Clerk App Deleted
**Symptom**: Keys exist but return errors  
**Solution**: Create new Clerk app (Option 1)

### Issue 2: Expired Keys
**Symptom**: Keys worked before but not now  
**Solution**: Regenerate keys in Clerk dashboard

### Issue 3: Wrong Environment
**Symptom**: Production keys in development  
**Solution**: Use test keys (start with `pk_test_`)

### Issue 4: Cached Credentials
**Symptom**: Updated keys but still errors  
**Solution**: Clear cache and restart
```bash
npm run clean
rm -rf .next
npm run dev
```

---

## ✅ VERIFICATION

After applying fix, verify:

1. **No console errors**
   - Open browser console (F12)
   - Should see no red errors
   - No "Unexpected token" errors

2. **Clerk loads**
   - Visit `/sign-in`
   - Should see Clerk sign-in form
   - Not an error page

3. **Can navigate**
   - Visit `/`
   - Click links
   - No crashes

---

## 🎯 RECOMMENDED APPROACH

**For Quick Testing** (5 minutes):
→ Use Option 2 (Disable Clerk)

**For Full Testing** (15 minutes):
→ Use Option 1 (New Clerk App)

**For Development** (10 minutes):
→ Use Option 3 (Mock Auth)

---

## 📝 CURRENT STATUS

Based on your `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2VsY29tZS1tb2xsdXNrLTI2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_aOo2PGcv2ICiU6MmnOPamuAXH64pkdqwCq83Alhm55
```

**Analysis**:
- ✅ Keys are not placeholders
- ⚠️ Keys might be from old/deleted Clerk app
- ⚠️ Keys might be expired

**Recommendation**: Create new Clerk app (Option 1)

---

## 🔄 RESTART CHECKLIST

After any fix:

1. ✅ Stop dev server (Ctrl+C)
2. ✅ Clear Next.js cache: `npm run clean`
3. ✅ Delete `.next` folder (optional)
4. ✅ Start dev server: `npm run dev`
5. ✅ Hard refresh browser (Ctrl+Shift+R)
6. ✅ Check console for errors

---

## 💡 PREVENTION

To avoid this in future:

1. **Use environment-specific keys**
   - Development: `pk_test_...`
   - Production: `pk_live_...`

2. **Document Clerk app**
   - Note which Clerk app is used
   - Save app URL in README

3. **Test after setup**
   - Verify sign-in works
   - Test protected routes

4. **Keep keys updated**
   - Regenerate if app deleted
   - Update in all environments

---

## 🆘 STILL NOT WORKING?

If error persists after trying all options:

1. **Check Clerk Status**
   - Visit: https://status.clerk.com
   - Verify no outages

2. **Check Network**
   - Disable VPN
   - Check firewall
   - Try different network

3. **Check Browser**
   - Clear browser cache
   - Try incognito mode
   - Try different browser

4. **Check Logs**
   - Terminal output
   - Browser console
   - Network tab (F12)

5. **Last Resort**
   - Delete `node_modules`
   - Delete `.next`
   - Run `npm install`
   - Run `npm run dev`

---

## 📞 SUPPORT

If you need help:

1. Check Clerk docs: https://clerk.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Check this project's docs:
   - `QA_REPORT.md`
   - `FINAL_QA_CHECKLIST.md`
   - `FIXES_APPLIED.md`

---

**Last Updated**: January 27, 2026  
**Status**: Middleware updated with error handling  
**Next Step**: Choose one of the 3 options above
