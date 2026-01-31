@echo off
REM Quick Fix Script for Common Build Issues
REM Run this if build fails

echo ========================================
echo Quick Fix for Vercel Build Issues
echo ========================================
echo.

echo [1/5] Cleaning build cache...
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo
echo Done!
echo.

echo [2/5] Verifying environment variables...
node verify-build.js
if errorlevel 1 (
    echo.
    echo ERROR: Environment verification failed!
    echo Fix the issues above before continuing.
    pause
    exit /b 1
)
echo.

echo [3/5] Reinstalling dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Running build...
call npm run build
if errorlevel 1 (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Check the error message above.
    echo Common fixes:
    echo - Fix TypeScript errors
    echo - Add missing environment variables
    echo - Check for syntax errors
    echo.
    echo See BUILD_ERROR_FIXES.md for detailed solutions.
    pause
    exit /b 1
)
echo.

echo [5/5] Build successful!
echo.
echo ========================================
echo SUCCESS! Ready to deploy to Vercel
echo ========================================
echo.
echo Next steps:
echo 1. Add environment variables to Vercel Dashboard
echo 2. Push to GitHub (Vercel will auto-deploy)
echo 3. Or run: vercel --prod
echo.
echo See VERCEL_DEPLOYMENT_CHECKLIST.md for details.
pause
