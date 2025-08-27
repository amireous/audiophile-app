"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', productController_1.ProductController.getAllProducts);
router.get('/:id', productController_1.ProductController.getProductById);
router.get('/slug/:slug', productController_1.ProductController.getProductBySlug);
// Admin routes (protected)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.createProductValidation, productController_1.ProductController.createProduct);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.updateProductValidation, productController_1.ProductController.updateProduct);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.ProductController.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map