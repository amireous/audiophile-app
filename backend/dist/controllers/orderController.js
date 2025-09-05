"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusValidation = exports.checkoutValidation = exports.addToCartValidation = exports.OrderController = void 0;
const express_validator_1 = require("express-validator");
const orderService_1 = require("../services/orderService");
class OrderController {
    // Cart endpoints (authenticated customers)
    static async addToCart(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = req.user.userId;
            const { product_id, quantity = 1 } = req.body;
            const cartItem = await orderService_1.OrderService.addToCart(userId, product_id, quantity);
            res.json(cartItem);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    static async getCart(req, res) {
        try {
            const userId = req.user.userId;
            const cart = await orderService_1.OrderService.getCart(userId);
            res.json(cart);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async removeFromCart(req, res) {
        try {
            const userId = req.user.userId;
            const { product_id } = req.params;
            const removed = await orderService_1.OrderService.removeFromCart(userId, parseInt(product_id));
            if (!removed) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }
            res.json({ message: 'Item removed from cart' });
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async clearCart(req, res) {
        try {
            const userId = req.user.userId;
            await orderService_1.OrderService.clearCart(userId);
            res.json({ message: 'Cart cleared successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    // Order endpoints (authenticated customers)
    static async checkout(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = req.user.userId;
            const { shipping_address, payment_method, total_amount, items, billing_details } = req.body;
            const order = await orderService_1.OrderService.createOrderFromPayload(userId, shipping_address, payment_method, total_amount, items, billing_details);
            res.status(201).json(order);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
    static async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            const orders = await orderService_1.OrderService.getUserOrders(userId);
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getOrderById(req, res) {
        try {
            const orderId = parseInt(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: 'Invalid order ID' });
            }
            const order = await orderService_1.OrderService.getOrderById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            // Check if user can access this order
            const userId = req.user.userId;
            const userRole = req.user.role;
            if (userRole !== 'admin' && order.user_id !== userId) {
                return res.status(403).json({ message: 'Access denied' });
            }
            res.json(order);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    // Admin endpoints
    static async getAllOrders(req, res) {
        try {
            const orders = await orderService_1.OrderService.getAllOrders();
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async updateOrderStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const orderId = parseInt(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: 'Invalid order ID' });
            }
            const { status } = req.body;
            const order = await orderService_1.OrderService.updateOrderStatus(orderId, status);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(order);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
}
exports.OrderController = OrderController;
// Validation middleware
exports.addToCartValidation = [
    (0, express_validator_1.body)('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];
exports.checkoutValidation = [
    (0, express_validator_1.body)('shipping_address').notEmpty().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('payment_method').notEmpty().withMessage('Payment method is required'),
    (0, express_validator_1.body)('total_amount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
    (0, express_validator_1.body)('items.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    (0, express_validator_1.body)('billing_details').optional().isObject().withMessage('Billing details must be an object'),
    (0, express_validator_1.body)('billing_details.name').optional().notEmpty().withMessage('Billing name is required if provided'),
    (0, express_validator_1.body)('billing_details.email').optional().isEmail().withMessage('Valid billing email is required if provided'),
    (0, express_validator_1.body)('billing_details.phone').optional().notEmpty().withMessage('Billing phone is required if provided')
];
exports.updateOrderStatusValidation = [
    (0, express_validator_1.body)('status').isIn(['pending', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
];
//# sourceMappingURL=orderController.js.map