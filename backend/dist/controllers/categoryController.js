"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryValidation = exports.createCategoryValidation = exports.CategoryController = void 0;
const express_validator_1 = require("express-validator");
const categoryService_1 = require("../services/categoryService");
class CategoryController {
    // Public endpoints
    static async getAllCategories(req, res) {
        try {
            const categories = await categoryService_1.CategoryService.getAllCategories();
            res.json(categories);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getCategoryById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
            const result = await categoryService_1.CategoryService.getCategoryWithProducts(id);
            if (!result) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    // Admin endpoints
    static async createCategory(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const categoryData = req.body;
            const category = await categoryService_1.CategoryService.createCategory(categoryData);
            res.status(201).json(category);
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
    static async updateCategory(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
            const categoryData = req.body;
            const category = await categoryService_1.CategoryService.updateCategory(id, categoryData);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(category);
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
    static async deleteCategory(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
            const deleted = await categoryService_1.CategoryService.deleteCategory(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ message: 'Category deleted successfully' });
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
exports.CategoryController = CategoryController;
// Validation middleware
exports.createCategoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('description').optional().isString()
];
exports.updateCategoryValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Category name cannot be empty'),
    (0, express_validator_1.body)('description').optional().isString()
];
//# sourceMappingURL=categoryController.js.map