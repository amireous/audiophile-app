const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load data from data.json
function loadDataFromJson() {
  try {
    const dataPath = path.join(__dirname, '../src/assets/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading data.json:', error);
    return [];
  }
}

// Transform data.json format to our API format
function transformProductData(jsonData) {
  const categoryMap = {
    'headphones': 1,
    'speakers': 2,
    'earphones': 3
  };

  return jsonData.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image_url: product.image.desktop, // Use desktop image as default
    price: product.price,
    currency: 'USD',
    is_new: product.new,
    features: product.features,
    box_details: product.includes.map(item => `${item.quantity}x ${item.item}`).join('\n'),
    category_id: categoryMap[product.category] || 1,
    category: {
      id: categoryMap[product.category] || 1,
      name: product.category,
      description: getCategoryDescription(product.category)
    },
    gallery: product.gallery,
    others: product.others
  }));
}

function getCategoryDescription(category) {
  const descriptions = {
    'headphones': 'High-quality headphones for immersive audio experience',
    'speakers': 'Premium speakers for home and studio use',
    'earphones': 'Wireless earphones for on-the-go listening'
  };
  return descriptions[category] || 'Premium audio equipment';
}

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (for simplicity)
let users = [
  {
    id: 1,
    username: 'admin',
    password_hash: bcrypt.hashSync('admin1234', 10),
    email: 'admin@audiophile.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin'
  }
];

let categories = [
  { id: 1, name: 'headphones', description: 'High-quality headphones for immersive audio experience' },
  { id: 2, name: 'speakers', description: 'Premium speakers for home and studio use' },
  { id: 3, name: 'earphones', description: 'Wireless earphones for on-the-go listening' }
];

// Load products from data.json
const jsonData = loadDataFromJson();
let products = transformProductData(jsonData);

let orders = [];
let cart = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Audiophile API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { userId: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, 'your-refresh-secret', { expiresIn: '7d' });
  
  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  jwt.verify(refresh_token, 'your-refresh-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const payload = { userId: user.userId, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });
    
    res.json({ access_token: accessToken });
  });
});

// Public endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const category = categories.find(c => c.id === id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const categoryProducts = products.filter(p => p.category_id === id);
  res.json({ ...category, products: categoryProducts });
});

// Customer endpoints (authenticated)
app.post('/api/basket/add', authenticateToken, (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.userId;
  
  const existingItem = cart.find(item => item.user_id === userId && item.product_id === product_id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ user_id: userId, product_id, quantity });
  }
  
  res.json({ message: 'Item added to cart' });
});

app.get('/api/basket', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userCart = cart.filter(item => item.user_id === userId);
  
  const cartWithProducts = userCart.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return { ...item, product };
  });
  
  res.json(cartWithProducts);
});

app.post('/api/checkout', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { shipping_address, payment_method } = req.body;
  
  const userCart = cart.filter(item => item.user_id === userId);
  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const total_amount = userCart.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id);
    return total + (product.price * item.quantity);
  }, 0);
  
  const order = {
    id: orders.length + 1,
    user_id: userId,
    total_amount,
    status: 'pending',
    shipping_address,
    payment_method,
    created_at: new Date().toISOString(),
    items: userCart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        product: { id: product.id, name: product.name, image_url: product.image_url, slug: product.slug }
      };
    })
  };
  
  orders.push(order);
  
  // Clear user's cart
  cart = cart.filter(item => item.user_id !== userId);
  
  res.json(order);
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userOrders = orders.filter(order => order.user_id === userId);
  res.json(userOrders);
});

// Admin endpoints
app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  res.json(products);
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, slug, description, image_url, price, currency, is_new, features, box_details, category_id } = req.body;
  
  const newProduct = {
    id: products.length + 1,
    name,
    slug,
    description,
    image_url,
    price: parseFloat(price),
    currency: currency || 'USD',
    is_new: Boolean(is_new),
    features,
    box_details,
    category_id: parseInt(category_id),
    category: categories.find(c => c.id === parseInt(category_id))
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const updatedProduct = { ...products[productIndex], ...req.body };
  products[productIndex] = updatedProduct;
  
  res.json(updatedProduct);
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

app.get('/api/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  res.json(categories);
});

app.post('/api/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  const { name, description } = req.body;
  
  const newCategory = {
    id: categories.length + 1,
    name,
    description
  };
  
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/admin/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const categoryIndex = categories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const updatedCategory = { ...categories[categoryIndex], ...req.body };
  categories[categoryIndex] = updatedCategory;
  
  res.json(updatedCategory);
});

app.delete('/api/admin/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const categoryIndex = categories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // Check if category has products
  const hasProducts = products.some(p => p.category_id === id);
  if (hasProducts) {
    return res.status(400).json({ error: 'Cannot delete category with existing products' });
  }
  
  categories.splice(categoryIndex, 1);
  res.json({ message: 'Category deleted successfully' });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  res.json(orders[orderIndex]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API root: http://localhost:${PORT}/api`);
  console.log(`Default admin user: admin / admin1234`);
  console.log(`Loaded ${products.length} products from data.json`);
  console.log(`Categories: ${categories.map(c => c.name).join(', ')}`);
});
