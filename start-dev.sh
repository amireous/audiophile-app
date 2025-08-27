#!/bin/bash

echo "Starting Audiophile App Development Environment..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Function to install backend dependencies
install_backend() {
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
}

# Function to install frontend dependencies
install_frontend() {
    echo "Installing frontend dependencies..."
    npm install
}

# Function to start backend
start_backend() {
    echo "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "Backend started with PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "Starting frontend server..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if backend dependencies exist
if [ ! -d "backend/node_modules" ]; then
    echo "Backend dependencies not found. Installing..."
    install_backend
fi

# Check if frontend dependencies exist
if [ ! -d "node_modules" ]; then
    echo "Frontend dependencies not found. Installing..."
    install_frontend
fi

# Start servers
start_backend
sleep 3  # Wait for backend to start
start_frontend

echo ""
echo "Development environment started!"
echo "Frontend: http://localhost:4200"
echo "Backend:  http://localhost:3000"
echo "Admin Dashboard: http://localhost:4200/admin"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin1234"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
