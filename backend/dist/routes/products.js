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
// User routes (authenticated)
router.get('/:id/view', auth_1.authenticateToken, productController_1.ProductController.markAsViewed);
// Note: Admin routes are now handled in /api/admin/products
exports.default = router;
//# sourceMappingURL=products.js.map