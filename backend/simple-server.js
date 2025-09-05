const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      profile_pic_url TEXT,
      phone TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add new columns if they don't exist (for existing databases)
  db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding phone column:', err.message);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN address TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding address column:', err.message);
    }
  });

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      price DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      is_new BOOLEAN DEFAULT 0,
      features TEXT,
      box_details TEXT,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // Cart items table
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
      shipping_address TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Order items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
  `);

  // Create default admin user
  db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      bcrypt.hash('admin1234', 10, (err, hash) => {
        if (!err) {
          db.run(
            'INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin', hash, 'admin@audiophile.com', 'Admin', 'User', 'admin']
          );
          console.log('Default admin user created (username: admin, password: admin1234)');
        }
      });
    }
  });

  // Seed categories
  const categories = [
    { name: 'headphones', description: 'High-quality headphones for immersive audio experience' },
    { name: 'speakers', description: 'Premium speakers for home and studio use' },
    { name: 'earphones', description: 'Wireless earphones for on-the-go listening' }
  ];

  categories.forEach(category => {
    db.run('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)', 
      [category.name, category.description]);
  });

  // Seed products
  const products = [
    {
      name: 'YX1 Wireless Earphones',
      slug: 'yx1-earphones',
      description: 'Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones.',
      image_url: './assets/product-yx1-earphones/desktop/image-product.jpg',
      price: 599,
      is_new: 1,
      category_id: 3
    },
    {
      name: 'XX59 Headphones',
      slug: 'xx59-headphones',
      description: 'Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones.',
      image_url: './assets/product-xx59-headphones/desktop/image-product.jpg',
      price: 899,
      is_new: 0,
      category_id: 1
    },
    {
      name: 'XX99 Mark I Headphones',
      slug: 'xx99-mark-one-headphones',
      description: 'As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction.',
      image_url: './assets/product-xx99-mark-one-headphones/desktop/image-product.jpg',
      price: 1750,
      is_new: 0,
      category_id: 1
    },
    {
      name: 'XX99 Mark II Headphones',
      slug: 'xx99-mark-two-headphones',
      description: 'The new XX99 Mark II headphones is the pinnacle of pristine audio.',
      image_url: './assets/product-xx99-mark-two-headphones/desktop/image-product.jpg',
      price: 2999,
      is_new: 1,
      category_id: 1
    },
    {
      name: 'ZX7 Speaker',
      slug: 'zx7-speaker',
      description: 'Stream high quality sound wirelessly with minimal to no loss.',
      image_url: './assets/product-zx7-speaker/desktop/image-product.jpg',
      price: 3500,
      is_new: 0,
      category_id: 2
    },
    {
      name: 'ZX9 Speaker',
      slug: 'zx9-speaker',
      description: 'Upgrade your sound system with the all new ZX9 active speaker.',
      image_url: './assets/product-zx9-speaker/desktop/image-product.jpg',
      price: 4500,
      is_new: 1,
      category_id: 2
    }
  ];

  products.forEach(product => {
    db.run(`
      INSERT OR IGNORE INTO products (name, slug, description, image_url, price, is_new, category_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product.name, product.slug, product.description, product.image_url, product.price, product.is_new, product.category_id]);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all products
app.get('/api/products', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, c.description as category_description
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const products = rows.map(row => ({
        ...row,
        is_new: Boolean(row.is_new),
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      }));
      res.json(products);
    }
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT p.*, c.name as category_name, c.description as category_description
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      const product = {
        ...row,
        is_new: Boolean(row.is_new),
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      };
      res.json(product);
    }
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    'SELECT id, username, password_hash, email, first_name, last_name, role FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
          if (err || !isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
          } else {
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
          }
        });
      }
    }
  );
});

// Profile endpoint
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.get(
    'SELECT id, username, email, first_name, last_name, profile_pic_url, phone, address, role, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_pic_url: user.profile_pic_url,
          phone: user.phone,
          address: user.address,
          role: user.role,
          created_at: user.created_at
        });
      }
    }
  );
});

// Update profile endpoint
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { first_name, last_name, email, profile_pic_url, phone, address } = req.body;
  
  // Build dynamic update query based on provided fields
  const updates = [];
  const values = [];
  
  if (first_name !== undefined) {
    updates.push('first_name = ?');
    values.push(first_name);
  }
  if (last_name !== undefined) {
    updates.push('last_name = ?');
    values.push(last_name);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }
  if (profile_pic_url !== undefined) {
    updates.push('profile_pic_url = ?');
    values.push(profile_pic_url);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  values.push(userId);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Profile updated successfully' });
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, password, email, first_name, last_name } = req.body;
  
  // Check if user already exists
  db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (existingUser) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      // Hash password and create user
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          db.run(
            'INSERT INTO users (username, password_hash, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hash, email, first_name || '', last_name || '', 'customer'],
            function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
              } else {
                res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
              }
            }
          );
        }
      });
    }
  });
});

// Refresh token endpoint
app.post('/api/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  jwt.verify(refresh_token, 'your-refresh-secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
    
    const payload = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    const accessToken = jwt.sign(payload, 'your-secret-key', { expiresIn: '15m' });
    
    res.json({ access_token: accessToken });
  });
});

// Get product by slug
app.get('/api/products/slug/:slug', (req, res) => {
  const slug = req.params.slug;
  const query = `
    SELECT p.*, c.name as category_name, c.description as category_description
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
  `;
  
  db.get(query, [slug], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      const product = {
        ...row,
        is_new: Boolean(row.is_new),
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      };
      res.json(product);
    }
  });
});

// Mark product as viewed
app.get('/api/products/:id/view', authenticateToken, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.userId;
  
  // For now, just return success (you could add a views table later)
  res.json({ success: true, message: 'Product marked as viewed' });
});

// Get category by ID
app.get('/api/categories/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!category) {
      res.status(404).json({ error: 'Category not found' });
    } else {
      // Get products in this category
      db.all(
        'SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC',
        [id],
        (err, products) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({
              ...category,
              products: products.map(p => ({
                ...p,
                is_new: Boolean(p.is_new)
              }))
            });
          }
        }
      );
    }
  });
});

// Cart/Basket endpoints
app.get('/api/basket', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const query = `
    SELECT 
      ci.id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      p.name,
      p.slug,
      p.description,
      p.image_url,
      p.price,
      p.currency,
      p.is_new,
      p.category_id
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const cartItems = rows.map(row => ({
        id: row.id,
        product_id: row.product_id,
        quantity: row.quantity,
        created_at: row.created_at,
        product: {
          id: row.product_id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          image_url: row.image_url,
          price: row.price,
          currency: row.currency,
          is_new: Boolean(row.is_new),
          category_id: row.category_id
        }
      }));
      res.json(cartItems);
    }
  });
});

app.post('/api/basket/add', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { product_id, quantity = 1 } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  
  // Check if product exists
  db.get('SELECT id FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if item already exists in cart
    db.get('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        db.run(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newQuantity, existingItem.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.json({ 
                message: 'Product quantity updated in cart', 
                cart_item: { 
                  id: existingItem.id,
                  product_id, 
                  quantity: newQuantity 
                } 
              });
            }
          }
        );
      } else {
        // Add new item to cart
        db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.json({ 
                message: 'Product added to cart', 
                cart_item: { 
                  id: this.lastID,
                  product_id, 
                  quantity 
                } 
              });
            }
          }
        );
      }
    });
  });
});

app.delete('/api/basket/:product_id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const productId = req.params.product_id;
  
  db.run(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found in cart' });
      } else {
        res.json({ message: 'Product removed from cart' });
      }
    }
  );
});

app.put('/api/basket/:product_id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const productId = req.params.product_id;
  const { quantity } = req.body;
  
  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }
  
  db.run(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
    [quantity, userId, productId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found in cart' });
      } else {
        res.json({ message: 'Cart item updated' });
      }
    }
  );
});

app.delete('/api/basket', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Cart cleared' });
    }
  });
});

// Order endpoints
app.post('/api/checkout', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { shipping_address, payment_method, total_amount, items } = req.body;
  
  if (!shipping_address || !payment_method || !total_amount || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: shipping_address, payment_method, total_amount, items' });
  }
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Create the order
    db.run(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)',
      [userId, total_amount, 'pending', shipping_address, payment_method],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        const orderId = this.lastID;
        let itemsProcessed = 0;
        let hasError = false;
        
        // Add order items
        items.forEach((item, index) => {
          db.run(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price],
            function(err) {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              itemsProcessed++;
              if (itemsProcessed === items.length && !hasError) {
                // Clear the user's cart after successful checkout
                db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                  if (err) {
                    console.log('Warning: Could not clear cart after checkout:', err.message);
                  }
                  
                  // Commit transaction
                  db.run('COMMIT', (err) => {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                    
                    // Return the created order
                    res.status(201).json({
                      id: orderId,
                      user_id: userId,
                      total_amount: total_amount,
                      status: 'pending',
                      shipping_address: shipping_address,
                      payment_method: payment_method,
                      created_at: new Date().toISOString(),
                      items: items
                    });
                  });
                });
              }
            }
          );
        });
      }
    );
  });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const query = `
    SELECT 
      o.id,
      o.user_id,
      o.total_amount,
      o.status,
      o.shipping_address,
      o.payment_method,
      o.created_at,
      o.updated_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const orders = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        total_amount: row.total_amount,
        status: row.status,
        shipping_address: row.shipping_address,
        payment_method: row.payment_method,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
      res.json(orders);
    }
  });
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const orderId = req.params.id;
  
  // First get the order
  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price_at_purchase,
          p.name,
          p.image_url,
          p.slug
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.created_at
      `;
      
      db.all(itemsQuery, [orderId], (err, items) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const orderItems = items.map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
          product: {
            id: item.product_id,
            name: item.name,
            image_url: item.image_url,
            slug: item.slug,
            price: item.price_at_purchase
          }
        }));
        
        res.json({
          id: order.id,
          user_id: order.user_id,
          total_amount: order.total_amount,
          status: order.status,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: orderItems
        });
      });
    }
  );
});

// Admin endpoints
app.get('/api/admin/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const query = `
    SELECT p.*, c.name as category_name, c.description as category_description
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const products = rows.map(row => ({
        ...row,
        is_new: Boolean(row.is_new),
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description
        } : undefined
      }));
      res.json(products);
    }
  });
});

app.post('/api/admin/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, slug, description, price, category_id, image_url, is_new, features, box_details } = req.body;
  
  db.run(
    'INSERT INTO products (name, slug, description, price, category_id, image_url, is_new, features, box_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, slug, description, price, category_id, image_url, is_new ? 1 : 0, features, box_details],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ message: 'Product created successfully', productId: this.lastID });
      }
    }
  );
});

app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const productId = req.params.id;
  const { name, slug, description, price, category_id, image_url, is_new, features, box_details } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_new = ?, features = ?, box_details = ? WHERE id = ?',
    [name, slug, description, price, category_id, image_url, is_new ? 1 : 0, features, box_details, productId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Product updated successfully' });
      }
    }
  );
});

app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const productId = req.params.id;
  
  db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

app.get('/api/admin/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/admin/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, description } = req.body;
  
  db.run(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ message: 'Category created successfully', categoryId: this.lastID });
      }
    }
  );
});

app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const categoryId = req.params.id;
  const { name, description } = req.body;
  
  db.run(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description, categoryId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Category updated successfully' });
      }
    }
  );
});

app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const categoryId = req.params.id;
  
  db.run('DELETE FROM categories WHERE id = ?', [categoryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Category deleted successfully' });
    }
  });
});

app.get('/api/admin/orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const query = `
    SELECT 
      o.id,
      o.user_id,
      o.total_amount,
      o.status,
      o.shipping_address,
      o.payment_method,
      o.created_at,
      o.updated_at,
      u.username,
      u.email,
      u.first_name,
      u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const orders = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        total_amount: row.total_amount,
        status: row.status,
        shipping_address: row.shipping_address,
        payment_method: row.payment_method,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          username: row.username,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name
        }
      }));
      res.json(orders);
    }
  });
});

app.get('/api/admin/orders/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const orderId = req.params.id;
  
  // First get the order with user info
  const orderQuery = `
    SELECT 
      o.*,
      u.username,
      u.email,
      u.first_name,
      u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `;
  
  db.get(orderQuery, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        p.name,
        p.image_url,
        p.slug
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at
    `;
    
    db.all(itemsQuery, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const orderItems = items.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        product: {
          id: item.product_id,
          name: item.name,
          image_url: item.image_url,
          slug: item.slug,
          price: item.price_at_purchase
        }
      }));
      
      res.json({
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: {
          id: order.user_id,
          username: order.username,
          email: order.email,
          first_name: order.first_name,
          last_name: order.last_name
        },
        items: orderItems
      });
    });
  });
});

app.put('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const orderId = req.params.id;
  const { status } = req.body;
  
  if (!status || !['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: pending, shipped, delivered, cancelled' });
  }
  
  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
      } else {
        res.json({ message: 'Order status updated successfully', status });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
