"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
// Public routes
router.get('/', categoryController_1.CategoryController.getAllCategories);
router.get('/:id', categoryController_1.CategoryController.getCategoryById);
// Note: Admin routes are now handled in /api/admin/categories
exports.default = router;
//# sourceMappingURL=categories.js.map