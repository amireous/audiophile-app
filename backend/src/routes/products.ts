import { Router } from 'express';
import { ProductController, createProductValidation, updateProductValidation } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.get('/slug/:slug', ProductController.getProductBySlug);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, createProductValidation, ProductController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProductValidation, ProductController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

export default router;
