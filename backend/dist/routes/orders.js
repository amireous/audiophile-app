"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Customer routes (authenticated)
router.post('/basket/add', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.addToCartValidation, orderController_1.OrderController.addToCart);
router.get('/basket', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getCart);
router.delete('/basket/:product_id', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.removeFromCart);
router.post('/checkout', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.checkoutValidation, orderController_1.OrderController.checkout);
router.get('/orders', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getUserOrders);
router.get('/orders/:id', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getOrderById);
// Admin routes (protected)
router.get('/admin/orders', auth_1.authenticateToken, auth_1.requireAdmin, orderController_1.OrderController.getAllOrders);
router.put('/admin/orders/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, orderController_1.updateOrderStatusValidation, orderController_1.OrderController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map