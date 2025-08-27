"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const database_1 = __importDefault(require("../models/database"));
class ProductService {
    static async getAllProducts() {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `;
            database_1.default.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    const products = rows.map((row) => ({
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
    static async getProductById(id) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `;
            database_1.default.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (!row) {
                    resolve(null);
                }
                else {
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
    static async getProductBySlug(slug) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `;
            database_1.default.get(query, [slug], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (!row) {
                    resolve(null);
                }
                else {
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
    static async createProduct(productData) {
        return new Promise((resolve, reject) => {
            const { name, slug, description, image_url, price, currency, is_new, features, box_details, category_id } = productData;
            database_1.default.run(`INSERT INTO products (name, slug, description, image_url, price, currency, is_new, features, box_details, category_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, slug, description, image_url, price, currency, is_new ? 1 : 0, features, box_details, category_id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    const product = {
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
            });
        });
    }
    static async updateProduct(id, productData) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(productData).filter(key => key !== 'id' && key !== 'created_at');
            const values = fields.map(field => productData[field]);
            if (fields.length === 0) {
                resolve(null);
                return;
            }
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const query = `UPDATE products SET ${setClause} WHERE id = ?`;
            database_1.default.run(query, [...values, id], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null);
                }
                else {
                    this.getProductById(id).then(resolve).catch(reject);
                }
            });
        });
    }
    static async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            database_1.default.run('DELETE FROM products WHERE id = ?', [id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    static async getProductsByCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ?
        ORDER BY p.created_at DESC
      `;
            database_1.default.all(query, [categoryId], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    const products = rows.map((row) => ({
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
}
exports.ProductService = ProductService;
//# sourceMappingURL=productService.js.map