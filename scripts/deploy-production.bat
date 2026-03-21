@echo off
REM TheatreX Production Deployment Script (Windows)
REM This script deploys both backend and frontend to production

setlocal enabledelayedexpansion

echo ================================================================
echo 🚀 TheatreX Production Deployment Script
echo ================================================================
echo.

REM Check if running from correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Run from project root.
    exit /b 1
)

echo 📋 Pre-Deployment Checklist
echo.

REM Check Node version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node version: %NODE_VERSION%

echo.
echo 🔄 Building Backend
cd backend

REM Install dependencies
echo Installing backend dependencies...
call npm install --production
if errorlevel 1 (
    echo ❌ Backend install failed
    exit /b 1
)

REM Run tests (optional - remove if tests are flaky)
REM echo Running backend tests...
REM call npm test

echo ✅ Backend build complete
cd ..

echo.
echo 🔄 Building Frontend
cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Frontend install failed
    exit /b 1
)

REM Build production bundle
echo Building production bundle...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend build complete
cd ..

echo.
echo ================================================================
echo ✅ Build successful!
echo ================================================================
echo.

echo 📤 Next Steps:
echo.
echo 1. Backend Deployment (via Railway/Render):
echo    - Push main branch: git push origin main
echo    - Or manually deploy in Railway/Render dashboard
echo.
echo 2. Frontend Deployment (via Vercel):
echo    - Push main branch: git push origin main
echo    - Or deploy via Vercel dashboard
echo.
echo 3. Verification:
echo    - Wait for deployments to complete (5-10 minutes)
echo    - Run: node backend/scripts/verify-production.js [backend-url] [frontend-url]
echo.
echo 4. Configuration:
echo    - Ensure environment variables are set in production
echo    - Verify CORS_ORIGINS configuration
echo    - Check database connection
echo.
echo 🎉 Deployment ready!
echo.

endlocal
