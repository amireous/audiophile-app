import { Router } from 'express';
import { ProductController, createProductValidation, updateProductValidation } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.get('/slug/:slug', ProductController.getProductBySlug);

// User routes (authenticated)
router.get('/:id/view', authenticateToken, ProductController.markAsViewed);

// Note: Admin routes are now handled in /api/admin/products

export default router;
