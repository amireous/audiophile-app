"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const database_1 = __importDefault(require("../models/database"));
class OrderService {
    // Cart operations
    static async addToCart(userId, productId, quantity = 1) {
        return new Promise((resolve, reject) => {
            // Check if item already exists in cart
            database_1.default.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
                if (err) {
                    reject(err);
                }
                else if (existingItem) {
                    // Update quantity
                    const newQuantity = existingItem.quantity + quantity;
                    database_1.default.run('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [newQuantity, userId, productId], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve({ ...existingItem, quantity: newQuantity });
                        }
                    });
                }
                else {
                    // Add new item
                    database_1.default.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve({
                                id: this.lastID,
                                user_id: userId,
                                product_id: productId,
                                quantity,
                                created_at: new Date().toISOString()
                            });
                        }
                    });
                }
            });
        });
    }
    static async getCart(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT c.*, p.name, p.price, p.image_url, p.slug
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `;
            database_1.default.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    const cartItems = rows.map((row) => ({
                        id: row.id,
                        user_id: row.user_id,
                        product_id: row.product_id,
                        quantity: row.quantity,
                        created_at: row.created_at,
                        product: {
                            id: row.product_id,
                            name: row.name,
                            price: row.price,
                            image_url: row.image_url,
                            slug: row.slug
                        }
                    }));
                    resolve(cartItems);
                }
            });
        });
    }
    static async removeFromCart(userId, productId) {
        return new Promise((resolve, reject) => {
            database_1.default.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    static async clearCart(userId) {
        return new Promise((resolve, reject) => {
            database_1.default.run('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // Order operations
    static async createOrderFromPayload(userId, shippingAddress, paymentMethod, totalAmount, items, billingDetails) {
        return new Promise((resolve, reject) => {
            database_1.default.serialize(() => {
                // Create order with provided data
                database_1.default.run('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)', [userId, totalAmount, shippingAddress, paymentMethod], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const orderId = this.lastID;
                        // Create order items from provided data
                        let completed = 0;
                        items.forEach(item => {
                            database_1.default.run('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)', [orderId, item.product_id, item.quantity, item.price], (err) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    completed++;
                                    if (completed === items.length) {
                                        // Clear cart after successful order creation
                                        OrderService.clearCart(userId).then(() => {
                                            resolve({
                                                id: orderId,
                                                user_id: userId,
                                                total_amount: totalAmount,
                                                status: 'pending',
                                                shipping_address: shippingAddress,
                                                payment_method: paymentMethod,
                                                created_at: new Date().toISOString()
                                            });
                                        }).catch(reject);
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    }
    static async createOrder(userId, shippingAddress, paymentMethod) {
        return new Promise((resolve, reject) => {
            database_1.default.serialize(() => {
                // Get cart items
                database_1.default.all('SELECT * FROM cart WHERE user_id = ?', [userId], (err, cartItems) => {
                    if (err) {
                        reject(err);
                    }
                    else if (cartItems.length === 0) {
                        reject(new Error('Cart is empty'));
                    }
                    else {
                        // Calculate total
                        const productIds = cartItems.map(item => item.product_id);
                        const placeholders = productIds.map(() => '?').join(',');
                        database_1.default.all(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                const productMap = new Map(products.map(p => [p.id, p.price]));
                                const totalAmount = cartItems.reduce((total, item) => {
                                    const price = productMap.get(item.product_id) || 0;
                                    return total + (price * item.quantity);
                                }, 0);
                                // Create order
                                database_1.default.run('INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)', [userId, totalAmount, shippingAddress, paymentMethod], function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        const orderId = this.lastID;
                                        // Create order items
                                        const orderItems = cartItems.map(item => ({
                                            order_id: orderId,
                                            product_id: item.product_id,
                                            quantity: item.quantity,
                                            price_at_purchase: productMap.get(item.product_id) || 0
                                        }));
                                        let completed = 0;
                                        orderItems.forEach(item => {
                                            database_1.default.run('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)', [item.order_id, item.product_id, item.quantity, item.price_at_purchase], (err) => {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    completed++;
                                                    if (completed === orderItems.length) {
                                                        // Clear cart
                                                        OrderService.clearCart(userId).then(() => {
                                                            resolve({
                                                                id: orderId,
                                                                user_id: userId,
                                                                total_amount: totalAmount,
                                                                status: 'pending',
                                                                shipping_address: shippingAddress,
                                                                payment_method: paymentMethod,
                                                                created_at: new Date().toISOString()
                                                            });
                                                        }).catch(reject);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    static async getUserOrders(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;
            database_1.default.all(query, [userId], (err, orders) => {
                if (err) {
                    reject(err);
                }
                else {
                    // For each order, get its items
                    const ordersWithItems = orders.map((order) => {
                        return new Promise((resolveOrder, rejectOrder) => {
                            const itemsQuery = `
                SELECT oi.*, p.name, p.image_url, p.slug, p.price
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id
              `;
                            database_1.default.all(itemsQuery, [order.id], (itemsErr, items) => {
                                if (itemsErr) {
                                    rejectOrder(itemsErr);
                                }
                                else {
                                    const orderWithItems = {
                                        ...order,
                                        items: items.map((item) => ({
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
                                                price: item.price
                                            }
                                        }))
                                    };
                                    resolveOrder(orderWithItems);
                                }
                            });
                        });
                    });
                    Promise.all(ordersWithItems)
                        .then((ordersWithItemsData) => {
                        resolve(ordersWithItemsData);
                    })
                        .catch(reject);
                }
            });
        });
    }
    static async getAllOrders() {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `;
            database_1.default.all(query, [], (err, orders) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(orders);
                }
            });
        });
    }
    static async getOrderById(orderId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;
            database_1.default.get(query, [orderId], (err, order) => {
                if (err) {
                    reject(err);
                }
                else if (!order) {
                    resolve(null);
                }
                else {
                    // Get order items
                    const itemsQuery = `
            SELECT oi.*, p.name, p.image_url, p.slug
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `;
                    database_1.default.all(itemsQuery, [orderId], (err, items) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            const orderItems = items.map((item) => ({
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
                            resolve({
                                ...order,
                                items: orderItems
                            });
                        }
                    });
                }
            });
        });
    }
    static async updateOrderStatus(orderId, status) {
        return new Promise((resolve, reject) => {
            database_1.default.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null);
                }
                else {
                    OrderService.getOrderById(orderId).then(resolve).catch(reject);
                }
            });
        });
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=orderService.js.map