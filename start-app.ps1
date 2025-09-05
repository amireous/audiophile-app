# 🎧 Audiophile App Startup Script for Windows PowerShell
Write-Host "🎧 Starting Audiophile E-commerce Application..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any existing processes on ports 3000 and 4200
Write-Host "🔄 Stopping any existing processes..." -ForegroundColor Yellow
try {
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
} catch {
    # Ignore errors if no processes found
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Set-Location backend
$backendProcess = Start-Process -FilePath "node" -ArgumentList "simple-server.js" -PassThru -WindowStyle Normal
Set-Location ..

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server failed to start or health check failed" -ForegroundColor Red
    Write-Host "Please check the backend window for error messages." -ForegroundColor Yellow
}

# Start frontend server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "ng" -ArgumentList "serve", "--port", "4200" -PassThru -WindowStyle Normal

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 Application is starting up!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "🔧 Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "👨‍💼 Admin Dashboard: http://localhost:4200/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin1234" -ForegroundColor White
Write-Host ""
Write-Host "📚 API Documentation: API_Documentation.md" -ForegroundColor White
Write-Host "🧪 Postman Collection: Audiophile_API_Postman_Collection.json" -ForegroundColor White
Write-Host ""
Write-Host "Both servers are running in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit this script (servers will continue running)"
