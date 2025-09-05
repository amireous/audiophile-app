@echo off
echo 🎧 Starting Audiophile E-commerce Application...
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Kill any existing processes on ports 3000 and 4200
echo 🔄 Stopping any existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do taskkill /f /pid %%a >nul 2>&1

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "node simple-server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🚀 Starting frontend server...
start "Frontend Server" cmd /k "ng serve --port 4200"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Application is starting up!
echo ================================================
echo 📱 Frontend: http://localhost:4200
echo 🔧 Backend API: http://localhost:3000/api
echo 👨‍💼 Admin Dashboard: http://localhost:4200/admin/login
echo.
echo 🔐 Admin Credentials:
echo    Username: admin
echo    Password: admin1234
echo.
echo 📚 API Documentation: API_Documentation.md
echo 🧪 Postman Collection: Audiophile_API_Postman_Collection.json
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
