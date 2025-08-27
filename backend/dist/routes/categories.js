"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', categoryController_1.CategoryController.getAllCategories);
router.get('/:id', categoryController_1.CategoryController.getCategoryById);
// Admin routes (protected)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, categoryController_1.createCategoryValidation, categoryController_1.CategoryController.createCategory);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, categoryController_1.updateCategoryValidation, categoryController_1.CategoryController.updateCategory);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, categoryController_1.CategoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map