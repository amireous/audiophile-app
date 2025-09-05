import { Router } from 'express';
import { CategoryController, createCategoryValidation, updateCategoryValidation } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Note: Admin routes are now handled in /api/admin/categories

export default router;
