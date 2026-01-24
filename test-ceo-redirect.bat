@echo off
echo ========================================
echo CEO Dashboard Redirect Test
echo ========================================
echo.

echo Checking if Next.js dev server is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Next.js dev server is not running!
    echo Please start it with: npm run dev
    echo.
    pause
    exit /b 1
)

echo [OK] Dev server is running
echo.

echo Testing routes...
echo.

echo 1. Testing /dashboard route...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/dashboard
echo.

echo 2. Testing /ceo route...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/ceo
echo.

echo 3. Testing /manager route...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/manager
echo.

echo 4. Testing /sign-in route...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/sign-in
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo Expected results:
echo - /dashboard: 307 (redirect) or 200 (OK)
echo - /ceo: 307 (redirect to sign-in if not logged in)
echo - /manager: 307 (redirect to sign-in if not logged in)
echo - /sign-in: 200 (OK)
echo.
echo Next steps:
echo 1. Login as CEO user
echo 2. Verify redirect to /ceo works
echo 3. Check console for any errors
echo.
pause
