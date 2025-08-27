"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = __importDefault(require("../models/database"));
class CategoryService {
    static async getAllCategories() {
        return new Promise((resolve, reject) => {
            database_1.default.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    static async getCategoryById(id) {
        return new Promise((resolve, reject) => {
            database_1.default.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    static async getCategoryWithProducts(id) {
        return new Promise((resolve, reject) => {
            database_1.default.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
                if (err) {
                    reject(err);
                }
                else if (!category) {
                    resolve(null);
                }
                else {
                    // Get products for this category
                    const query = `
            SELECT p.*, c.name as category_name, c.description as category_description
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            ORDER BY p.created_at DESC
          `;
                    database_1.default.all(query, [id], (err, products) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            const formattedProducts = products.map((row) => ({
                                ...row,
                                is_new: Boolean(row.is_new),
                                category: row.category_name ? {
                                    id: row.category_id,
                                    name: row.category_name,
                                    description: row.category_description
                                } : undefined
                            }));
                            resolve({
                                category,
                                products: formattedProducts
                            });
                        }
                    });
                }
            });
        });
    }
    static async createCategory(categoryData) {
        return new Promise((resolve, reject) => {
            const { name, description } = categoryData;
            database_1.default.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    const category = {
                        id: this.lastID,
                        name,
                        description,
                        created_at: new Date().toISOString()
                    };
                    resolve(category);
                }
            });
        });
    }
    static async updateCategory(id, categoryData) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(categoryData).filter(key => key !== 'id' && key !== 'created_at');
            const values = fields.map(field => categoryData[field]);
            if (fields.length === 0) {
                resolve(null);
                return;
            }
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const query = `UPDATE categories SET ${setClause} WHERE id = ?`;
            database_1.default.run(query, [...values, id], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null);
                }
                else {
                    this.getCategoryById(id).then(resolve).catch(reject);
                }
            });
        });
    }
    static async deleteCategory(id) {
        return new Promise((resolve, reject) => {
            // Check if category has products
            database_1.default.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row.count > 0) {
                    reject(new Error('Cannot delete category with existing products'));
                }
                else {
                    database_1.default.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(this.changes > 0);
                        }
                    });
                }
            });
        });
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=categoryService.js.map