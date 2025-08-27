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
      role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
