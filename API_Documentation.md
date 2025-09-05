# Audiophile API Documentation

## Overview
The Audiophile API is a RESTful API for the Audiophile E-commerce application. It provides endpoints for authentication, product management, category management, order processing, and admin functionality.

**Base URL**: `http://localhost:3000`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid access token in the Authorization header.

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin1234`

## API Endpoints

### Authentication

#### Login
**POST** `/api/auth/login`

Authenticate user and get access/refresh tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin1234"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@audiophile.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

#### Register
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Public Routes

#### Health Check
**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-31T08:22:53.060Z"
}
```

#### Get All Products
**GET** `/api/products`

Get list of all available products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "YX1 Wireless Earphones",
    "slug": "yx1-earphones",
    "description": "Tailor your listening experience...",
    "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
    "price": 599,
    "currency": "USD",
    "is_new": true,
    "category": {
      "id": 3,
      "name": "earphones",
      "description": "Wireless earphones for on-the-go listening"
    }
  }
]
```

#### Get Product by ID
**GET** `/api/products/:id`

Get detailed information about a specific product.

#### Get Product by Slug
**GET** `/api/products/slug/:slug`

Get product by its slug identifier.

#### Get All Categories
**GET** `/api/categories`

Get list of all product categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "headphones",
    "description": "High-quality headphones for immersive audio experience",
    "created_at": "2025-08-27 09:08:00"
  }
]
```

#### Get Category by ID
**GET** `/api/categories/:id`

Get category details with all products in that category.

### User Routes (Authenticated)

#### Mark Product as Viewed
**GET** `/api/products/:id/view`

Mark a product as viewed by the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Product marked as viewed"
}
```

#### Add to Cart
**POST** `/api/basket/add`

Add product to user's shopping cart.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

#### Get Cart
**GET** `/api/basket`

Get current user's shopping cart.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Remove from Cart
**DELETE** `/api/basket/:product_id`

Remove product from user's cart.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Checkout
**POST** `/api/checkout`

Create order from cart items.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shipping_address": "123 Main St, City, Country",
  "payment_method": "credit_card"
}
```

#### Get User Orders
**GET** `/api/orders`

Get current user's order history.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Get Order by ID
**GET** `/api/orders/:id`

Get specific order details for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Admin Routes

All admin routes require admin authentication and are prefixed with `/api/admin`.

#### Products (Admin)

##### Get All Products
**GET** `/api/admin/products`

Get all products for admin management.

**Headers:**
```
Authorization: Bearer <access_token>
```

##### Get Product by ID
**GET** `/api/admin/products/:id`

Get specific product details.

##### Create Product
**POST** `/api/admin/products`

Create a new product.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "A new product description",
  "price": 999,
  "currency": "USD",
  "is_new": true,
  "category_id": 1,
  "image_url": "./assets/new-product.jpg",
  "features": "Product features",
  "box_details": "Box contents"
}
```

##### Update Product
**PUT** `/api/admin/products/:id`

Update an existing product.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 1299,
  "description": "Updated description"
}
```

##### Delete Product
**DELETE** `/api/admin/products/:id`

Delete a product.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Categories (Admin)

##### Get All Categories
**GET** `/api/admin/categories`

Get all categories for admin management.

##### Get Category by ID
**GET** `/api/admin/categories/:id`

Get specific category details.

##### Create Category
**POST** `/api/admin/categories`

Create a new category.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Description for new category"
}
```

##### Update Category
**PUT** `/api/admin/categories/:id`

Update an existing category.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

##### Delete Category
**DELETE** `/api/admin/categories/:id`

Delete a category (only if no products are in the category).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Orders (Admin)

##### Get All Orders
**GET** `/api/admin/orders`

Get all orders from all users.

**Headers:**
```
Authorization: Bearer <access_token>
```

##### Get Order by ID
**GET** `/api/admin/orders/:id`

Get specific order details.

**Headers:**
```
Authorization: Bearer <access_token>
```

##### Update Order Status
**PUT** `/api/admin/orders/:id/status`

Update order status.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Available Status Values:**
- `pending`
- `shipped`
- `delivered`
- `cancelled`

## Error Responses

### Authentication Errors
```json
{
  "message": "Access token required"
}
```

```json
{
  "message": "Invalid or expired token"
}
```

### Validation Errors
```json
{
  "errors": [
    {
      "msg": "Product name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### Not Found Errors
```json
{
  "message": "Product not found"
}
```

### Server Errors
```json
{
  "message": "Internal server error"
}
```

## Data Models

### Product
```json
{
  "id": 1,
  "name": "Product Name",
  "slug": "product-slug",
  "description": "Product description",
  "image_url": "./assets/product.jpg",
  "price": 999,
  "currency": "USD",
  "is_new": true,
  "features": "Product features",
  "box_details": "Box contents",
  "category_id": 1,
  "created_at": "2025-08-27 09:08:00",
  "category": {
    "id": 1,
    "name": "category-name",
    "description": "Category description"
  }
}
```

### Category
```json
{
  "id": 1,
  "name": "category-name",
  "description": "Category description",
  "created_at": "2025-08-27 09:08:00"
}
```

### Order
```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 1998,
  "status": "pending",
  "shipping_address": "123 Main St, City, Country",
  "payment_method": "credit_card",
  "created_at": "2025-08-27 09:08:00",
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 2,
      "price_at_purchase": 999,
      "product": {
        "id": 1,
        "name": "Product Name",
        "image_url": "./assets/product.jpg",
        "slug": "product-slug",
        "price": 999
      }
    }
  ]
}
```

### Cart Item
```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "quantity": 2,
  "created_at": "2025-08-27 09:08:00",
  "product": {
    "id": 1,
    "name": "Product Name",
    "price": 999,
    "image_url": "./assets/product.jpg",
    "slug": "product-slug"
  }
}
```

## Usage Examples

### 1. Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin1234"}'
```

### 2. Get All Products
```bash
curl -X GET http://localhost:3000/api/products
```

### 3. Add Product to Cart (Authenticated)
```bash
curl -X POST http://localhost:3000/api/basket/add \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### 4. Create Product (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "slug": "new-product",
    "description": "A new product",
    "price": 999,
    "category_id": 1
  }'
```

## Postman Collection

Import the `Audiophile_API_Postman_Collection.json` file into Postman for a complete set of pre-configured requests.

### Postman Variables
- `base_url`: `http://localhost:3000`
- `access_token`: Your JWT access token
- `refresh_token`: Your JWT refresh token

### Setup Instructions
1. Import the collection into Postman
2. Set the `base_url` variable to your server URL
3. Run the "Login" request to get your access token
4. The token will be automatically saved to the `access_token` variable
5. All authenticated requests will now work automatically

## Rate Limiting
Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

## CORS
The API is configured to accept requests from `http://localhost:4200` (Angular dev server). Update the CORS configuration for production.

## Security Notes
- Always use HTTPS in production
- Implement proper input validation
- Consider implementing API rate limiting
- Regularly rotate JWT secrets
- Implement proper error logging
- Use environment variables for sensitive configuration
