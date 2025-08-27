# Audiophile Backend API

A Node.js Express TypeScript backend for the Audiophile e-commerce application with comprehensive admin management capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for products with category support
- **Category Management**: Manage product categories
- **Order Management**: Complete order lifecycle with cart functionality
- **Admin Dashboard**: Comprehensive admin interface for managing products, categories, and orders
- **SQLite Database**: Lightweight database for local development

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Upload**: multer

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

4. Seed the database (optional):
```bash
npm run seed
```

The server will start on `http://localhost:3000`

## Default Admin User

A default admin user is automatically created:
- **Username**: `admin`
- **Password**: `admin1234`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category with products

### Customer Endpoints (Authenticated)
- `POST /api/basket/add` - Add product to cart
- `GET /api/basket` - Get user's cart
- `DELETE /api/basket/:product_id` - Remove item from cart
- `POST /api/checkout` - Create order from cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order

### Admin Endpoints (Admin Only)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status

## Database Schema

### Users
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `email` (TEXT UNIQUE)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `profile_pic_url` (TEXT)
- `role` (TEXT - 'admin' or 'customer')
- `created_at` (DATETIME)

### Categories
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE)
- `description` (TEXT)
- `created_at` (DATETIME)

### Products
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `slug` (TEXT UNIQUE)
- `description` (TEXT)
- `image_url` (TEXT)
- `price` (DECIMAL)
- `currency` (TEXT)
- `is_new` (BOOLEAN)
- `features` (TEXT)
- `box_details` (TEXT)
- `category_id` (INTEGER - Foreign Key)
- `created_at` (DATETIME)

### Orders
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER - Foreign Key)
- `total_amount` (DECIMAL)
- `status` (TEXT - 'pending', 'shipped', 'delivered', 'cancelled')
- `shipping_address` (TEXT)
- `payment_method` (TEXT)
- `created_at` (DATETIME)

### Order Items
- `id` (INTEGER PRIMARY KEY)
- `order_id` (INTEGER - Foreign Key)
- `product_id` (INTEGER - Foreign Key)
- `quantity` (INTEGER)
- `price_at_purchase` (DECIMAL)

### Cart
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER - Foreign Key)
- `product_id` (INTEGER - Foreign Key)
- `quantity` (INTEGER)
- `created_at` (DATETIME)

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
DATABASE_PATH=./database.sqlite
UPLOAD_PATH=./uploads
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models and types
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Main server file
├── uploads/             # File upload directory
├── config.ts            # Configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with express-validator
- CORS configuration
- Helmet.js for security headers

## Testing

The API can be tested using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Production Deployment

For production deployment:
1. Change JWT secrets
2. Use a production database (PostgreSQL/MySQL)
3. Set up proper environment variables
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Set up proper logging and monitoring
