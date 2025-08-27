# Audiophile E-commerce API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Most endpoints require a Bearer token in the Authorization header.

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin1234`

## API Endpoints

### 1. Health Check
**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-27T10:14:20.951Z"
}
```

### 2. API Information
**GET** `/api`

Get API information and available endpoints.

**Response:**
```json
{
  "message": "Audiophile API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "products": "/api/products",
    "categories": "/api/categories",
    "orders": "/api/orders",
    "admin": "/api/admin"
  }
}
```

## Authentication Endpoints

### 3. Login
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

### 4. Refresh Token
**POST** `/api/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token_here"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Public Endpoints (No Authentication Required)

### 5. Get All Products
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
    "features": "Experience unrivalled stereo sound...",
    "box_details": "2x Earphone units\n6x Multi-size earplugs...",
    "category_id": 3,
    "category": {
      "id": 3,
      "name": "earphones",
      "description": "Wireless earphones for on-the-go listening"
    }
  }
]
```

### 6. Get Product by ID
**GET** `/api/products/{id}`

Get detailed information about a specific product.

**Response:**
```json
{
  "id": 1,
  "name": "YX1 Wireless Earphones",
  "slug": "yx1-earphones",
  "description": "Tailor your listening experience...",
  "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
  "price": 599,
  "currency": "USD",
  "is_new": true,
  "features": "Experience unrivalled stereo sound...",
  "box_details": "2x Earphone units\n6x Multi-size earplugs...",
  "category_id": 3,
  "category": {
    "id": 3,
    "name": "earphones",
    "description": "Wireless earphones for on-the-go listening"
  }
}
```

### 7. Get All Categories
**GET** `/api/categories`

Get list of all product categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "headphones",
    "description": "High-quality headphones for immersive audio experience"
  },
  {
    "id": 2,
    "name": "speakers",
    "description": "Premium speakers for home and studio use"
  },
  {
    "id": 3,
    "name": "earphones",
    "description": "Wireless earphones for on-the-go listening"
  }
]
```

### 8. Get Category by ID with Products
**GET** `/api/categories/{id}`

Get category details with all products in that category.

**Response:**
```json
{
  "id": 1,
  "name": "headphones",
  "description": "High-quality headphones for immersive audio experience",
  "products": [
    {
      "id": 2,
      "name": "XX59 Headphones",
      "slug": "xx59-headphones",
      "description": "Enjoy your audio almost anywhere...",
      "image_url": "./assets/product-xx59-headphones/desktop/image-product.jpg",
      "price": 899,
      "currency": "USD",
      "is_new": false,
      "features": "These headphones have been created...",
      "box_details": "1x Headphone unit\n1x User manual...",
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "headphones",
        "description": "High-quality headphones for immersive audio experience"
      }
    }
  ]
}
```

## Customer Endpoints (Authentication Required)

### 9. Add to Cart
**POST** `/api/basket/add`

Add product to user's shopping cart.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Item added to cart"
}
```

### 10. Get Cart
**GET** `/api/basket`

Get current user's shopping cart.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
[
  {
    "user_id": 1,
    "product_id": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "YX1 Wireless Earphones",
      "slug": "yx1-earphones",
      "description": "Tailor your listening experience...",
      "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
      "price": 599,
      "currency": "USD",
      "is_new": true,
      "features": "Experience unrivalled stereo sound...",
      "box_details": "2x Earphone units\n6x Multi-size earplugs...",
      "category_id": 3,
      "category": {
        "id": 3,
        "name": "earphones",
        "description": "Wireless earphones for on-the-go listening"
      }
    }
  }
]
```

### 11. Checkout
**POST** `/api/checkout`

Create order from cart items.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "shipping_address": "123 Main St, City, Country",
  "payment_method": "credit_card"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 1198,
  "status": "pending",
  "shipping_address": "123 Main St, City, Country",
  "payment_method": "credit_card",
  "created_at": "2025-08-27T10:14:20.951Z",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price_at_purchase": 599,
      "product": {
        "id": 1,
        "name": "YX1 Wireless Earphones",
        "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
        "slug": "yx1-earphones"
      }
    }
  ]
}
```

### 12. Get User Orders
**GET** `/api/orders`

Get current user's order history.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "total_amount": 1198,
    "status": "pending",
    "shipping_address": "123 Main St, City, Country",
    "payment_method": "credit_card",
    "created_at": "2025-08-27T10:14:20.951Z",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price_at_purchase": 599,
        "product": {
          "id": 1,
          "name": "YX1 Wireless Earphones",
          "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
          "slug": "yx1-earphones"
        }
      }
    ]
  }
]
```

## Admin Endpoints (Admin Role Required)

### 13. Get All Products (Admin)
**GET** `/api/admin/products`

Get all products for admin management.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:** Same as public products endpoint but requires admin role.

### 14. Create Product
**POST** `/api/admin/products`

Create a new product.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Test Product",
  "slug": "new-test-product",
  "description": "A new test product for demonstration",
  "image_url": "./assets/product-test/desktop/image-product.jpg",
  "price": 999,
  "currency": "USD",
  "is_new": true,
  "features": "This is a test product with amazing features",
  "box_details": "1x Product unit\n1x User manual\n1x Cable",
  "category_id": 1
}
```

**Response:**
```json
{
  "id": 7,
  "name": "New Test Product",
  "slug": "new-test-product",
  "description": "A new test product for demonstration",
  "image_url": "./assets/product-test/desktop/image-product.jpg",
  "price": 999,
  "currency": "USD",
  "is_new": true,
  "features": "This is a test product with amazing features",
  "box_details": "1x Product unit\n1x User manual\n1x Cable",
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "headphones",
    "description": "High-quality headphones for immersive audio experience"
  }
}
```

### 15. Update Product
**PUT** `/api/admin/products/{id}`

Update an existing product.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 1299,
  "description": "Updated product description"
}
```

**Response:** Updated product object.

### 16. Delete Product
**DELETE** `/api/admin/products/{id}`

Delete a product.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

### 17. Get All Categories (Admin)
**GET** `/api/admin/categories`

Get all categories for admin management.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:** Same as public categories endpoint but requires admin role.

### 18. Create Category
**POST** `/api/admin/categories`

Create a new category.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "new-category",
  "description": "A new category for testing"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "new-category",
  "description": "A new category for testing"
}
```

### 19. Update Category
**PUT** `/api/admin/categories/{id}`

Update an existing category.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "updated-category",
  "description": "Updated category description"
}
```

**Response:** Updated category object.

### 20. Delete Category
**DELETE** `/api/admin/categories/{id}`

Delete a category (only if no products in category).

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

### 21. Get All Orders (Admin)
**GET** `/api/admin/orders`

Get all orders from all users.

**Headers:**
```
Authorization: Bearer your_access_token_here
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "total_amount": 1198,
    "status": "pending",
    "shipping_address": "123 Main St, City, Country",
    "payment_method": "credit_card",
    "created_at": "2025-08-27T10:14:20.951Z",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price_at_purchase": 599,
        "product": {
          "id": 1,
          "name": "YX1 Wireless Earphones",
          "image_url": "./assets/product-yx1-earphones/desktop/image-product.jpg",
          "slug": "yx1-earphones"
        }
      }
    ]
  }
]
```

### 22. Update Order Status
**PUT** `/api/admin/orders/{id}/status`

Update order status.

**Headers:**
```
Authorization: Bearer your_access_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Status Values:**
- `pending`
- `shipped`
- `delivered`
- `cancelled`

**Response:** Updated order object.

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 400 Bad Request
```json
{
  "error": "Cart is empty"
}
```

## How to Use with Postman

1. **Import the Collection**: Import the `Audiophile_API_Postman_Collection.json` file into Postman.

2. **Set Variables**: The collection uses these variables:
   - `base_url`: http://localhost:3000
   - `access_token`: Will be automatically set after login
   - `refresh_token`: Will be automatically set after login

3. **Authentication Flow**:
   - First, run the "Login" request to get tokens
   - Tokens will be automatically saved to collection variables
   - All authenticated requests will use the Bearer token automatically

4. **Testing Order**:
   - Health Check → API Information → Login
   - Test public endpoints
   - Test customer endpoints (requires login)
   - Test admin endpoints (requires admin login)

## Available Products

The API comes with 6 pre-loaded products:

1. **YX1 Wireless Earphones** - $599 (New)
2. **XX59 Headphones** - $899
3. **XX99 Mark I Headphones** - $1,750
4. **XX99 Mark II Headphones** - $2,999 (New)
5. **ZX7 Speaker** - $3,500
6. **ZX9 Speaker** - $4,500 (New)

## Available Categories

1. **headphones** - High-quality headphones for immersive audio experience
2. **speakers** - Premium speakers for home and studio use
3. **earphones** - Wireless earphones for on-the-go listening
