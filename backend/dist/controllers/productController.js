"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductValidation = exports.createProductValidation = exports.ProductController = void 0;
const express_validator_1 = require("express-validator");
const productService_1 = require("../services/productService");
class ProductController {
    // Public endpoints
    static async getAllProducts(req, res) {
        try {
            const products = await productService_1.ProductService.getAllProducts();
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getProductById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }
            const product = await productService_1.ProductService.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getProductBySlug(req, res) {
        try {
            const { slug } = req.params;
            const product = await productService_1.ProductService.getProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    // Admin endpoints
    static async createProduct(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const productData = req.body;
            const product = await productService_1.ProductService.createProduct(productData);
            res.status(201).json(product);
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
    static async updateProduct(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }
            const productData = req.body;
            const product = await productService_1.ProductService.updateProduct(id, productData);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
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
    static async deleteProduct(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }
            const deleted = await productService_1.ProductService.deleteProduct(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.ProductController = ProductController;
// Validation middleware
exports.createProductValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('slug').notEmpty().withMessage('Product slug is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    (0, express_validator_1.body)('currency').optional().isString(),
    (0, express_validator_1.body)('is_new').optional().isBoolean(),
    (0, express_validator_1.body)('category_id').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('features').optional().isString(),
    (0, express_validator_1.body)('box_details').optional().isString()
];
exports.updateProductValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    (0, express_validator_1.body)('slug').optional().notEmpty().withMessage('Product slug cannot be empty'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
    (0, express_validator_1.body)('currency').optional().isString(),
    (0, express_validator_1.body)('is_new').optional().isBoolean(),
    (0, express_validator_1.body)('category_id').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('features').optional().isString(),
    (0, express_validator_1.body)('box_details').optional().isString()
];
//# sourceMappingURL=productController.js.map