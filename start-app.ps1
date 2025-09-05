# 🎧 Audiophile App Startup Script for Windows
# This script starts both frontend and backend servers

Write-Host "🎧 Starting Audiophile E-commerce Application..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Kill any existing processes on ports 3000 and 4200
Write-Host "🔄 Stopping any existing processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server*" } | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*ng serve*" } | Stop-Process -Force
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
$backendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    node server.js 
}
Set-Location ..

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server failed to start or health check failed" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

# Start frontend server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    ng serve --port 4200 
}

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

# Check if frontend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Frontend server is running on http://localhost:4200" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend server may still be starting..." -ForegroundColor Yellow
}

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
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
    exit 0
}

# Set up signal handlers
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

# Keep script running and show job status
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ One or more servers have failed. Stopping..." -ForegroundColor Red
            Cleanup
        }
    }
} catch {
    Cleanup
}
