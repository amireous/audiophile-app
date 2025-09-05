import db from '../models/database';
import { Product, Category } from '../models/types';

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const products = rows.map((row: any) => ({
            ...row,
            is_new: Boolean(row.is_new),
            category: row.category_name ? {
              id: row.category_id,
              name: row.category_name,
              description: row.category_description
            } : undefined
          }));
          resolve(products);
        }
      });
    });
  }

  static async getProductById(id: number): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `;
      
      db.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
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
          resolve(product);
        }
      });
    });
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `;
      
      db.get(query, [slug], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
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
          resolve(product);
        }
      });
    });
  }

  static async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    return new Promise((resolve, reject) => {
      const {
        name, slug, description, image_url, price, currency, is_new,
        features, box_details, category_id
      } = productData;

      db.run(
        `INSERT INTO products (name, slug, description, image_url, price, currency, is_new, features, box_details, category_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slug, description, image_url, price, currency, is_new ? 1 : 0, features, box_details, category_id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const product: Product = {
              id: this.lastID,
              name,
              slug,
              description,
              image_url,
              price,
              currency,
              is_new,
              features,
              box_details,
              category_id,
              created_at: new Date().toISOString()
            };
            resolve(product);
          }
        }
      );
    });
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(productData).filter(key => key !== 'id' && key !== 'created_at');
      const values = fields.map(field => productData[field as keyof Product]);
      
      if (fields.length === 0) {
        resolve(null);
        return;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE products SET ${setClause} WHERE id = ?`;
      
      db.run(query, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          ProductService.getProductById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  static async deleteProduct(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ?
        ORDER BY p.created_at DESC
      `;
      
      db.all(query, [categoryId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const products = rows.map((row: any) => ({
            ...row,
            is_new: Boolean(row.is_new),
            category: row.category_name ? {
              id: row.category_id,
              name: row.category_name,
              description: row.category_description
            } : undefined
          }));
          resolve(products);
        }
      });
    });
  }

  static async markAsViewed(productId: number, userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // First check if product exists
      db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) {
          reject(err);
        } else if (!product) {
          resolve(false);
        } else {
          // Check if view record already exists
          db.get('SELECT id FROM product_views WHERE product_id = ? AND user_id = ?', 
            [productId, userId], (err, existingView) => {
            if (err) {
              reject(err);
            } else if (existingView) {
              // Update existing view timestamp
              db.run('UPDATE product_views SET viewed_at = ? WHERE product_id = ? AND user_id = ?',
                [new Date().toISOString(), productId, userId], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            } else {
              // Create new view record
              db.run('INSERT INTO product_views (product_id, user_id, viewed_at) VALUES (?, ?, ?)',
                [productId, userId, new Date().toISOString()], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            }
          });
        }
      });
    });
  }
}
