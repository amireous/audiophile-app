# 🎧 Audiophile E-commerce Application

A full-stack e-commerce application built with Angular 12 frontend and Node.js backend, featuring comprehensive admin management capabilities.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Angular CLI** (v12 or higher)

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd audiophile-app
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

## 🏃‍♂️ Running the Project

### Option 1: Manual Start (Recommended for Development)

#### Step 1: Start the Backend Server
```bash
# Terminal 1 - Start Backend
cd backend
node server.js
```

**Expected Output:**
```
Server running on port 3000
Health check: http://localhost:3000/api/health
API root: http://localhost:3000/api
Default admin user: admin / admin1234
```

#### Step 2: Start the Frontend Server
```bash
# Terminal 2 - Start Frontend
ng serve --port 4200
```

**Expected Output:**
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200
```

### Option 2: Automated Start Script

If you have the `start-dev.sh` script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🌐 Access URLs

### Frontend Application
- **Main App**: http://localhost:4200
- **Admin Dashboard**: http://localhost:4200/admin/login

### Backend API
- **API Root**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: See `API_Documentation.md`

## 🔐 Default Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin1234`
- **Role**: Administrator

## 📋 Available Features

### 🛍️ Customer Features
- Browse products by category
- View product details
- Shopping cart functionality
- Order management
- User authentication

### ⚙️ Admin Features
- **Product Management**: Create, read, update, delete products
- **Category Management**: Manage product categories
- **Order Management**: View and update order statuses
- **User Management**: Admin user authentication

## 🧪 Testing the Application

### 1. Test Backend API
```bash
# Health check
curl http://localhost:3000/api/health

# Get all products
curl http://localhost:3000/api/products

# Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}'
```

### 2. Test Frontend
1. Open http://localhost:4200 in your browser
2. Navigate to http://localhost:4200/admin/login
3. Login with admin credentials
4. Test admin dashboard features

### 3. Test with Postman
1. Import `Audiophile_API_Postman_Collection.json` into Postman
2. Set collection variables:
   - `base_url`: http://localhost:3000
3. Start with "Health Check" request
4. Run "Login" request to get tokens
5. Test other endpoints

## 📁 Project Structure

```
audiophile-app/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── modules/
│   │   │   ├── admin/            # Admin dashboard
│   │   │   ├── main/             # Main app
│   │   │   └── authenticate/     # Authentication
│   │   ├── services/             # API services
│   │   └── guards/               # Route guards
│   └── assets/                   # Static assets
├── backend/                      # Node.js backend
│   ├── server.js                 # Main server file
│   └── package.json
├── Audiophile_API_Postman_Collection.json
├── API_Documentation.md
└── README.md
```

## 🔧 Configuration

### Backend Configuration
The backend uses in-memory storage for simplicity. Key configurations:
- **Port**: 3000
- **JWT Secret**: `your-secret-key`
- **Token Expiry**: 15 minutes (access), 7 days (refresh)

### Frontend Configuration
- **Port**: 4200
- **API URL**: http://localhost:3000/api
- **Angular Version**: 12.2.18

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on ports 3000 and 4200
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:4200 | xargs kill -9
```

#### 2. Angular Material Errors
```bash
# Reinstall Angular Material
npm install @angular/material@12.2.13
```

#### 3. Backend Not Starting
```bash
# Check if dependencies are installed
cd backend
npm install
node server.js
```

#### 4. Frontend Compilation Errors
```bash
# Clear Angular cache
rm -rf node_modules/.cache
ng serve --port 4200
```

### Check Server Status
```bash
# Check if servers are running
ps aux | grep -E "(ng serve|node.*server)" | grep -v grep
```

## 📚 API Documentation

For detailed API documentation, see:
- **Postman Collection**: `Audiophile_API_Postman_Collection.json`
- **API Documentation**: `API_Documentation.md`

## 🚀 Deployment

### Development
- Backend: `node server.js` (in-memory storage)
- Frontend: `ng serve` (development server)

### Production (Future)
- Backend: Use PM2 or Docker
- Frontend: `ng build --prod`
- Database: Replace in-memory with persistent storage

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Check browser console for errors

## 🎯 Next Steps

1. **Test all features** using the admin dashboard
2. **Explore the API** using Postman collection
3. **Customize the application** as needed
4. **Add more features** like user registration, payment processing, etc.

---

**Happy Coding! 🎉**
