import db from '../models/database';
import { Order, OrderItem, CartItem } from '../models/types';

export class OrderService {
  // Cart operations
  static async addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartItem> {
    return new Promise((resolve, reject) => {
      // Check if item already exists in cart
      db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
        if (err) {
          reject(err);
        } else if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          db.run('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', 
            [newQuantity, userId, productId], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ ...existingItem, quantity: newQuantity });
            }
          });
        } else {
          // Add new item
          db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', 
            [userId, productId, quantity], function(err) {
            if (err) {
              reject(err);
            } else {
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

  static async getCart(userId: number): Promise<CartItem[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, p.name, p.price, p.image_url, p.slug
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const cartItems = rows.map((row: any) => ({
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

  static async removeFromCart(userId: number, productId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async clearCart(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Order operations
  static async createOrder(userId: number, shippingAddress: string, paymentMethod: string): Promise<Order> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Get cart items
        db.all('SELECT * FROM cart WHERE user_id = ?', [userId], (err, cartItems) => {
          if (err) {
            reject(err);
          } else if (cartItems.length === 0) {
            reject(new Error('Cart is empty'));
          } else {
            // Calculate total
            const productIds = cartItems.map(item => item.product_id);
            const placeholders = productIds.map(() => '?').join(',');
            
            db.all(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
              if (err) {
                reject(err);
              } else {
                const productMap = new Map(products.map(p => [p.id, p.price]));
                const totalAmount = cartItems.reduce((total, item) => {
                  const price = productMap.get(item.product_id) || 0;
                  return total + (price * item.quantity);
                }, 0);

                // Create order
                db.run(
                  'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
                  [userId, totalAmount, shippingAddress, paymentMethod],
                  function(err) {
                    if (err) {
                      reject(err);
                    } else {
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
                        db.run(
                          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                          [item.order_id, item.product_id, item.quantity, item.price_at_purchase],
                          (err) => {
                            if (err) {
                              reject(err);
                            } else {
                              completed++;
                              if (completed === orderItems.length) {
                                // Clear cart
                                this.clearCart(userId).then(() => {
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
                          }
                        );
                      });
                    }
                  }
                );
              }
            });
          }
        });
      });
    });
  }

  static async getUserOrders(userId: number): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;
      
      db.all(query, [userId], (err, orders) => {
        if (err) {
          reject(err);
        } else {
          resolve(orders);
        }
      });
    });
  }

  static async getAllOrders(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `;
      
      db.all(query, [], (err, orders) => {
        if (err) {
          reject(err);
        } else {
          resolve(orders);
        }
      });
    });
  }

  static async getOrderById(orderId: number): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, u.username, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `;
      
      db.get(query, [orderId], (err, order) => {
        if (err) {
          reject(err);
        } else if (!order) {
          resolve(null);
        } else {
          // Get order items
          const itemsQuery = `
            SELECT oi.*, p.name, p.image_url, p.slug
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `;
          
          db.all(itemsQuery, [orderId], (err, items) => {
            if (err) {
              reject(err);
            } else {
              const orderItems = items.map((item: any) => ({
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price_at_purchase,
                product: {
                  id: item.product_id,
                  name: item.name,
                  image_url: item.image_url,
                  slug: item.slug
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

  static async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          this.getOrderById(orderId).then(resolve).catch(reject);
        }
      });
    });
  }
}
