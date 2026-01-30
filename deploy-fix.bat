@echo off
echo ========================================
echo Deploying Vercel Fixes + Analytics
echo ========================================
echo.

echo Adding files to git...
git add .

echo.
echo Committing changes...
git commit -m "fix: Add favicon, error handling, and Vercel analytics"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo CRITICAL: You MUST add environment variables to Vercel!
echo.
echo Follow these steps:
echo 1. Open: FIX_VERCEL_NOW.md
echo 2. Follow Step 1: Get Supabase credentials
echo 3. Follow Step 2: Add 6 variables to Vercel
echo 4. Follow Step 3: Redeploy from Vercel Dashboard
echo 5. Follow Step 4: Test at https://msoec.vercel.app
echo.
echo Without environment variables, the site will NOT work!
echo.
pause
