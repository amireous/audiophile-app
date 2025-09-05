"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Customer routes (authenticated)
router.post('/basket/add', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.addToCartValidation, orderController_1.OrderController.addToCart);
router.get('/basket', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getCart);
router.delete('/basket', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.clearCart);
router.delete('/basket/:product_id', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.removeFromCart);
router.post('/checkout', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.checkoutValidation, orderController_1.OrderController.checkout);
router.get('/orders', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getUserOrders);
router.get('/orders/:id', auth_1.authenticateToken, auth_1.requireCustomer, orderController_1.OrderController.getOrderById);
// Note: Admin routes are now handled in /api/admin/orders
exports.default = router;
//# sourceMappingURL=orders.js.map