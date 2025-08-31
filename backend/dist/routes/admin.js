"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const categoryController_1 = require("../controllers/categoryController");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply admin authentication to all routes
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
// Admin Product routes
router.get('/products', productController_1.ProductController.getAllProducts);
router.get('/products/:id', productController_1.ProductController.getProductById);
router.post('/products', productController_1.createProductValidation, productController_1.ProductController.createProduct);
router.put('/products/:id', productController_1.updateProductValidation, productController_1.ProductController.updateProduct);
router.delete('/products/:id', productController_1.ProductController.deleteProduct);
// Admin Category routes
router.get('/categories', categoryController_1.CategoryController.getAllCategories);
router.get('/categories/:id', categoryController_1.CategoryController.getCategoryById);
router.post('/categories', categoryController_1.createCategoryValidation, categoryController_1.CategoryController.createCategory);
router.put('/categories/:id', categoryController_1.updateCategoryValidation, categoryController_1.CategoryController.updateCategory);
router.delete('/categories/:id', categoryController_1.CategoryController.deleteCategory);
// Admin Order routes
router.get('/orders', orderController_1.OrderController.getAllOrders);
router.get('/orders/:id', orderController_1.OrderController.getOrderById);
router.put('/orders/:id/status', orderController_1.updateOrderStatusValidation, orderController_1.OrderController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=admin.js.map