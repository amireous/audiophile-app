import db from '../models/database';
import { Category, Product } from '../models/types';

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories ORDER BY name', [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Category[]);
        }
      });
    });
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? (row as Category) : null);
        }
      });
    });
  }

  static async getCategoryWithProducts(id: number): Promise<{ category: Category; products: Product[] } | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
        if (err) {
          reject(err);
        } else if (!category) {
          resolve(null);
        } else {
          // Get products for this category
          const query = `
            SELECT p.*, c.name as category_name, c.description as category_description
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            ORDER BY p.created_at DESC
          `;
          
          db.all(query, [id], (err, products) => {
            if (err) {
              reject(err);
            } else {
              const formattedProducts = products.map((row: any) => ({
                ...row,
                is_new: Boolean(row.is_new),
                category: row.category_name ? {
                  id: row.category_id,
                  name: row.category_name,
                  description: row.category_description
                } : undefined
              }));
              
              resolve({
                category: category as Category,
                products: formattedProducts
              });
            }
          });
        }
      });
    });
  }

  static async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    return new Promise((resolve, reject) => {
      const { name, description } = categoryData;

      db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const category: Category = {
              id: this.lastID,
              name,
              description,
              created_at: new Date().toISOString()
            };
            resolve(category);
          }
        }
      );
    });
  }

  static async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | null> {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(categoryData).filter(key => key !== 'id' && key !== 'created_at');
      const values = fields.map(field => categoryData[field as keyof Category]);
      
      if (fields.length === 0) {
        resolve(null);
        return;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE categories SET ${setClause} WHERE id = ?`;
      
      db.run(query, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          CategoryService.getCategoryById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  static async deleteCategory(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if category has products
      db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (row.count > 0) {
          reject(new Error('Cannot delete category with existing products'));
        } else {
          db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes > 0);
            }
          });
        }
      });
    });
  }
}
