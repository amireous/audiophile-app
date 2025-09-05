#!/bin/bash

echo "🎧 Starting Audiophile E-commerce Application..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "❌ Angular CLI is not installed. Installing..."
    npm install -g @angular/cli@12
fi

# Kill any existing processes on ports 3000 and 4200
echo "🔄 Stopping any existing processes..."
pkill -f "node.*server" 2>/dev/null
pkill -f "ng serve" 2>/dev/null

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Start backend server
echo "🚀 Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:3000"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "🚀 Starting frontend server..."
ng serve --port 4200 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if curl -s http://localhost:4200 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:4200"
else
    echo "⚠️  Frontend server may still be starting..."
fi

echo ""
echo "🎉 Application is starting up!"
echo "================================================"
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend API: http://localhost:3000/api"
echo "👨‍💼 Admin Dashboard: http://localhost:4200/admin/login"
echo ""
echo "🔐 Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin1234"
echo ""
echo "📚 API Documentation: API_Documentation.md"
echo "🧪 Postman Collection: Audiophile_API_Postman_Collection.json"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "node.*server" 2>/dev/null
    pkill -f "ng serve" 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
