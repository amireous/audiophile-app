# 🚀 Quick Start Guide

## ⚡ Fastest Way to Run

```bash
# Make script executable (first time only)
chmod +x start-project.sh

# Run the entire application
./start-project.sh
```

## 🔧 Manual Start

### Terminal 1 - Backend
```bash
cd backend
node server.js
```

### Terminal 2 - Frontend
```bash
ng serve --port 4200
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | Main application |
| **Admin Login** | http://localhost:4200/admin/login | Admin dashboard login |
| **Backend API** | http://localhost:3000/api | API root |
| **Health Check** | http://localhost:3000/api/health | Backend status |

## 🔐 Admin Login

- **Username**: `admin`
- **Password**: `admin1234`

## 🧪 Quick Test

```bash
# Test backend
curl http://localhost:3000/api/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}'
```

## 🛑 Stop Servers

```bash
# Kill all processes
pkill -f "ng serve"
pkill -f "node.*server"

# Or use Ctrl+C if using start script
```

## 📚 More Info

- **Full Documentation**: `README.md`
- **API Documentation**: `API_Documentation.md`
- **Postman Collection**: `Audiophile_API_Postman_Collection.json`
